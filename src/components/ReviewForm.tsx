import { useEffect, useRef, useState, type SubmitEvent } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { starIcon } from '../lib/icons'
import { useAuth } from '../features/auth/context'
import { validateReview, type ReviewInput } from '../features/reviews/review'
import './ReviewForm.css'

export default function ReviewForm() {
  const { user, displayName } = useAuth()
  return user ? <AccountReviewForm key={user.id} userId={user.id} defaultName={displayName} /> : null
}

function AccountReviewForm({ userId, defaultName }: { userId: string; defaultName: string }) {
  const [input, setInput] = useState<ReviewInput>({ display_name: defaultName, rating: 5, title: '', comment: '' })
  const [consent, setConsent] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadFailed, setLoadFailed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [exists, setExists] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [version, setVersion] = useState(0)
  const request = useRef<AbortController | null>(null)
  const pending = useRef(false)
  useEffect(() => {
    const controller = new AbortController()
    request.current = controller
    import('../api/reviews').then(api => api.getOwnReview(userId, controller.signal)).then(review => {
      if (controller.signal.aborted) return
      if (review) { setInput({ display_name: review.display_name, rating: review.rating, title: review.title, comment: review.comment }); setExists(true) }
      setError('')
      setLoadFailed(false)
    }).catch(() => { if (!controller.signal.aborted) { setLoadFailed(true); setError('投稿済みレビューを確認できませんでした。再読み込みしてください。') } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => { controller.abort(); request.current?.abort() }
  }, [userId, version])
  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending.current || !consent || loading || loadFailed) return
    setError(''); setMessage('')
    let value: ReviewInput
    try { value = validateReview(input) } catch (error) { setError(error instanceof Error ? error.message : '入力内容を確認してください。'); return }
    pending.current = true
    setBusy(true)
    const controller = new AbortController()
    request.current = controller
    try {
      const { saveReview } = await import('../api/reviews')
      await saveReview(userId, value, controller.signal)
      if (!controller.signal.aborted) { setExists(true); setInput(value); setConsent(false); setMessage('レビューを公開しました。ホームページでは投稿日時が新しい6件を表示します。') }
    } catch { if (!controller.signal.aborted) setError('投稿できませんでした。通信状態を確認して再試行してください。') }
    finally { pending.current = false; if (!controller.signal.aborted) setBusy(false) }
  }
  function update<K extends keyof ReviewInput>(key: K, value: ReviewInput[K]) { setInput(current => ({ ...current, [key]: value })); setConsent(false); setMessage('') }
  return <section className="review-form-section" aria-labelledby="review-form-title">
    <h2 id="review-form-title"><FontAwesomeIcon icon={starIcon} aria-hidden="true" /> アプリのレビュー</h2>
    <p>使ってみた感想を聞かせてください。1アカウントにつき1件投稿でき、あとから更新できます。</p>
    {loading && <p role="status">投稿済みレビューを確認しています…</p>}
    <form onSubmit={event => { void submit(event) }}>
      <fieldset disabled={loading || busy || loadFailed}>
        <label>公開する表示名<input value={input.display_name} required maxLength={40} onChange={event => update('display_name', event.target.value)} autoComplete="nickname" /><small>1〜20文字。メールアドレスや本名など、公開したくない情報は入力しないでください。</small></label>
        <label>評価<select value={input.rating} onChange={event => update('rating', Number(event.target.value))}>{[5, 4, 3, 2, 1].map(value => <option key={value} value={value}>{'★'.repeat(value)}（{value}点）</option>)}</select></label>
        <label>見出し<input value={input.title} required maxLength={120} onChange={event => update('title', event.target.value)} placeholder="例：短い時間でも練習しやすい" /><small>1〜60文字</small></label>
        <label>コメント<textarea value={input.comment} required rows={5} maxLength={1000} onChange={event => update('comment', event.target.value)} placeholder="使いやすかった点や、改善してほしい点など" /><small>{[...input.comment.trim()].length} / 500文字（10文字以上）</small></label>
        <label className="review-form-consent"><input type="checkbox" required checked={consent} onChange={event => setConsent(event.target.checked)} /><span>表示名・評価・見出し・コメントがホームページで公開されることに同意します。</span></label>
        <button type="submit" disabled={!consent}>{busy ? '投稿中…' : exists ? 'レビューを更新して公開' : 'レビューを公開する'}</button>
      </fieldset>
    </form>
    {error && <div role="alert"><p className="review-form-error">{error}</p>{!busy && <button type="button" onClick={() => { setLoading(true); setVersion(current => current + 1) }}>投稿済みレビューを再読み込み</button>}</div>}
    {message && <p className="review-form-success" role="status">{message}</p>}
  </section>
}
