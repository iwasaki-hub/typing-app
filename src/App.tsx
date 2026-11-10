import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [connection, setConnection] = useState<'idle' | 'checking' | 'success' | 'error'>('idle')
  const [connectionMessage, setConnectionMessage] = useState('ボタンを押して接続を確認してください。')
  const [checkedAt, setCheckedAt] = useState<string | null>(null)

  async function checkConnection() {
    setConnection('checking')
    setConnectionMessage('Supabase に接続しています…')
    setCheckedAt(null)

    try {
      const url = import.meta.env.VITE_SUPABASE_URL
      const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
      if (!url || !key) {
        throw new Error('.env.local に Supabase の URL と公開用キーを設定してください。')
      }
      const response = await fetch(new URL('/auth/v1/settings', url), {
        headers: { apikey: key },
        signal: AbortSignal.timeout(15000),
      })
      if (!response.ok) {
        throw new Error(`接続できませんでした（HTTP ${response.status}）。URL と公開用キーを確認してください。`)
      }
      await response.json()
      setConnection('success')
      setConnectionMessage('Supabase との通信に成功しました。')
    } catch (error) {
      setConnection('error')
      setConnectionMessage(
        error instanceof Error && error.name === 'TimeoutError'
          ? '接続がタイムアウトしました。時間をおいて再確認してください。'
          : error instanceof TypeError
            ? '通信できませんでした。接続先 URL とネットワークを確認してください。'
            : error instanceof Error ? error.message : '接続に失敗しました。再確認してください。',
      )
    } finally {
      setCheckedAt(new Date().toLocaleTimeString('ja-JP'))
    }
  }

  return (
    <>
      <section className="connection-card" aria-labelledby="connection-heading" aria-busy={connection === 'checking'}>
        <div className="connection-header">
          <h2 id="connection-heading">Supabase 接続確認</h2>
          <span className={`connection-badge ${connection}`}>
            {{ idle: '未確認', checking: '確認中', success: '接続成功', error: '接続失敗' }[connection]}
          </span>
        </div>
        <p role="status" aria-live="polite">{connectionMessage}</p>
        <p className="connection-note">Auth API への疎通を確認します。データベースの読み書きやログインは行いません。</p>
        <div className="connection-actions">
          <button type="button" onClick={checkConnection} disabled={connection === 'checking'}>
            {connection === 'checking' ? '確認しています…' : checkedAt ? 'もう一度確認' : '接続を確認'}
          </button>
          {checkedAt && <small>最終確認: {checkedAt}</small>}
        </div>
      </section>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
