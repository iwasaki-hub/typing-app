import { useEffect, useReducer, useRef, useState, type SubmitEvent } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { globeIcon, arrowRightIcon, rotateLeftIcon } from '../../../lib/icons'
import { useLocale } from '../../../features/locale/useLocale'
import { countries, countryRound, regionLabels, type Country, type CountryRegion } from '../../../features/learning/countries'
import { learningReducer, newLearningSession, type LearnMode } from '../../../features/learning/session'
import { useAutoAdvance } from '../../../features/learning/useAutoAdvance'
import './CountryPracticePage.css'

export default function CountryPracticePage() {
  const { t, locale } = useLocale()
  const [region, setRegion] = useState<CountryRegion | 'all'>('all')
  const [state, dispatch] = useReducer(learningReducer<Country>, undefined, () => newLearningSession(countryRound('all'), 'guide'))
  useAutoAdvance(state, dispatch)
  const input = useRef<HTMLInputElement>(null)
  const summary = useRef<HTMLHeadingElement>(null)
  const nextButton = useRef<HTMLButtonElement>(null)
  const [inputNotice, setInputNotice] = useState('')
  const current = state.order[state.index]
  const answered = state.feedback === 'correct' || state.feedback === 'skipped'
  const showEnglish = state.mode === 'guide' || state.hinted || answered
  const correct = state.answers.filter(answer => !answer.skipped).length
  const independent = state.answers.filter(answer => !answer.skipped && !answer.hinted && answer.mistakes === 0).length
  useEffect(() => {
    if (state.finished) summary.current?.focus()
    else input.current?.focus()
  }, [state.index, state.order, state.finished])
  useEffect(() => { if (answered) nextButton.current?.focus() }, [answered])
  function restart(nextRegion = region, mode: LearnMode = state.mode) {
    setRegion(nextRegion); setInputNotice('')
    dispatch({ type: 'reset', order: countryRound(nextRegion), mode })
  }
  function check(event: SubmitEvent<HTMLFormElement>) { event.preventDefault(); dispatch({ type: 'check' }) }
  return <main id="main" tabIndex={-1} className="learning-page">
    <header className="learning-intro"><Link to="/practice">{t('← 練習メニューに戻る')}</Link><span className="learning-eyebrow">TYPE & LEARN</span><h1><FontAwesomeIcon icon={globeIcon} aria-hidden="true" /> {t('世界の国名を、指先から。')}</h1><p>{t('国旗と国名を見ながら、英語のスペルを覚えよう。20か国から、1回最大10問を出題します。')}</p></header>
    <section className="learning-card" aria-labelledby="learning-title">
      <div className="learning-heading"><h2 id="learning-title">{t('国名タイピング')}</h2><span className="learning-badge">{t('英語の国名を入力')}</span></div>
      <div className="learning-settings">
        <label>{t('地域')}<select value={region} onChange={event => restart(event.target.value as CountryRegion | 'all')}><option value="all">{t('世界の国々')}</option>{Object.entries(regionLabels).map(([value, label]) => <option key={value} value={value}>{t(label)}</option>)}</select></label>
        <label>{t('学び方')}<select value={state.mode} onChange={event => restart(region, event.target.value as LearnMode)}><option value="guide">{t('お手本を見て練習')}</option><option value="quiz">{t('思い出して入力')}</option></select></label>
      </div>
      <p className="learning-help">{t('地域・学び方を変更すると最初から始まります。時間制限はありません。')}</p>
      <p className="learning-help">{t('正しい答えを入力し終えると、自動で次の問題へ進みます。Enterキーは不要です。')}</p>
      {state.finished ? <div className="learning-summary">
        <h3 ref={summary} tabIndex={-1}>{t('おつかれさまでした！')}</h3>
        <p>{t('国旗と英語の国名を、もう一度振り返ってみましょう。')}</p>
        <dl className="learning-stats"><div><dt>{t('学習した国')}</dt><dd>{state.answers.length}</dd></div><div><dt>{t('正解した国')}</dt><dd>{correct}</dd></div><div><dt>{state.mode === 'guide' ? t('一度で正解') : t('ヒント・間違いなし')}</dt><dd>{independent}</dd></div></dl>
        <p className="learning-help">{state.mode === 'guide' ? t('今回は、お手本を見ながらの練習でした。次は「思い出して入力」にも挑戦してみましょう。') : t('答えを見たり間違えたりした国は、もう一度練習してみましょう。')}</p>
        <ul className="learning-recap">{state.answers.map(answer => <li key={answer.item.code}><img src={`/flags/${answer.item.code}.svg`} alt="" width="40" height="28" /><div><strong>{answer.item[locale]}</strong><span lang="en">{answer.item.english}</span></div><small>{answer.skipped ? t('答えを確認') : answer.hinted || answer.mistakes ? t('復習してみよう') : t('正解')}</small></li>)}</ul>
        <button className="learning-primary" type="button" onClick={() => restart()}><FontAwesomeIcon icon={rotateLeftIcon} aria-hidden="true" /> {t('もう一度学ぶ')}</button>
      </div> : <>
        <div className="learning-progress"><span>{t('第{0}問 / 全{1}問', [state.index + 1, state.order.length])}</span><progress max={state.order.length} value={state.answers.length} aria-label={t('学習の進み具合')} /></div>
        <div className="learning-prompt"><img src={`/flags/${current.code}.svg`} alt={t('{0}の国旗', [current[locale]])} width="100" height="70" /><div><span>{t(regionLabels[current.region])}</span><h3>{current[locale]}</h3></div></div>
        <p className="learning-instruction">{state.mode === 'guide' ? t('お手本と同じ英語の国名を入力してください。') : t('この国の英語名を思い出して入力してください。')}</p>
        <div className={`learning-target${showEnglish ? '' : ' is-hidden'}`}>
          {showEnglish ? <span lang="en" aria-label={current.english}>{[...current.english].map((letter, index) => <span key={index} className={state.mode === 'guide' && state.input[index] ? state.input[index].toLowerCase() === letter.toLowerCase() ? 'is-correct' : 'is-incorrect' : ''}>{letter}</span>)}</span> : <span>{t('英語では何というかな？')}</span>}
        </div>
        <form onSubmit={check}>
          <label htmlFor="country-answer">{t('国名を英語で入力')}</label>
          <input ref={input} id="country-answer" lang="en" value={state.input} disabled={answered} maxLength={64} required autoComplete="off" autoCapitalize="off" spellCheck={false} aria-describedby="country-input-help country-feedback" aria-invalid={state.feedback === 'incorrect'} onChange={event => {
            const value = event.target.value
            if (!/^[A-Za-z ]*$/.test(value)) setInputNotice('英字入力に切り替えてください。')
            else setInputNotice('')
            dispatch({ type: 'input', value })
          }} onPaste={event => { event.preventDefault(); setInputNotice('練習中は貼り付けできません。キーボードで入力してください。') }} onDrop={event => event.preventDefault()} placeholder={t('ここに英語の国名を入力')} />
          <p id="country-input-help" className="learning-help">{t(inputNotice || '大文字・小文字、前後と連続した空白は区別しません。表示される英語表記で入力してください。')}</p>
          <div id="country-feedback" className={`learning-feedback feedback-${state.feedback}`} role="status">
            {state.feedback === 'incorrect' ? t('もう少し！スペルを確認して、もう一度入力してみましょう。') : state.feedback === 'correct' ? t('正解！英語では {0} と書きます。', [current.english]) : state.feedback === 'skipped' ? t('答えは {0} です。次に出会ったとき、思い出してみましょう。', [current.english]) : ''}
          </div>
          <div className="learning-actions">
            {answered ? <button ref={nextButton} className="learning-primary" type="button" onClick={() => { setInputNotice(''); dispatch({ type: 'next' }) }}>{state.index === state.order.length - 1 ? t('学習結果を見る') : t('次の国へ')} <FontAwesomeIcon icon={arrowRightIcon} aria-hidden="true" /></button> : <>
              <button className="learning-primary" type="submit" disabled={!state.input.trim()}>{t('答え合わせ')}</button>
              {state.mode === 'quiz' && !state.hinted && <button type="button" onClick={() => dispatch({ type: 'hint' })}>{t('英語表記のヒントを見る')}</button>}
              <button type="button" onClick={() => dispatch({ type: 'skip' })}>{t('答えを確認して進む')}</button>
            </>}
          </div>
        </form>
      </>}
    </section>
    <aside className="learning-about"><h2>{t('少しずつ、世界を知ろう。')}</h2><p>{t('国名は一般的な英語表記を使っています。国旗・国名・地域を組み合わせて覚える学習モードです。通常のタイピング記録やランキングとは別に楽しめます。')}</p><p>{t('掲載国数：{0}か国。学習中の進み具合は、このページを離れるとリセットされます。', [countries.length])}</p><Link to="/practice/sentences">{t('通常のタイピング練習へ →')}</Link><p className="learning-source">Flags: <a href="https://flagpedia.net" target="_blank" rel="noopener noreferrer">Flagpedia / FlagCDN</a></p></aside>
  </main>
}
