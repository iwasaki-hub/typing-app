import { getFormattingLocale } from '../../features/locale/store'
import { useLocale } from '../../features/locale/useLocale'
import { circleCheckIcon, circleExclamationIcon, plugIcon, spinnerIcon } from '../../lib/icons';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { checkSupabaseConnection } from '../../api/supabase';
import { getApiErrorMessage } from '../../api/client';
import './ConnectionStatus.css';
export default function ConnectionStatus() {
    const { t } = useLocale();
    const [connection, setConnection] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
    const [connectionMessage, setConnectionMessage] = useState('ボタンを押して接続を確認してください。');
    const [checkedAt, setCheckedAt] = useState<number | null>(null);
    async function checkConnection() {
        setConnection('checking');
        setConnectionMessage('Supabase に接続しています…');
        setCheckedAt(null);
        try {
            await checkSupabaseConnection();
            setConnection('success');
            setConnectionMessage('Supabase との通信に成功しました。');
        }
        catch (error) {
            setConnection('error');
            setConnectionMessage(getApiErrorMessage(error));
        }
        finally {
            setCheckedAt(Date.now());
        }
    }
    return (<section className="connection-card" aria-labelledby="connection-heading" aria-busy={connection === 'checking'}>
        <div className="connection-header">
          <h2 id="connection-heading">{t("Supabase 接続確認")}</h2>
          <span className={`connection-badge ${connection}`}>
            <FontAwesomeIcon icon={connection === 'checking' ? spinnerIcon : connection === 'success' ? circleCheckIcon : connection === 'error' ? circleExclamationIcon : plugIcon} spin={connection === 'checking'} aria-hidden="true"/>{' '}
            {t({ idle: '未確認', checking: '確認中', success: '接続成功', error: '接続失敗' }[connection])}
          </span>
        </div>
        <p role="status" aria-live="polite">{t(connectionMessage)}</p>
        {connection === 'error' && (<div className="connection-help">
            <h3>{t("Vercel で接続する場合")}</h3>
            <ol>
              <li>
                <a href="https://vercel.com/masas-projects-39337881/typing-app/settings/environment-variables" target="_blank" rel="noopener noreferrer">{t("Vercel の環境変数設定を開く ↗")}</a>
              </li>
              <li>{t("次の2つを設定、または値を確認してください。")}<ul>
                  <li><code>VITE_SUPABASE_URL</code>{t("：Supabase の Project URL")}</li>
                  <li><code>VITE_SUPABASE_PUBLISHABLE_KEY</code>{t("：Supabase の Publishable key")}</li>
                </ul>
              </li>
              <li>{t("本番サイトには Production、プレビューには Preview を選んで保存します。")}</li>
              <li>{t("Deployments から再デプロイ（Redeploy）し、完了後にこの画面を再読み込みしてください。")}</li>
            </ol>
            <p>{t("環境変数の変更は、再デプロイ後に反映されます。")}</p>
            <details>
              <summary>{t("ローカルで接続する場合")}</summary>
              <p>{t("プロジェクト直下の")}<code>.env.local</code>{t("に上記の2つを設定し、開発サーバーを再起動してください。")}</p>
            </details>
          </div>)}
        <p className="connection-note">{t("Auth API への疎通を確認します。データベースの読み書きやログインは行いません。")}</p>
        <div className="connection-actions">
          <button type="button" onClick={checkConnection} disabled={connection === 'checking'}>
            {connection === 'checking' ? t("確認しています…") : checkedAt ? t("もう一度確認") : t("接続を確認")}
          </button>
          {checkedAt && <small>{t("最終確認:")}{new Date(checkedAt).toLocaleTimeString(getFormattingLocale())}</small>}
        </div>
      </section>);
}
