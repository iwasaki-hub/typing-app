import { arrowRightIcon, arrowTrendUpIcon, arrowUpRightFromSquareIcon, keyboardIcon, fontIcon, wandMagicSparklesIcon, arrowTurnDownIcon } from '../lib/icons'
import HomeReviews from '../components/HomeReviews'
import { Link } from 'react-router-dom'
import { m } from 'motion/react'
import MotionLink from '../components/MotionLink'
import ConnectionStatus from '../components/ConnectionStatus'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './HomePage.css'



export default function HomePage() {

  return (
    <div className="home-page">
      
      
      <main id="main" tabIndex={-1}>
        <section className="home-hero">
          <m.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="home-eyebrow">● LITTLE BY LITTLE, KEY BY KEY.</p>
            <h1>ことばを打つ。<br />毎日が、<br /><span>少し軽くなる。</span></h1>
            <p className="home-lead">考えたことが、すっと指先から伝わる。<br />まずは短い一文から、タイピングを楽しもう。</p>
            <div className="home-hero-actions"><MotionLink whileHover={{ y: -3, boxShadow: '0 8px 20px #0876d933' }} whileTap={{ scale: 0.97 }} className="home-button" to="/practice">さっそく試してみる <FontAwesomeIcon icon={arrowRightIcon} aria-hidden="true" /></MotionLink><a href="#how-to">使い方を見る <FontAwesomeIcon icon={arrowUpRightFromSquareIcon} aria-hidden="true" /></a></div>
            <p className="home-caption">登録不要。練習ページですぐに体験できます。</p>
          </m.div>
          <m.div initial={{ opacity: 0, y: 24, rotate: -2 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ duration: 0.65, delay: 0.1 }} className="home-art" aria-hidden="true">
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
            <span className="home-floating-key"><FontAwesomeIcon icon={arrowTurnDownIcon} /></span><span className="home-art-label">A little practice. A little progress.</span>
          </m.div>
        </section>
        
        <section className="home-features" id="features">
          <p className="home-eyebrow">LESS NOISE. MORE FOCUS.</p><h2>気負わず、<br />打つことだけに集中。</h2>
          <m.div className="home-feature-grid" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.09 } } }}>
            <m.article variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }} whileHover={{ y: -4 }}><span><FontAwesomeIcon icon={fontIcon} aria-hidden="true" /></span><h3>短い一文から。</h3><p>長い時間を用意しなくても大丈夫。<br />ちょっとした隙間に、指先を動かそう。</p></m.article>
            <m.article variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }} whileHover={{ y: -4 }}><span><FontAwesomeIcon icon={keyboardIcon} aria-hidden="true" /></span><h3>開いたら、すぐに。</h3><p>インストールも、アカウント登録も不要。<br />ブラウザがあれば、それだけで。</p></m.article>
            <m.article variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }} whileHover={{ y: -4 }}><span><FontAwesomeIcon icon={arrowTrendUpIcon} aria-hidden="true" /></span><h3>間違いも、一歩に。</h3><p>入力した文字を、その場でチェック。<br />焦らず、何度でも試してみよう。</p></m.article>
          </m.div>
        </section>
        <section className="home-how" id="how-to"><div><p className="home-eyebrow">HOW TO START</p><h2>はじめの一歩は、<br />とてもシンプル。</h2></div><ol><li><span>01</span><div><h3>英文を読む</h3><p>練習ページに表示された一文を見てみよう。</p></div></li><li><span>02</span><div><h3>そのまま入力する</h3><p>キーボードを英字入力に切り替えて、一文字ずつ。</p></div></li><li><span>03</span><div><h3>もう一度、やってみる</h3><p>リセットして繰り返そう。速さよりも、まずは正確に。</p></div></li></ol></section>
        <HomeReviews />
        <section className="home-closing"><span aria-hidden="true"><FontAwesomeIcon icon={wandMagicSparklesIcon} /></span><h2>今日の一文を、ここから。</h2><Link className="home-button" to="/practice">タイピングを試す <FontAwesomeIcon icon={arrowRightIcon} aria-hidden="true" /></Link></section>
      </main>
      <details className="home-system"><summary>システム接続の確認</summary><ConnectionStatus /></details>
    </div>
  )
}


