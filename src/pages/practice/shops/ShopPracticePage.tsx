import { useLearningHistory } from '../../../features/learning/useLearningHistory'
import LearningSaveNotice from '../../../components/learning/LearningSaveNotice'
import { useEffect, useReducer, useRef, useState, type SubmitEvent } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { storeIcon, arrowRightIcon, rotateLeftIcon, volumeHighIcon, volumeXmarkIcon } from '../../../lib/icons'
import { useLocale } from '../../../features/locale/useLocale'
import { shopCategories, shopRound, shopWords, type ShopCategory, type ShopWord } from '../../../features/learning/shops'
import { learningReducer, newLearningSession, isLearningInput, type LearnMode } from '../../../features/learning/session'
import { useAutoAdvance } from '../../../features/learning/useAutoAdvance'
import { usePronunciation } from '../../../features/learning/usePronunciation'
import { normalizeLearningAnswer } from '../../../features/learning/answer'
import './ShopPracticePage.css'

function ShopLogo({ shop }: { shop: ShopWord }) {
  const { t, locale } = useLocale()
  const [failed, setFailed] = useState(false)
  return <aside className="shop-logo-panel" aria-label={t('出題中のお店のロゴ')}>
    <span className="shop-logo-eyebrow">BRAND SPOTLIGHT</span>
    <div className="shop-logo-art">{failed ? <span className="shop-logo-fallback" aria-hidden="true">{shop.emoji}</span> : <img src={shop.logo} alt={t('{0}のロゴ', [shop[locale]])} onError={() => setFailed(true)} width="128" height="128" />}</div>
    <h3>{shop[locale]}</h3><p>{t(shopCategories[shop.category].label)}</p>
    <a href={`https://${shop.domain}`} target="_blank" rel="noopener noreferrer">{t('公式サイトを見る')} ↗</a>
    {failed && <p>{t('ロゴを表示できないため、カテゴリーのイラストを表示しています。')}</p>}
  </aside>
}

export default function ShopPracticePage() {
  const { t, locale } = useLocale()
  const [category, setCategory] = useState<ShopCategory>('coffee')
  const [state, dispatch] = useReducer(learningReducer<ShopWord>, undefined, () => newLearningSession(shopRound('coffee'), 'guide'))
  useAutoAdvance(state, dispatch)
  useLearningHistory(state, 'shops', shopCategories[category].label)
  const [notice, setNotice] = useState('')
  const [reviewing, setReviewing] = useState(false)
  const field = useRef<HTMLInputElement>(null)
  const nextButton = useRef<HTMLButtonElement>(null)
  const summary = useRef<HTMLHeadingElement>(null)
  const current = state.order[state.index]
  const pronunciation = usePronunciation(current.english, state.order, state.finished)
  const answered = state.feedback === 'correct' || state.feedback === 'skipped'
  const showEnglish = state.mode === 'guide' || state.hinted || answered
  const typed = normalizeLearningAnswer(state.input)
  const correct = state.answers.filter(answer => !answer.skipped).length
  const firstTry = state.answers.filter(answer => !answer.skipped && !answer.hinted && !answer.mistakes).length
  const reviewWords = state.answers.filter(answer => answer.skipped || answer.hinted || answer.mistakes).map(answer => answer.item)
  useEffect(() => {
    if (state.finished) summary.current?.focus()
    else field.current?.focus({ preventScroll: true })
  }, [state.order, state.index, state.finished])
  useEffect(() => { if (answered) nextButton.current?.focus() }, [answered])
  function restart(nextCategory = category, mode: LearnMode = state.mode) {
    setCategory(nextCategory); setNotice(''); setReviewing(false)
    dispatch({ type: 'reset', order: shopRound(nextCategory), mode })
  }
  function check(event: SubmitEvent<HTMLFormElement>) { event.preventDefault(); dispatch({ type: 'check' }) }
  return <main id="main" tabIndex={-1} className="learning-page shop-page">
    <header className="learning-intro"><Link to="/practice">{t('← 練習メニューに戻る')}</Link><span className="learning-eyebrow">SHOP & LEARN</span><h1><FontAwesomeIcon icon={storeIcon} aria-hidden="true" /> {t('知っているお店から、英語を覚えよう。')}</h1><p>{t('5つのカテゴリー、全20店。身近なチェーン店の英語名を、発音とロゴで覚えましょう。')}</p></header>
    <div className="shop-categories" role="group" aria-label={t('学習カテゴリー')}>
      {(Object.entries(shopCategories) as [ShopCategory, typeof shopCategories[ShopCategory]][]).map(([key, item]) => <button key={key} type="button" aria-pressed={category === key} onClick={() => restart(key)}><span aria-hidden="true">{item.emoji}</span><strong>{t(item.label)}</strong><small>{t('{0}店', [shopWords.filter(word => word.category === key).length])}</small></button>)}
    </div>
    <section className="learning-card" aria-labelledby="shop-title">
      <div className="learning-heading"><h2 id="shop-title">{t(shopCategories[category].label)}</h2><span className="learning-badge">{t('お店の英単語')}</span></div>
      <div className="learning-settings"><label>{t('学び方')}<select value={state.mode} onChange={event => restart(category, event.target.value as LearnMode)}><option value="guide">{t('お手本を見て練習')}</option><option value="quiz">{t('思い出して入力')}</option></select></label><div className="learning-pronunciation"><span>{t('発音の自動再生')}</span><button type="button" aria-pressed={pronunciation.enabled} disabled={!pronunciation.supported} onClick={pronunciation.toggle}><FontAwesomeIcon icon={pronunciation.enabled ? volumeHighIcon : volumeXmarkIcon} aria-hidden="true" /> {pronunciation.enabled ? 'ON' : 'OFF'}</button></div></div>
      {!pronunciation.supported && <p className="learning-help" role="status">{t('このブラウザでは音声を再生できません。練習はそのまま続けられます。')}</p>}
      {pronunciation.enabled && pronunciation.supported && <p className="learning-help">{t('英語の発音を出題時に再生します。設定はこの端末に保存されます。')}</p>}
      {pronunciation.enabled && pronunciation.supported && pronunciation.status && <p className="learning-help" role="status">{pronunciation.status === 'blocked' ? t('音声を開始するには「発音を聞く」を押してください。') : t('発音を再生できませんでした。「発音を聞く」で再試行できます。')}</p>}
      <p className="learning-help">{reviewing ? t('復習モード：ヒントを見た・間違えた・答えを確認した単語を、思い出して入力しましょう。') : t('カテゴリー・学び方を変更すると最初から始まります。1カテゴリー4問、時間制限はありません。')}</p>
      <p className="learning-help">{t('正しい答えを入力し終えると、自動で次の問題へ進みます。Enterキーは不要です。')}</p>
      {state.finished ? <div className="learning-summary"><LearningSaveNotice />
        <h3 ref={summary} tabIndex={-1}>{t('おつかれさまでした！')}</h3><p>{t('お店を見かけたら、英語の名前と発音を思い出してみましょう。')}</p>
        <dl className="learning-stats"><div><dt>{t('学習したお店')}</dt><dd>{state.answers.length}</dd></div><div><dt>{t('正解したお店')}</dt><dd>{correct}</dd></div><div><dt>{state.mode === 'guide' ? t('一度で正解') : t('ヒント・間違いなし')}</dt><dd>{firstTry}</dd></div></dl>
        <ul className="learning-recap">{state.answers.map(answer => <li key={answer.item.id}><span className="shop-recap-emoji" aria-hidden="true">{answer.item.emoji}</span><div><strong>{answer.item[locale]}</strong><span lang="en">{answer.item.english}</span></div><small>{answer.skipped ? t('答えを確認') : answer.hinted || answer.mistakes ? t('復習してみよう') : t('正解')}</small></li>)}</ul>
        <div className="learning-actions"><button type="button" className="learning-primary" onClick={() => restart()}><FontAwesomeIcon icon={rotateLeftIcon} aria-hidden="true" /> {t('このカテゴリーをもう一度')}</button>{reviewWords.length > 0 && <button type="button" onClick={() => { setNotice(''); setReviewing(true); dispatch({ type: 'reset', order: reviewWords, mode: 'quiz' }) }}>{t('復習が必要な単語だけ練習')}</button>}</div>
      </div> : <>
        <div className="learning-progress"><span>{t('第{0}問 / 全{1}問', [state.index + 1, state.order.length])}</span><progress max={state.order.length} value={state.answers.length} aria-label={t('学習の進み具合')} /></div>
        <div className="shop-practice-layout"><div className="shop-question"><div className="learning-prompt"><span className="shop-prompt-emoji" aria-hidden="true">{current.emoji}</span><div><span>{t(shopCategories[current.category].label)}</span><h3>{current[locale]}</h3></div></div>
        {pronunciation.enabled && pronunciation.supported && <button className="learning-listen" type="button" onClick={pronunciation.replay}><FontAwesomeIcon icon={volumeHighIcon} aria-hidden="true" /> {t('発音を聞く')}</button>}
        <p className="learning-instruction">{state.mode === 'guide' ? t('お店の名前を見ながら、英語表記を入力してください。') : t('このお店の英語名を思い出して入力してください。')}</p>
        <div className={`learning-target${showEnglish ? '' : ' is-hidden'}`}>{showEnglish ? <span lang="en" aria-label={current.english}>{[...current.english].map((letter, index) => <span key={index} className={state.mode === 'guide' && typed[index] ? typed[index] === letter.toLowerCase() ? 'is-correct' : 'is-incorrect' : ''}>{letter}</span>)}</span> : t('英語では何というかな？')}</div>
        <form onSubmit={check}>
          <label htmlFor="shop-answer">{t('英単語を入力')}</label>
          <input ref={field} id="shop-answer" lang="en" value={state.input} disabled={answered} required maxLength={64} autoComplete="off" autoCapitalize="off" spellCheck={false} aria-describedby="shop-help shop-feedback" aria-invalid={state.feedback === 'incorrect'} placeholder={t('ここに英単語を入力')} onChange={event => { const value = event.target.value; setNotice(isLearningInput(value, current) ? '' : '英字入力に切り替えてください。'); dispatch({ type: 'input', value }) }} onPaste={event => { event.preventDefault(); setNotice('練習中は貼り付けできません。キーボードで入力してください。') }} onDrop={event => event.preventDefault()} />
          <p className="learning-help" id="shop-help">{t(notice || "大文字・小文字は区別しません。アポストロフィー（'）やハイフン（-）もお手本どおりに入力してください。")}</p>
          <div className={`learning-feedback feedback-${state.feedback}`} id="shop-feedback" role="status">{state.feedback === 'incorrect' ? t('もう少し！スペルを確認して、もう一度入力してみましょう。') : state.feedback === 'correct' ? t('正解！英語では {0} と書きます。', [current.english]) : state.feedback === 'skipped' ? t('答えは {0} です。次に出会ったとき、思い出してみましょう。', [current.english]) : ''}</div>
          <div className="learning-actions">{answered ? <button ref={nextButton} className="learning-primary" type="button" onClick={() => { setNotice(''); dispatch({ type: 'next' }) }}>{state.index === state.order.length - 1 ? t('学習結果を見る') : t('次の単語へ')} <FontAwesomeIcon icon={arrowRightIcon} aria-hidden="true" /></button> : <><button className="learning-primary" type="submit" disabled={!state.input.trim()}>{t('答え合わせ')}</button>{state.mode === 'quiz' && !state.hinted && <button type="button" onClick={() => dispatch({ type: 'hint' })}>{t('英語表記のヒントを見る')}</button>}<button type="button" onClick={() => dispatch({ type: 'skip' })}>{t('答えを確認して進む')}</button></>}</div>
        </form></div><ShopLogo key={current.id} shop={current} /></div>
      </>}
    </section>
    <aside className="learning-about"><h2>{t('街のお店を、英語で見つけよう。')}</h2><p>{t('各社のロゴ・公式サイトのアイコンを使用しています。名称・ロゴの権利は各社に帰属し、このアプリとの提携を示すものではありません。')}</p><p>{t('学習を最後まで終えると結果を保存し、ダッシュボードで確認できます。途中の進行状態はページを離れるとリセットされます。')}</p></aside>
  </main>
}
