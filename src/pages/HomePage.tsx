import { useState } from 'react'
import ConnectionStatus from '../components/ConnectionStatus'
import Navigation from '../components/Navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faArrowUp, faArrowTrendUp, faArrowUpRightFromSquare, faRotateLeft, faKeyboard, faFont, faWandMagicSparkles, faArrowTurnDown } from '@fortawesome/free-solid-svg-icons'
import './HomePage.css'

const sample = 'Small steps, every day.'

export default function HomePage() {
  const [input, setInput] = useState('')
  function startPractice() {
    document.getElementById('practice')?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      block: 'center',
    })
    document.getElementById('typing-input')?.focus({ preventScroll: true })
  }
  return (
    <div className="home-page" id="top">
      <a className="home-skip" href="#main">本文へスキップ</a>
      <Navigation onStart={startPractice} />
      <main id="main">
        <section className="home-hero">
          <div>
            <p className="home-eyebrow">● LITTLE BY LITTLE, KEY BY KEY.</p>
            <h1>ことばを打つ。<br />毎日が、<br /><span>少し軽くなる。</span></h1>
            <p className="home-lead">考えたことが、すっと指先から伝わる。<br />まずは短い一文から、タイピングを楽しもう。</p>
            <div className="home-hero-actions"><button className="home-button" onClick={startPractice}>さっそく試してみる <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" /></button><a href="#how-to">使い方を見る <FontAwesomeIcon icon={faArrowUpRightFromSquare} aria-hidden="true" /></a></div>
            <p className="home-caption">登録不要。このページですぐに体験できます。</p>
          </div>
          <div className="home-art" aria-hidden="true">
            <span className="home-art-note">Make room<br />for a little practice.</span>
            <svg viewBox="0 0 500 420" fill="none">
              <path d="M64 300C28 232 74 117 177 89C259 66 309 121 352 155C403 195 460 214 441 297C421 378 126 402 64 300Z" fill="#f4f3ef" />
              <path d="M145 172L342 148L384 270L182 294L145 172Z" fill="white" stroke="#202020" strokeWidth="4" strokeLinejoin="round" />
              <path d="M182 294L105 335L303 358L384 270M105 335L106 345L304 369L384 281V270" fill="white" stroke="#202020" strokeWidth="4" strokeLinejoin="round" />
              <path d="M175 190L321 174L345 245L200 263L175 190Z" fill="#e5f1ff" />
              <path d="M206 211L277 203M211 228L310 217M218 244L260 239" stroke="#2584ea" strokeWidth="5" strokeLinecap="round" />
              <path d="M168 320L283 332M192 307L306 318M215 296L328 305" stroke="#202020" strokeWidth="4" strokeLinecap="round" />
              <path d="M82 253C64 230 77 209 98 222L140 252L191 272C209 281 199 300 183 294L127 280L82 253Z" fill="white" stroke="#202020" strokeWidth="4" />
              <path d="M414 297C446 274 432 244 410 252L369 276L309 281C289 285 295 308 313 307L379 309L414 297Z" fill="white" stroke="#202020" strokeWidth="4" />
              <path d="M55 229L31 252L77 300L109 277M442 257L473 289L424 338L393 310" fill="#202020" />
              <path d="M373 89L383 69M396 105L417 98M352 74L348 54" stroke="#202020" strokeWidth="4" strokeLinecap="round" />
              <path d="M92 127L98 111L104 127L120 133L104 139L98 155L92 139L76 133Z" fill="#2584ea" />
            </svg>
            <span className="home-floating-key"><FontAwesomeIcon icon={faArrowTurnDown} /></span><span className="home-art-label">A little practice. A little progress.</span>
          </div>
        </section>
        <section className="home-practice" id="practice" aria-labelledby="practice-title">
          <div className="home-practice-top"><span>● おためしタイピング</span><span>01 / 01</span></div>
          <div className="home-practice-content">
            <p className="home-eyebrow" id="practice-title">まずは、この一文を。</p>
            <p className="home-sample" aria-label={sample}>{sample.split('').map((letter, index) => <span key={index} aria-hidden="true" className={index < input.length ? input[index] === letter ? 'correct' : 'incorrect' : ''}>{letter}</span>)}</p>
            <label className="home-sr-only" htmlFor="typing-input">表示された英文を入力</label>
            <input id="typing-input" value={input} onChange={(event) => setInput(event.target.value)} placeholder="ここに英文を入力してください" autoComplete="off" autoCapitalize="off" spellCheck={false} maxLength={sample.length} aria-describedby="practice-feedback" />
            <div className="home-practice-bottom"><p id="practice-feedback" role="status">{input === sample ? 'できました！ 小さな一歩を重ねていこう。' : '自分のペースで、一文字ずつ。'}</p><button onClick={() => { setInput(''); startPractice() }}>リセット <FontAwesomeIcon icon={faRotateLeft} aria-hidden="true" /></button></div>
          </div>
        </section>
        <section className="home-features" id="features">
          <p className="home-eyebrow">LESS NOISE. MORE FOCUS.</p><h2>気負わず、<br />打つことだけに集中。</h2>
          <div className="home-feature-grid">
            <article><span><FontAwesomeIcon icon={faFont} aria-hidden="true" /></span><h3>短い一文から。</h3><p>長い時間を用意しなくても大丈夫。<br />ちょっとした隙間に、指先を動かそう。</p></article>
            <article><span><FontAwesomeIcon icon={faKeyboard} aria-hidden="true" /></span><h3>開いたら、すぐに。</h3><p>インストールも、アカウント登録も不要。<br />ブラウザがあれば、それだけで。</p></article>
            <article><span><FontAwesomeIcon icon={faArrowTrendUp} aria-hidden="true" /></span><h3>間違いも、一歩に。</h3><p>入力した文字を、その場でチェック。<br />焦らず、何度でも試してみよう。</p></article>
          </div>
        </section>
        <section className="home-how" id="how-to"><div><p className="home-eyebrow">HOW TO START</p><h2>はじめの一歩は、<br />とてもシンプル。</h2></div><ol><li><span>01</span><div><h3>英文を読む</h3><p>おためしエリアに表示された一文を見てみよう。</p></div></li><li><span>02</span><div><h3>そのまま入力する</h3><p>キーボードを英字入力に切り替えて、一文字ずつ。</p></div></li><li><span>03</span><div><h3>もう一度、やってみる</h3><p>リセットして繰り返そう。速さよりも、まずは正確に。</p></div></li></ol></section>
        <section className="home-closing"><span aria-hidden="true"><FontAwesomeIcon icon={faWandMagicSparkles} /></span><h2>今日の一文を、ここから。</h2><button className="home-button" onClick={startPractice}>タイピングを試す <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" /></button></section>
      </main>
      <footer className="home-footer"><a className="home-brand" href="#top"><span className="home-mark">t.</span>Typing</a><p>ひとつずつ、自分のペースで。</p><a href="#top">ページの先頭へ <FontAwesomeIcon icon={faArrowUp} aria-hidden="true" /></a></footer>
      <details className="home-system"><summary>システム接続の確認</summary><ConnectionStatus /></details>
    </div>
  )
}

