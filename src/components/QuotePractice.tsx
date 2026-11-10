import { useEffect, useRef, useState } from 'react'
import TypingPractice from './TypingPractice'
import { fallbackQuotes, getFallbackQuote, getPracticeQuote } from '../api/quotes'
import { practiceSamples, type PracticeLanguage } from '../features/typing/samples'

type LanguageProps = { onLanguageChange: (language: PracticeLanguage) => void }

function EnglishPractice({ onLanguageChange }: LanguageProps) {
  const [quote, setQuote] = useState(fallbackQuotes[0])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('英文を読み込んでいます…')
  const request = useRef<AbortController | null>(null)
  const pending = useRef(false)

  useEffect(() => {
    const controller = new AbortController()
    request.current = controller
    getPracticeQuote(undefined, controller.signal).then((next) => {
      if (!controller.signal.aborted) { setQuote(next); setNotice('新しい英文を用意しました。') }
    }).catch(() => {
      if (!controller.signal.aborted) setNotice('英文を取得できなかったため、アプリ内の例文を表示しています。')
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false)
    })
    return () => { controller.abort(); request.current?.abort() }
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
      if (!controller.signal.aborted) { setQuote(next); setNotice('新しい英文を用意しました。') }
    } catch {
      if (!controller.signal.aborted) { setQuote(getFallbackQuote(quote.text)); setNotice('英文を取得できなかったため、アプリ内の例文を表示しています。') }
    } finally {
      pending.current = false
      if (!controller.signal.aborted) setLoading(false)
    }
  }
  return <TypingPractice quote={quote} loading={loading} notice={notice} onNext={nextQuestion} onLanguageChange={onLanguageChange} />
}

function KoreanPractice({ onLanguageChange }: LanguageProps) {
  const [index, setIndex] = useState(0)
  const samples = practiceSamples.ko
  return <TypingPractice quote={{ text: samples[index], source: 'local', author: null, language: 'ko' }}
    loading={false} notice={`韓国語の例文 ${index + 1} / ${samples.length}`}
    onNext={() => setIndex((value) => (value + 1) % samples.length)} onLanguageChange={onLanguageChange} />
}

export default function QuotePractice() {
  const [language, setLanguage] = useState<PracticeLanguage>('en')
  return language === 'en' ? <EnglishPractice onLanguageChange={setLanguage} /> : <KoreanPractice onLanguageChange={setLanguage} />
}
