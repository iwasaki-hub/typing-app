import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { m } from 'motion/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { starIcon } from '../lib/icons'
import { demoReviews } from '../data/demoReviews'
import type { PublicReview } from '../features/reviews/review'

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
          <m.div className="home-review-grid" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.09 } } }}>
            {reviews.map(review => <m.article className="home-review-card" key={review.id} variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}>
              <div className="home-review-rating"><span className="home-sr-only">評価：5点中{review.rating}点{isDemo ? '（デモ）' : ''}</span><span aria-hidden="true">{Array.from({ length: 5 }, (_, index) => <FontAwesomeIcon key={index} icon={starIcon} className={index < review.rating ? 'is-filled' : ''} />)}</span></div>
              <h3>{review.title}</h3><blockquote>{review.text}</blockquote>
              <div className="home-review-author"><span className="home-review-avatar" aria-hidden="true">{review.initial}</span><div><span className="home-review-name">{review.name}</span><span className="home-review-role">{review.role}</span></div></div>
            </m.article>)}
          </m.div>
        </section>)
}
