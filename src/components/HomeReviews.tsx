import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useInView, useReducedMotion } from 'motion/react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { starIcon, chevronLeftIcon, chevronRightIcon, keyboardIcon, chartLineIcon, bookOpenIcon } from '../lib/icons'
import { demoReviews } from '../data/demoReviews'
import type { PublicReview } from '../features/reviews/review'
import './HomeReviews.css'

type ReviewCard = { id: string; name: string; role: string; initial: string; rating: number; title: string; text: string }

function ReviewCarousel({ reviews, isDemo }: { reviews: readonly ReviewCard[]; isDemo: boolean }) {
  const [index, setIndex] = useState(0)
  const [visibleSlides, setVisibleSlides] = useState<number[]>([0])
  const [playing, setPlaying] = useState(true)
  const [hovered, setHovered] = useState(false)
  const [visible, setVisible] = useState(() => document.visibilityState === 'visible')
  const container = useRef<HTMLDivElement>(null)
  const inView = useInView(container, { amount: 0.25 })
  const reducedMotion = useReducedMotion()
  const count = reviews.length
  // A second copy gives Embla enough track length to loop even when all 2–3 reviews fit on screen.
  const slides = count > 1 && count <= 3 ? [...reviews, ...reviews] : reviews
  const [autoplay] = useState(() => Autoplay({ delay: 6000, playOnInit: false, stopOnInteraction: true, stopOnMouseEnter: false, stopOnFocusIn: false }))
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: count > 1, align: 'start', slidesToScroll: 1, duration: reducedMotion ? 0 : 25 }, [autoplay])
  const shouldPlay = playing && !hovered && visible && inView && !reducedMotion && count > 1
  useEffect(() => {
    const update = () => setVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', update)
    return () => document.removeEventListener('visibilitychange', update)
  }, [])
  useEffect(() => {
    if (!emblaApi) return
    const update = () => setIndex(emblaApi.selectedScrollSnap() % count)
    const updateVisible = () => setVisibleSlides(emblaApi.slidesInView())
    const playback = () => { if (shouldPlay) autoplay.play(); else autoplay.stop() }
    const reInit = () => { update(); updateVisible(); playback() }
    const stopOnDrag = () => { autoplay.stop(); setPlaying(false) }
    update()
    updateVisible()
    playback()
    emblaApi.on('select', update).on('reInit', reInit).on('pointerDown', stopOnDrag).on('slidesInView', updateVisible)
    return () => {
      emblaApi.off('select', update).off('reInit', reInit).off('pointerDown', stopOnDrag).off('slidesInView', updateVisible)
      autoplay.stop()
    }
  }, [emblaApi, autoplay, shouldPlay, count])
  function select(next: number) {
    autoplay.stop(); setPlaying(false)
    if (!emblaApi) return
    const current = emblaApi.selectedScrollSnap()
    const distance = (position: number) => Math.min(Math.abs(position - current), slides.length - Math.abs(position - current))
    const positions = slides.flatMap((_, position) => position % count === next ? [position] : [])
    positions.sort((a, b) => distance(a) - distance(b))
    emblaApi.scrollTo(positions[0], !!reducedMotion)
  }
  function move(direction: 'prev' | 'next') {
    autoplay.stop(); setPlaying(false)
    if (direction === 'prev') emblaApi?.scrollPrev(!!reducedMotion)
    else emblaApi?.scrollNext(!!reducedMotion)
  }
  return <div ref={container} className="home-review-carousel" data-review-count={count} role="region" aria-roledescription="カルーセル" aria-label="アプリのレビュー"
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={event => { if (!(event.target instanceof HTMLElement && event.target.closest('[data-carousel-rotation]'))) setPlaying(false) }}>
    {count > 1 && <div className="home-review-controls">
      <span>{index + 1} / {count}</span>
      <button type="button" data-carousel-rotation onClick={() => setPlaying(current => !current)} disabled={!!reducedMotion}>{playing && !reducedMotion ? '自動再生を停止' : '自動再生を開始'}</button>
      <button type="button" aria-label="前のレビュー" onClick={() => move('prev')}><FontAwesomeIcon icon={chevronLeftIcon} aria-hidden="true" /></button>
      <button type="button" aria-label="次のレビュー" onClick={() => move('next')}><FontAwesomeIcon icon={chevronRightIcon} aria-hidden="true" /></button>
    </div>}
    <div ref={emblaRef} className="home-review-window" aria-live={playing && !reducedMotion ? 'off' : 'polite'} aria-atomic="true">
      <div className="home-review-track">
        {slides.map((review, position) => <div className="home-review-slide" key={`${review.id}-${position}`} role="group" aria-roledescription="スライド" aria-label={`${position % count + 1} / ${count}`} aria-hidden={!visibleSlides.includes(position)} inert={!visibleSlides.includes(position)}>
          <article className="home-review-card" data-accent={position % count % 3}>
          <div className="home-review-visual" aria-hidden="true"><span className="home-review-visual-label">LITTLE BY LITTLE.</span><FontAwesomeIcon icon={[keyboardIcon, chartLineIcon, bookOpenIcon][position % count % 3]} /><span className="home-review-visual-avatar">{review.initial}</span></div>
          <h3>{review.title}</h3>
          <div className="home-review-badges"><span className="home-review-score"><FontAwesomeIcon icon={starIcon} aria-hidden="true" /><span className="home-sr-only">評価：5点中</span>{review.rating.toFixed(1)}<span className="home-sr-only">点</span></span><span>{isDemo ? 'デモレビュー' : '利用者レビュー'}</span></div>
          <blockquote>{review.text}</blockquote>
          <div className="home-review-author"><span className="home-review-avatar" aria-hidden="true">{review.initial}</span><div><span className="home-review-name">{review.name}</span><span className="home-review-role">{review.role}</span></div></div>
        </article></div>)}
      </div>
    </div>
    {count > 1 && <div className="home-review-dots" role="group" aria-label="表示するレビュー">{reviews.map((review, position) => <button type="button" key={review.id} aria-label={`レビュー${position + 1}を表示`} aria-pressed={position === index} onClick={() => select(position)}><span /></button>)}</div>}
    {reducedMotion && count > 1 && <p className="home-reviews-note">動きを減らす設定のため、自動再生は停止しています。</p>}
  </div>
}

export default function HomeReviews() {
  const [published, setPublished] = useState<PublicReview[]>([])
  useEffect(() => {
    const controller = new AbortController()
    import('../api/reviews').then(api => api.getPublicReviews(controller.signal)).then(data => { if (!controller.signal.aborted) setPublished(data) }).catch(() => { /* Keep clearly labelled demo cards when the API is unavailable. */ })
    return () => controller.abort()
  }, [])
  const isDemo = published.length === 0
  const reviews = isDemo ? demoReviews : published.map(review => ({ id: review.id, name: review.display_name, role: '利用者レビュー', initial: [...review.display_name][0], rating: review.rating, title: review.title, text: review.comment }))
  return (<section className="home-reviews" id="reviews" aria-labelledby="home-reviews-title" aria-describedby="home-reviews-note">
          <p className="home-eyebrow">PRACTICE, IN YOUR OWN WAY. {isDemo && <span className="home-review-demo">DEMO</span>}</p>
          <h2 id="home-reviews-title">毎日の練習に、<br />それぞれの楽しみ。</h2>
          <p id="home-reviews-note" className="home-reviews-note">{isDemo ? 'レビューの表示サンプルです。名前・評価・コメントはすべて架空のデモデータです。' : '利用者から寄せられたレビューです。最新6件を表示しています。'}</p>
          <p className="home-review-link"><Link to="/dashboard">ダッシュボードでレビューを投稿する →</Link></p>
          <ReviewCarousel key={reviews.map(review => review.id).join(',')} reviews={reviews} isDemo={isDemo} />
        </section>)
}
