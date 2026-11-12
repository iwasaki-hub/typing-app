import { useLearningHistory } from '../../../features/learning/useLearningHistory'
import LearningSaveNotice from '../../../components/learning/LearningSaveNotice'
import { useEffect, useReducer, useRef, useState, type SubmitEvent } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { planeIcon, arrowRightIcon, rotateLeftIcon, volumeHighIcon, volumeXmarkIcon } from '../../../lib/icons'
import { useLocale } from '../../../features/locale/useLocale'
import { travelCategories, travelRound, travelPhrases, type TravelCategory, type TravelPhrase } from '../../../features/learning/travel'
import { learningReducer, newLearningSession, isLearningInput, type LearnMode } from '../../../features/learning/session'
import { useAutoAdvance } from '../../../features/learning/useAutoAdvance'
import { usePronunciation } from '../../../features/learning/usePronunciation'
import { normalizeLearningAnswer } from '../../../features/learning/answer'
import './TravelPracticePage.css'

export default function TravelPracticePage() {
  const { t, locale } = useLocale()
  const [category, setCategory] = useState<TravelCategory>('airport')
  const [state, dispatch] = useReducer(learningReducer<TravelPhrase>, undefined, () => newLearningSession(travelRound('airport'), 'guide'))
  useAutoAdvance(state, dispatch)
  useLearningHistory(state, 'travel', travelCategories[category].label)
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
    dispatch({ type: 'reset', order: travelRound(nextCategory), mode })
  }
  function check(event: SubmitEvent<HTMLFormElement>) { event.preventDefault(); dispatch({ type: 'check' }) }
  return <main id="main" tabIndex={-1} className="learning-page travel-page">
    <header className="learning-intro"><Link to="/practice">{t('← 練習メニューに戻る')}</Link><span className="learning-eyebrow">TRAVEL & TALK</span><h1><FontAwesomeIcon icon={planeIcon} aria-hidden="true" /> {t('旅先で使えるひとことを、指先から。')}</h1><p>{t('空港・ホテル・レストラン・買い物・交通。5つの場面、全30文の英会話を意味と発音で覚えましょう。')}</p></header>
    <div className="travel-categories" role="group" aria-label={t('学習カテゴリー')}>
      {(Object.entries(travelCategories) as [TravelCategory, typeof travelCategories[TravelCategory]][]).map(([key, item]) => <button key={key} type="button" aria-pressed={category === key} onClick={() => restart(key)}><span aria-hidden="true">{item.emoji}</span><strong>{t(item.label)}</strong><small>{t('{0}文', [travelPhrases.filter(word => word.category === key).length])}</small></button>)}
    </div>
    <section className="learning-card" aria-labelledby="travel-title">
      <div className="learning-heading"><h2 id="travel-title">{t(travelCategories[category].label)}</h2><span className="learning-badge">{t('旅行の英会話')}</span></div>
      <div className="learning-settings"><label>{t('学び方')}<select value={state.mode} onChange={event => restart(category, event.target.value as LearnMode)}><option value="guide">{t('お手本を見て練習')}</option><option value="quiz">{t('思い出して入力')}</option></select></label><div className="learning-pronunciation"><span>{t('発音の自動再生')}</span><button type="button" aria-pressed={pronunciation.enabled} disabled={!pronunciation.supported} onClick={pronunciation.toggle}><FontAwesomeIcon icon={pronunciation.enabled ? volumeHighIcon : volumeXmarkIcon} aria-hidden="true" /> {pronunciation.enabled ? 'ON' : 'OFF'}</button></div></div>
      {!pronunciation.supported && <p className="learning-help" role="status">{t('このブラウザでは音声を再生できません。練習はそのまま続けられます。')}</p>}
      {pronunciation.enabled && pronunciation.supported && <p className="learning-help">{t('英語の発音を出題時に再生します。設定はこの端末に保存されます。')}</p>}
      {pronunciation.enabled && pronunciation.supported && pronunciation.status && <p className="learning-help" role="status">{pronunciation.status === 'blocked' ? t('音声を開始するには「発音を聞く」を押してください。') : t('発音を再生できませんでした。「発音を聞く」で再試行できます。')}</p>}
      <p className="learning-help">{reviewing ? t('復習モード：ヒントを見た・間違えた・答えを確認したフレーズを、もう一度入力しましょう。') : t('カテゴリー・学び方を変更すると最初から始まります。1カテゴリー6問、時間制限はありません。')}</p>
      <p className="learning-help">{t('正しい答えを入力し終えると、自動で次の問題へ進みます。Enterキーは不要です。')}</p>
      {state.finished ? <div className="learning-summary"><LearningSaveNotice />
        <h3 ref={summary} tabIndex={-1}>{t('おつかれさまでした！')}</h3><p>{t('覚えたフレーズを声に出して、旅先で使う場面を思い浮かべてみましょう。')}</p>
        <dl className="learning-stats"><div><dt>{t('学習したフレーズ')}</dt><dd>{state.answers.length}</dd></div><div><dt>{t('正解したフレーズ')}</dt><dd>{correct}</dd></div><div><dt>{state.mode === 'guide' ? t('一度で正解') : t('ヒント・間違いなし')}</dt><dd>{firstTry}</dd></div></dl>
        <ul className="learning-recap">{state.answers.map(answer => <li key={answer.item.id}><span className="travel-recap-emoji" aria-hidden="true">{answer.item.emoji}</span><div><strong>{answer.item[locale]}</strong><span lang="en">{answer.item.english}</span></div><small>{answer.skipped ? t('答えを確認') : answer.hinted || answer.mistakes ? t('復習してみよう') : t('正解')}</small></li>)}</ul>
        <div className="learning-actions"><button type="button" className="learning-primary" onClick={() => restart()}><FontAwesomeIcon icon={rotateLeftIcon} aria-hidden="true" /> {t('このカテゴリーをもう一度')}</button>{reviewWords.length > 0 && <button type="button" onClick={() => { setNotice(''); setReviewing(true); dispatch({ type: 'reset', order: reviewWords, mode: 'quiz' }) }}>{t('復習が必要な単語だけ練習')}</button>}</div>
      </div> : <>
        <div className="learning-progress"><span>{t('第{0}問 / 全{1}問', [state.index + 1, state.order.length])}</span><progress max={state.order.length} value={state.answers.length} aria-label={t('学習の進み具合')} /></div>
        <div className="travel-practice-layout"><div className="travel-question"><div className="learning-prompt"><span className="travel-prompt-emoji" aria-hidden="true">{current.emoji}</span><div><span>{t(travelCategories[current.category].label)}</span><h3>{current[locale]}</h3></div></div>
        {pronunciation.enabled && pronunciation.supported && <button className="learning-listen" type="button" onClick={pronunciation.replay}><FontAwesomeIcon icon={volumeHighIcon} aria-hidden="true" /> {t('発音を聞く')}</button>}
        <p className="learning-instruction">{state.mode === 'guide' ? t('意味を確認して、お手本と同じ英文を入力してください。') : t('この場面で使う英文を思い出して入力してください。')}</p>
        <div className={`learning-target${showEnglish ? '' : ' is-hidden'}`}>{showEnglish ? <span lang="en" aria-label={current.english}>{[...current.english].map((letter, index) => <span key={index} className={state.mode === 'guide' && typed[index] ? typed[index] === letter.toLowerCase() ? 'is-correct' : 'is-incorrect' : ''}>{letter}</span>)}</span> : t('英語では何というかな？')}</div>
        <form onSubmit={check}>
          <label htmlFor="travel-answer">{t('英文を入力')}</label>
          <input ref={field} id="travel-answer" lang="en" value={state.input} disabled={answered} required maxLength={64} autoComplete="off" autoCapitalize="off" spellCheck={false} aria-describedby="travel-help travel-feedback" aria-invalid={state.feedback === 'incorrect'} placeholder={t('ここに英文を入力')} onChange={event => { const value = event.target.value; setNotice(isLearningInput(value, current) ? '' : '英字入力に切り替えてください。'); dispatch({ type: 'input', value }) }} onPaste={event => { event.preventDefault(); setNotice('練習中は貼り付けできません。キーボードで入力してください。') }} onDrop={event => event.preventDefault()} />
          <p className="learning-help" id="travel-help">{t(notice || '大文字・小文字は区別しません。英文の空白・句読点・アポストロフィーもお手本どおりに入力してください。')}</p>
          <div className={`learning-feedback feedback-${state.feedback}`} id="travel-feedback" role="status">{state.feedback === 'incorrect' ? t('もう少し！スペルを確認して、もう一度入力してみましょう。') : state.feedback === 'correct' ? t('正解！英語では {0} と書きます。', [current.english]) : state.feedback === 'skipped' ? t('答えは {0} です。次に出会ったとき、思い出してみましょう。', [current.english]) : ''}</div>
          <div className="learning-actions">{answered ? <button ref={nextButton} className="learning-primary" type="button" onClick={() => { setNotice(''); dispatch({ type: 'next' }) }}>{state.index === state.order.length - 1 ? t('学習結果を見る') : t('次のフレーズへ')} <FontAwesomeIcon icon={arrowRightIcon} aria-hidden="true" /></button> : <><button className="learning-primary" type="submit" disabled={!state.input.trim()}>{t('答え合わせ')}</button>{state.mode === 'quiz' && !state.hinted && <button type="button" onClick={() => dispatch({ type: 'hint' })}>{t('英語表記のヒントを見る')}</button>}<button type="button" onClick={() => dispatch({ type: 'skip' })}>{t('答えを確認して進む')}</button></>}</div>
        </form></div><aside className="travel-scene"><span className="travel-scene-eyebrow">TRAVEL SCENE</span><span className="travel-scene-emoji" aria-hidden="true">{current.emoji}</span><h3>{t(travelCategories[category].label)}</h3><p>{travelCategories[category][locale]}</p><span className="travel-scene-label">{t('伝えたいこと')}</span><strong>{current[locale]}</strong><p>{t('発音を聞いたら、自分でも声に出して練習してみましょう。')}</p></aside></div>
      </>}
    </section>
    <aside className="learning-about"><h2>{t('旅の場面を思い浮かべて、ひとことずつ。')}</h2><p>{t('日本語・韓国語の意味は、この練習で使う英語表現の一例です。別の言い方もありますが、採点はお手本の英文で行います。')}</p><p>{t('学習を最後まで終えると結果を保存し、ダッシュボードで確認できます。途中の進行状態はページを離れるとリセットされます。')}</p></aside>
  </main>
}
