import { useEffect, useRef, useState } from 'react'
import { fallbackQuotes, getFallbackQuote, getPracticeQuote } from '../api/quotes'
import TypingPractice from './TypingPractice'

export default function QuotePractice() {
  const [quote, setQuote] = useState(fallbackQuotes[0])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('英文を読み込んでいます…')
  const request = useRef<AbortController | null>(null)
  const pending = useRef(false)

  useEffect(() => {
    const controller = new AbortController()
    request.current = controller
    getPracticeQuote(undefined, controller.signal).then((next) => {
      if (controller.signal.aborted) return
      setQuote(next)
      setNotice('新しい英文を用意しました。')
    }).catch(() => {
      if (!controller.signal.aborted) setNotice('英文を取得できなかったため、用意した練習文を表示しています。')
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false)
    })
    return () => { request.current?.abort(); controller.abort() }
  }, [])

  async function nextQuestion() {
    if (loading || pending.current) return
    pending.current = true
    const controller = new AbortController()
    request.current = controller
    setLoading(true)
    setNotice('英文を読み込んでいます…')
    try {
      const next = await getPracticeQuote(quote.text, controller.signal)
      if (controller.signal.aborted) return
      setQuote(next)
      setNotice('新しい英文を用意しました。')
    } catch {
      if (controller.signal.aborted) return
      setQuote(getFallbackQuote(quote.text))
      setNotice('英文を取得できなかったため、用意した練習文を表示しています。')
    } finally {
      pending.current = false
      if (!controller.signal.aborted) setLoading(false)
    }
  }

  return <TypingPractice quote={quote} loading={loading} notice={notice} onNext={nextQuestion} />
}
