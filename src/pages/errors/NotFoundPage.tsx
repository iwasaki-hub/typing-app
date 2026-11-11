import { useLocale } from '../../features/locale/useLocale'
import { Link } from 'react-router-dom';
import './NotFoundPage.css';
export default function NotFoundPage() {
    const { t } = useLocale();
    return <main id="main" tabIndex={-1} className="not-found-page"><p>404</p><h1>{t("ページが見つかりません")}</h1><p>{t("URL を確認するか、ホームからお進みください。")}</p><Link to="/">{t("ホームに戻る")}</Link><Link to="/practice">{t("タイピングを練習する")}</Link></main>;
}
