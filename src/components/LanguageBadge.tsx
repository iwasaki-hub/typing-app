import { useLocale } from '../features/locale/useLocale'
import type { PracticeLanguage } from '../features/typing/samples';
import './LanguageBadge.css';
const languages = {
    en: { name: '英語', flag: '/flags/us.svg' },
    ko: { name: '韓国語', flag: '/flags/kr.svg' },
};
export function LanguageFlag({ language = 'en' }: {
    language?: PracticeLanguage;
}) {
    return <img src={languages[language].flag} width="26" height="18" alt=""/>;
}
export default function LanguageBadge({ language = 'en', compact = false }: {
    language?: PracticeLanguage;
    compact?: boolean;
}) {
    const { t } = useLocale();
    const selected = languages[language];
    return <span className={`language-badge${compact ? ' language-badge-compact' : ''}`} data-language={language}>
    <LanguageFlag language={language}/>
    <span>{t(selected.name)}</span>
  </span>;
}
