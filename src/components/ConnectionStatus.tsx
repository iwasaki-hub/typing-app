import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faCircleExclamation, faPlug, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { checkSupabaseConnection } from '../api/supabase'
import { getApiErrorMessage } from '../api/client'
import './ConnectionStatus.css'

export default function ConnectionStatus() {
  const [connection, setConnection] = useState<'idle' | 'checking' | 'success' | 'error'>('idle')
  const [connectionMessage, setConnectionMessage] = useState('ボタンを押して接続を確認してください。')
  const [checkedAt, setCheckedAt] = useState<string | null>(null)

  async function checkConnection() {
    setConnection('checking')
    setConnectionMessage('Supabase に接続しています…')
    setCheckedAt(null)

    try {
      await checkSupabaseConnection()
      setConnection('success')
      setConnectionMessage('Supabase との通信に成功しました。')
    } catch (error) {
      setConnection('error')
      setConnectionMessage(getApiErrorMessage(error))
    } finally {
      setCheckedAt(new Date().toLocaleTimeString('ja-JP'))
    }
  }

  return (
      <section className="connection-card" aria-labelledby="connection-heading" aria-busy={connection === 'checking'}>
        <div className="connection-header">
          <h2 id="connection-heading">Supabase 接続確認</h2>
          <span className={`connection-badge ${connection}`}>
            <FontAwesomeIcon icon={connection === 'checking' ? faSpinner : connection === 'success' ? faCircleCheck : connection === 'error' ? faCircleExclamation : faPlug} spin={connection === 'checking'} aria-hidden="true" />{' '}
            {{ idle: '未確認', checking: '確認中', success: '接続成功', error: '接続失敗' }[connection]}
          </span>
        </div>
        <p role="status" aria-live="polite">{connectionMessage}</p>
        {connection === 'error' && (
          <div className="connection-help">
            <h3>Vercel で接続する場合</h3>
            <ol>
              <li>
                <a
                  href="https://vercel.com/masas-projects-39337881/typing-app/settings/environment-variables"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Vercel の環境変数設定を開く ↗
                </a>
              </li>
              <li>
                次の2つを設定、または値を確認してください。
                <ul>
                  <li><code>VITE_SUPABASE_URL</code>：Supabase の Project URL</li>
                  <li><code>VITE_SUPABASE_PUBLISHABLE_KEY</code>：Supabase の Publishable key</li>
                </ul>
              </li>
              <li>本番サイトには Production、プレビューには Preview を選んで保存します。</li>
              <li>Deployments から再デプロイ（Redeploy）し、完了後にこの画面を再読み込みしてください。</li>
            </ol>
            <p>環境変数の変更は、再デプロイ後に反映されます。</p>
            <details>
              <summary>ローカルで接続する場合</summary>
              <p>プロジェクト直下の <code>.env.local</code> に上記の2つを設定し、開発サーバーを再起動してください。</p>
            </details>
          </div>
        )}
        <p className="connection-note">Auth API への疎通を確認します。データベースの読み書きやログインは行いません。</p>
        <div className="connection-actions">
          <button type="button" onClick={checkConnection} disabled={connection === 'checking'}>
            {connection === 'checking' ? '確認しています…' : checkedAt ? 'もう一度確認' : '接続を確認'}
          </button>
          {checkedAt && <small>最終確認: {checkedAt}</small>}
        </div>
      </section>
  )
}

