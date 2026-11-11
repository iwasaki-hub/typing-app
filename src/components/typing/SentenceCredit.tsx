import { useLocale } from '../../features/locale/useLocale'
import type { TatoebaCredit } from '../../features/typing/tatoeba';
import './SentenceCredit.css';
export default function SentenceCredit({ credit }: {
    credit?: TatoebaCredit;
}) {
    const { t } = useLocale();
    if (!credit)
        return null;
    return <span className="sentence-credit">{t("出典：")}<a href={`https://tatoeba.org/en/sentences/show/${credit.sentenceId}`} target="_blank" rel="noopener noreferrer">Tatoeba #{credit.sentenceId}</a>{t("· 作者：")}{credit.author} · <a href={credit.license === 'CC0 1.0' ? 'https://creativecommons.org/publicdomain/zero/1.0/' : 'https://creativecommons.org/licenses/by/2.0/fr/'} target="_blank" rel="noopener noreferrer">{credit.license}</a></span>;
}
