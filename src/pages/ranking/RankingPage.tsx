import { getFormattingLocale } from '../../features/locale/store'
import { useLocale } from '../../features/locale/useLocale'
import { trophyIcon } from '../../lib/icons';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAuth } from '../../features/auth/context';
import { getRanking, publishResult, rankingError, type RankingEntry } from '../../api/ranking';
import { useHistory } from '../../features/typing/historyContext';
import { isRankingEligible } from '../../features/typing/ranking';
import './RankingPage.css';
export default function RankingPage() {
    const { t } = useLocale();
    const [duration, setDuration] = useState(60);
    const [rows, setRows] = useState<RankingEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [version, setVersion] = useState(0);
    const { session, ready: authReady, error: authError, displayName } = useAuth();
    const [name, setName] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState('');
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState('');
    const [actionError, setActionError] = useState('');
    const inFlight = useRef(false);
    const { results, error: historyError } = useHistory();
    const eligible = results.filter(isRankingEligible);
    const selected = eligible.find((result) => result.id === selectedId) ?? eligible[0];
    useEffect(() => {
        const controller = new AbortController();
        getRanking(duration, controller.signal).then((data) => {
            if (!controller.signal.aborted) {
                setRows(data);
                setLoadError('');
                setLoading(false);
            }
        }).catch((error: unknown) => {
            if (!controller.signal.aborted) {
                setLoadError(rankingError(error));
                setLoading(false);
            }
        });
        return () => controller.abort();
    }, [duration, version]);
    async function perform(action: () => Promise<void>) {
        if (inFlight.current)
            return;
        inFlight.current = true;
        setBusy(true);
        setMessage('');
        setActionError('');
        try {
            await action();
        }
        catch (error) {
            setActionError(rankingError(error));
        }
        finally {
            inFlight.current = false;
            setBusy(false);
        }
    }
    function refreshRanking() { setLoading(true); setLoadError(''); setVersion((value) => value + 1); }
    return <main id="main" tabIndex={-1} className="ranking-page">
    <header className="ranking-intro"><span><FontAwesomeIcon icon={trophyIcon} aria-hidden="true"/> LEADERBOARD</span><h1>{t("毎日の練習を、記録に。")}</h1><p>{t("全ユーザーのベスト記録。次は、あなたの番です。")}</p></header>
    <section className="ranking-board" aria-labelledby="ranking-title">
      <div className="ranking-heading"><h2 id="ranking-title">{t("全ユーザーランキング")}</h2><label>{t("制限時間")}<select value={duration} onChange={(event) => { setDuration(Number(event.target.value)); setRows([]); setLoading(true); setLoadError(''); }}>{[30, 60, 120].map((value) => <option key={value} value={value}>{value}{t("秒")}</option>)}</select></label><button onClick={refreshRanking} disabled={loading}>{t("更新")}</button></div>
      <p>{t("英語の練習結果から各ユーザーの最高 WPM を掲載（上位100人）。同じ WPM は正確率、記録日時の順に並びます。")}</p>
      {loading ? <p role="status">{t("ランキングを読み込んでいます…")}</p> : loadError ? <p role="alert">{t(loadError)}</p> : rows.length === 0 ? <div className="ranking-empty">{t("まだ記録がありません。")}<Link to="/practice/sentences">{t("練習して最初の記録を作る →")}</Link></div> : <div className="ranking-scroll" role="region" aria-label={t("ランキング一覧")} tabIndex={0}><table><thead><tr><th>{t("順位")}</th><th>{t("ユーザー")}</th><th>WPM</th><th>{t("正確率")}</th><th>{t("記録日")}</th></tr></thead><tbody>{rows.map((row, index) => <tr key={row.id} className={row.user_id === session?.user.id ? 'ranking-mine' : ''}><td>{index + 1}</td><td>{row.display_name}{row.user_id === session?.user.id && <small>{t("あなた")}</small>}</td><td><strong>{row.wpm}</strong></td><td>{row.accuracy}%</td><td><time dateTime={row.created_at}>{new Date(row.created_at).toLocaleDateString(getFormattingLocale())}</time></td></tr>)}</tbody></table></div>}
    </section>
    <section className="ranking-publish" aria-labelledby="publish-title"><h2 id="publish-title">{t("自分の記録を公開する")}</h2><p>{t("表示名・スコア・記録日は誰でも閲覧できます。メールアドレスは公開されません。")}</p>
      {!authReady ? <p role="status">{t("ログイン状態を確認しています…")}</p> : session ? <div className="ranking-account"><span>{displayName ? t("{0} さんでログイン中", [displayName]) : t("ログイン済み")}</span><Link to="/profile">{displayName ? t("プロフィールを編集") : t("名前を設定する →")}</Link></div> : <p><Link to="/login">{t("ログインして記録を公開する →")}</Link></p>}
      {authError && <p role="alert">{t(authError)}</p>}
      {historyError && <p role="alert">{t(historyError)}</p>}
      {selected ? <form className="ranking-form" onSubmit={(event) => { event.preventDefault(); void perform(async () => { await publishResult(selected, name ?? displayName); setMessage('記録を公開しました。同じユーザー・制限時間ではベスト記録が掲載されます。'); setDuration(selected.duration); setRows([]); refreshRanking(); }); }}>
        <label>{t("公開する練習結果")}<select value={selected.id} disabled={busy} onChange={(event) => setSelectedId(event.target.value)}>{eligible.map((result) => <option key={result.id} value={result.id}>{new Date(result.savedAt).toLocaleString(getFormattingLocale())} · {result.duration}{t("秒 ·")}{result.wpm} WPM</option>)}</select></label>
        <label>{t("公開する表示名")}<input required maxLength={20} value={name ?? displayName} disabled={busy} onChange={(event) => setName(event.target.value)} placeholder={t("1〜20文字")}/></label><button type="submit" disabled={!session || busy}>{busy ? t("処理中…") : t("この記録を公開する")}</button>
      </form> : <p>{t("公開できる英語の結果がありません。")}<Link to="/practice/sentences">{t("タイピング練習へ →")}</Link></p>}
      {actionError && <p role="alert">{t(actionError)}</p>}{message && <p role="status">{t(message)}</p>}
      <p className="ranking-note">{t("英語の結果のみ対象です。韓国語の結果は履歴で確認できます。入力完了または時間切れ、計測5秒以上・1〜300 WPM の結果が対象です。過去の履歴に必要な計測情報がない場合は、もう一度練習してください。練習文は毎回異なります。ブラウザで計測するカジュアルなランキングです。")}</p>
    </section>
  </main>;
}
