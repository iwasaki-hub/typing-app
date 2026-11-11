import { useEffect, useReducer, useRef, useState, type SubmitEvent } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { householdIcon, arrowRightIcon, rotateLeftIcon } from '../../../lib/icons'
import { useLocale } from '../../../features/locale/useLocale'
import { householdCategories, householdRound, householdWords, type HouseholdCategory, type HouseholdWord } from '../../../features/learning/household'
import { learningReducer, newLearningSession, type LearnMode } from '../../../features/learning/session'
import { normalizeLearningAnswer } from '../../../features/learning/answer'
import './HouseholdPracticePage.css'

export default function HouseholdPracticePage() {
  const { t, locale } = useLocale()
  const [category, setCategory] = useState<HouseholdCategory>('kitchen')
  const [state, dispatch] = useReducer(learningReducer<HouseholdWord>, undefined, () => newLearningSession(householdRound('kitchen'), 'guide'))
  const [notice, setNotice] = useState('')
  const [reviewing, setReviewing] = useState(false)
  const field = useRef<HTMLInputElement>(null)
  const nextButton = useRef<HTMLButtonElement>(null)
  const summary = useRef<HTMLHeadingElement>(null)
  const current = state.order[state.index]
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
    dispatch({ type: 'reset', order: householdRound(nextCategory), mode })
  }
  function check(event: SubmitEvent<HTMLFormElement>) { event.preventDefault(); dispatch({ type: 'check' }) }
  return <main id="main" tabIndex={-1} className="learning-page household-page">
    <header className="learning-intro"><Link to="/practice">{t('← 練習メニューに戻る')}</Link><span className="learning-eyebrow">EVERYDAY WORDS</span><h1><FontAwesomeIcon icon={householdIcon} aria-hidden="true" /> {t('身近なものから、英語を覚えよう。')}</h1><p>{t('5つのカテゴリー、全40語。意味を見て入力し、日用品の英単語を少しずつ身につけましょう。')}</p></header>
    <div className="household-categories" role="group" aria-label={t('学習カテゴリー')}>
      {(Object.entries(householdCategories) as [HouseholdCategory, typeof householdCategories[HouseholdCategory]][]).map(([key, item]) => <button key={key} type="button" aria-pressed={category === key} onClick={() => restart(key)}><span aria-hidden="true">{item.emoji}</span><strong>{t(item.label)}</strong><small>{t('{0}語', [householdWords.filter(word => word.category === key).length])}</small></button>)}
    </div>
    <section className="learning-card" aria-labelledby="household-title">
      <div className="learning-heading"><h2 id="household-title">{t(householdCategories[category].label)}</h2><span className="learning-badge">{t('日用品の英単語')}</span></div>
      <div className="learning-settings"><label>{t('学び方')}<select value={state.mode} onChange={event => restart(category, event.target.value as LearnMode)}><option value="guide">{t('お手本を見て練習')}</option><option value="quiz">{t('思い出して入力')}</option></select></label></div>
      <p className="learning-help">{reviewing ? t('復習モード：ヒントを見た・間違えた・答えを確認した単語を、思い出して入力しましょう。') : t('カテゴリー・学び方を変更すると最初から始まります。1カテゴリー8問、時間制限はありません。')}</p>
      {state.finished ? <div className="learning-summary">
        <h3 ref={summary} tabIndex={-1}>{t('おつかれさまでした！')}</h3><p>{t('身の回りで見かけたら、英語の名前を思い出してみましょう。')}</p>
        <dl className="learning-stats"><div><dt>{t('学習した単語')}</dt><dd>{state.answers.length}</dd></div><div><dt>{t('正解した単語')}</dt><dd>{correct}</dd></div><div><dt>{state.mode === 'guide' ? t('一度で正解') : t('ヒント・間違いなし')}</dt><dd>{firstTry}</dd></div></dl>
        <ul className="learning-recap">{state.answers.map(answer => <li key={answer.item.id}><span className="household-recap-emoji" aria-hidden="true">{answer.item.emoji}</span><div><strong>{answer.item[locale]}</strong><span lang="en">{answer.item.english}</span></div><small>{answer.skipped ? t('答えを確認') : answer.hinted || answer.mistakes ? t('復習してみよう') : t('正解')}</small></li>)}</ul>
        <div className="learning-actions"><button type="button" className="learning-primary" onClick={() => restart()}><FontAwesomeIcon icon={rotateLeftIcon} aria-hidden="true" /> {t('このカテゴリーをもう一度')}</button>{reviewWords.length > 0 && <button type="button" onClick={() => { setNotice(''); setReviewing(true); dispatch({ type: 'reset', order: reviewWords, mode: 'quiz' }) }}>{t('復習が必要な単語だけ練習')}</button>}</div>
      </div> : <>
        <div className="learning-progress"><span>{t('第{0}問 / 全{1}問', [state.index + 1, state.order.length])}</span><progress max={state.order.length} value={state.answers.length} aria-label={t('学習の進み具合')} /></div>
        <div className="learning-prompt"><span className="household-prompt-emoji" aria-hidden="true">{current.emoji}</span><div><span>{t(householdCategories[current.category].label)}</span><h3>{current[locale]}</h3></div></div>
        <p className="learning-instruction">{state.mode === 'guide' ? t('意味とスペルを確認して、お手本の英単語を入力してください。') : t('この日用品を英語で何というか、思い出して入力してください。')}</p>
        <div className={`learning-target${showEnglish ? '' : ' is-hidden'}`}>{showEnglish ? <span lang="en" aria-label={current.english}>{[...current.english].map((letter, index) => <span key={index} className={state.mode === 'guide' && typed[index] ? typed[index] === letter ? 'is-correct' : 'is-incorrect' : ''}>{letter}</span>)}</span> : t('英語では何というかな？')}</div>
        <form onSubmit={check}>
          <label htmlFor="household-answer">{t('英単語を入力')}</label>
          <input ref={field} id="household-answer" lang="en" value={state.input} disabled={answered} required maxLength={64} autoComplete="off" autoCapitalize="off" spellCheck={false} aria-describedby="household-help household-feedback" aria-invalid={state.feedback === 'incorrect'} placeholder={t('ここに英単語を入力')} onChange={event => { const value = event.target.value; setNotice(/^[A-Za-z ]*$/.test(value) ? '' : '英字入力に切り替えてください。'); dispatch({ type: 'input', value }) }} onPaste={event => { event.preventDefault(); setNotice('練習中は貼り付けできません。キーボードで入力してください。') }} onDrop={event => event.preventDefault()} />
          <p className="learning-help" id="household-help">{t(notice || '大文字・小文字、前後と連続した空白は区別しません。表示される英語表記で入力してください。')}</p>
          <div className={`learning-feedback feedback-${state.feedback}`} id="household-feedback" role="status">{state.feedback === 'incorrect' ? t('もう少し！スペルを確認して、もう一度入力してみましょう。') : state.feedback === 'correct' ? t('正解！英語では {0} と書きます。', [current.english]) : state.feedback === 'skipped' ? t('答えは {0} です。次に出会ったとき、思い出してみましょう。', [current.english]) : ''}</div>
          <div className="learning-actions">{answered ? <button ref={nextButton} className="learning-primary" type="button" onClick={() => { setNotice(''); dispatch({ type: 'next' }) }}>{state.index === state.order.length - 1 ? t('学習結果を見る') : t('次の単語へ')} <FontAwesomeIcon icon={arrowRightIcon} aria-hidden="true" /></button> : <><button className="learning-primary" type="submit" disabled={!state.input.trim()}>{t('答え合わせ')}</button>{state.mode === 'quiz' && !state.hinted && <button type="button" onClick={() => dispatch({ type: 'hint' })}>{t('英語表記のヒントを見る')}</button>}<button type="button" onClick={() => dispatch({ type: 'skip' })}>{t('答えを確認して進む')}</button></>}</div>
        </form>
      </>}
    </section>
    <aside className="learning-about"><h2>{t('暮らしの中で、英語を見つけよう。')}</h2><p>{t('イラストは単語を思い出すためのイメージです。日本語・韓国語の意味と合わせて覚えましょう。単語には別の言い方もありますが、この練習では表示された英語表記で答えてください。')}</p><p>{t('通常の文章タイピング記録やランキングとは別の学習モードです。ページを離れると進行状態はリセットされます。')}</p></aside>
  </main>
}
