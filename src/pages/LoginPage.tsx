import { useLocale } from '../features/locale/useLocale'
import { lockIcon, userIcon } from '../lib/icons';
import { useEffect, useId, useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAuth } from '../features/auth/context';
import { signInWithPassword, registerWithPassword, requestPasswordReset, getLoginLinkRetryAt } from '../api/auth';
import { LOGIN_RESEND_KEY } from '../features/auth/loginLink';
import { validatePassword } from '../features/auth/password';
import './LoginPage.css';
function PasswordForm() {
    const { t } = useLocale();
    const helpId = useId();
    const { savePassword } = useAuth();
    const [password, setPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const [busy, setBusy] = useState(false);
    const [notice, setNotice] = useState('');
    const [error, setError] = useState('');
    const pending = useRef(false);
    async function save() {
        if (pending.current)
            return;
        pending.current = true;
        setBusy(true);
        setError('');
        setNotice('');
        try {
            validatePassword(password, confirmation);
            await savePassword(password);
            setPassword('');
            setConfirmation('');
            setNotice('パスワードを保存しました。次回からメールアドレスとパスワードでログインできます。');
        }
        catch (error) {
            setError(error instanceof Error ? error.message : 'パスワードを保存できませんでした。');
        }
        finally {
            pending.current = false;
            setBusy(false);
        }
    }
    return <section className="login-password-section" aria-label={t("パスワードの設定")}><h2>{t("パスワードを設定・変更")}</h2><form onSubmit={(event) => { event.preventDefault(); void save(); }}>
    <label>{t("新しいパスワード")}<input type="password" required minLength={8} maxLength={128} autoComplete="new-password" aria-describedby={helpId} disabled={busy} value={password} onChange={(event) => setPassword(event.target.value)}/></label>
    <p id={helpId} className="login-help">{t("8文字以上128文字以下で設定してください。英字・数字・記号の組み合わせをおすすめします。")}</p>
    <label>{t("新しいパスワード（確認）")}<input type="password" required minLength={8} maxLength={128} autoComplete="new-password" aria-describedby={`${helpId}-confirm`} disabled={busy} value={confirmation} onChange={(event) => setConfirmation(event.target.value)}/></label>
    <p id={`${helpId}-confirm`} className="login-help">{t("上と同じパスワードを、もう一度入力してください。")}</p><button type="submit" disabled={busy}>{busy ? t("保存中…") : t("パスワードを保存する")}</button>
  </form>{error && <p role="alert">{t(error)}</p>}{notice && <p role="status">{t(notice)}</p>}</section>;
}
function ProfileForm({ initialName }: {
    initialName: string;
}) {
    const { t } = useLocale();
    const { logout, saveDisplayName } = useAuth();
    const [name, setName] = useState(initialName);
    const [busy, setBusy] = useState(false);
    const [notice, setNotice] = useState('');
    const [error, setError] = useState('');
    const pending = useRef(false);
    async function perform(action: () => Promise<void>) {
        if (pending.current)
            return;
        pending.current = true;
        setBusy(true);
        setNotice('');
        setError('');
        try {
            await action();
        }
        catch (error) {
            setError(error instanceof Error ? error.message : '更新に失敗しました。');
        }
        finally {
            pending.current = false;
            setBusy(false);
        }
    }
    return <>
    <form onSubmit={(event) => { event.preventDefault(); void perform(async () => { await saveDisplayName(name); setNotice('表示名を保存しました。'); }); }}>
      <label>{t("表示名")}<input required maxLength={20} autoComplete="nickname" value={name} disabled={busy} onChange={(event) => setName(event.target.value)} placeholder={t("あなたの名前")}/></label><button type="submit" disabled={busy}>{busy ? t("処理中…") : t("表示名を保存する")}</button>
    </form>{error && <p role="alert">{t(error)}</p>}{notice && <p role="status">{t(notice)}</p>}
    <PasswordForm />
    <div className="login-links"><Link to="/dashboard">{t("ダッシュボードへ →")}</Link><button className="login-secondary" disabled={busy} onClick={() => void perform(logout)}>{t("ログアウト")}</button></div>
  </>;
}
function CredentialsForm() {
    const { t } = useLocale();
    const helpId = useId();
    const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const [busy, setBusy] = useState(false);
    const [notice, setNotice] = useState('');
    const [error, setError] = useState('');
    const [retryAt, setRetryAt] = useState(getLoginLinkRetryAt);
    const [now, setNow] = useState(Date.now);
    const pending = useRef(false);
    useEffect(() => {
        const refresh = () => { setNow(Date.now()); setRetryAt(getLoginLinkRetryAt()); };
        const onStorage = (event: StorageEvent) => { if (event.key === LOGIN_RESEND_KEY || event.key === null)
            refresh(); };
        const timer = window.setInterval(refresh, 1000);
        window.addEventListener('storage', onStorage);
        document.addEventListener('visibilitychange', refresh);
        return () => { window.clearInterval(timer); window.removeEventListener('storage', onStorage); document.removeEventListener('visibilitychange', refresh); };
    }, []);
    const remaining = Math.max(0, Math.ceil((retryAt - now) / 1000));
    function changeMode(next: typeof mode) { setMode(next); setPassword(''); setConfirmation(''); setError(''); setNotice(''); }
    async function submit() {
        if (pending.current)
            return;
        pending.current = true;
        setBusy(true);
        setError('');
        setNotice('');
        try {
            if (mode === 'login')
                await signInWithPassword(email, password);
            else if (mode === 'register') {
                validatePassword(password, confirmation);
                if (!name.trim())
                    throw new Error('表示名を入力してください。');
                const loggedIn = await registerWithPassword(email, password, name);
                setNotice(loggedIn ? '登録しました。' : '確認メールを受け取った場合は、メール内のリンクを開いて登録を完了してください。登録済みの方はログインまたはパスワード再設定をご利用ください。');
            }
            else {
                await requestPasswordReset(email);
                setNotice('対象のアカウントがある場合、パスワード設定用のメールを送信しました。このブラウザでリンクを開いてください。');
            }
            setPassword('');
            setConfirmation('');
        }
        catch (error) {
            setError(error instanceof Error ? error.message : '認証処理に失敗しました。');
        }
        finally {
            pending.current = false;
            setBusy(false);
            setNow(Date.now());
            setRetryAt(getLoginLinkRetryAt());
        }
    }
    return <>
    <div className="login-modes" role="group" aria-label={t("認証方法")}><button type="button" className="login-secondary" aria-pressed={mode === 'login'} disabled={busy} onClick={() => changeMode('login')}>{t("ログイン")}</button><button type="button" className="login-secondary" aria-pressed={mode === 'register'} disabled={busy} onClick={() => changeMode('register')}>{t("新規登録")}</button></div>
    {mode === 'forgot' && <h2>{t("パスワードを再設定")}</h2>}
    <form onSubmit={(event) => { event.preventDefault(); void submit(); }}>
      {mode === 'register' && <label>{t("表示名")}<input required maxLength={20} autoComplete="nickname" value={name} disabled={busy} onChange={(event) => setName(event.target.value)}/></label>}
      <label>{t("メールアドレス")}<input type="email" required maxLength={254} autoComplete="email" value={email} disabled={busy} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com"/></label>
      {mode !== 'forgot' && <><label>{t("パスワード")}<input type="password" required minLength={mode === 'register' ? 8 : undefined} maxLength={128} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} aria-describedby={helpId} value={password} disabled={busy} onChange={(event) => setPassword(event.target.value)}/></label><p id={helpId} className="login-help">{mode === 'register' ? t("8文字以上128文字以下で設定してください。英字・数字・記号の組み合わせをおすすめします。") : t("登録済みのパスワードを入力してください。新しく設定する場合の基準は8文字以上128文字以下です。")}</p></>}
      {mode === 'register' && <><label>{t("パスワード（確認）")}<input type="password" required minLength={8} maxLength={128} autoComplete="new-password" aria-describedby={`${helpId}-confirm`} value={confirmation} disabled={busy} onChange={(event) => setConfirmation(event.target.value)}/></label><p id={`${helpId}-confirm`} className="login-help">{t("上と同じパスワードを、もう一度入力してください。")}</p></>}
      <button type="submit" disabled={busy || (mode !== 'login' && remaining > 0)}>{busy ? t("処理中…") : mode !== 'login' && remaining > 0 ? t("再送まで {0}秒", [remaining]) : mode === 'login' ? t("ログインする") : mode === 'register' ? t("アカウントを作成する") : t("パスワード設定メールを送る")}</button>
    </form>
    {error && <p role="alert">{t(error)}</p>}{notice && <p role="status">{t(notice)}</p>}
    <button type="button" className="login-text-button" disabled={busy} onClick={() => changeMode(mode === 'forgot' ? 'login' : 'forgot')}>{mode === 'forgot' ? t("ログインに戻る") : t("パスワードを忘れた方・初めて設定する方")}</button>
    <p className="login-help">{t("通常のログインではメールを送信しません。新規登録の確認とパスワード再設定はメールが届く必要があります。以前メールリンクで利用していた方は、ログイン済みならプロフィールからパスワードを設定できます。")}</p>
  </>;
}
export default function LoginPage({ profile = false, reset = false }: {
    profile?: boolean;
    reset?: boolean;
}) {
    const { t } = useLocale();
    const { session, ready, error, displayName, isPasswordRecovery } = useAuth();
    if (ready && !error && session && !profile && !reset)
        return <Navigate to={isPasswordRecovery ? '/reset-password' : '/dashboard'} replace/>;
    if (ready && !error && !session && profile)
        return <Navigate to="/login" replace/>;
    return <main id="main" tabIndex={-1} className="login-page"><div className="login-card">
    <span className="login-icon"><FontAwesomeIcon icon={profile ? userIcon : lockIcon} aria-hidden="true"/></span>
    <h1>{reset ? t("パスワードの設定") : profile ? t("あなたのプロフィール") : t("Typing にログイン")}</h1>
    <p>{reset ? t("新しいパスワードを保存してください。") : profile ? t("表示名やパスワードを設定できます。") : t("メールアドレスとパスワードで、練習の続きを。")}</p>
    {!ready ? <p role="status">{t("ログイン状態を確認しています…")}</p> : error ? <p role="alert">{t(error)}</p> : reset ? session ? <><PasswordForm /><Link to="/dashboard">{t("ダッシュボードへ →")}</Link></> : <p role="alert">{t("有効な設定リンクを開いてください。期限切れの場合は")}<Link to="/login">{t("ログインページ")}</Link>{t("から再度メールを送信してください。")}</p> : profile ? <ProfileForm key={session?.user.id} initialName={displayName}/> : <CredentialsForm />}
    <Link className="login-home" to="/">{t("← ホームに戻る")}</Link>
  </div></main>;
}
