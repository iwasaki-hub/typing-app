import { useLocale } from '../../features/locale/useLocale'
import { arrowRightIcon, flagCheckeredIcon, rotateLeftIcon, xmarkIcon, speedIcon, accuracyIcon, circleExclamationIcon } from '../../lib/icons';
import { Description, Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { m } from 'motion/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { CSSProperties } from 'react';
import type { TypingSession } from '../../features/typing/session';
import type { PracticeLanguage } from '../../features/typing/samples';
import LanguageBadge from './LanguageBadge';
import './TypingResultModal.css';
const petals = Array.from({ length: 80 }, (_, index) => ({
    left: index % 2 === 0 ? '2%' : '98%',
    '--petal-color': ['#f2a8c4', '#edc0e8', '#f5c5a5', '#d6c2ef', '#f5d890'][index % 5],
    '--petal-distance': `${(index % 2 === 0 ? 1 : -1) * (28 + (Math.floor(index / 2) * 13) % 49)}vw`,
    '--petal-rise': `${-(58 + (Math.floor(index / 2) * 7) % 37)}vh`,
    '--petal-turn': `${(index % 2 ? -1 : 1) * (180 + index * 23)}deg`,
    '--petal-duration': `${2.7 + (Math.floor(index / 2) % 9) * 0.1}s`,
    '--petal-delay': `${(Math.floor(index / 2) % 6) * 0.025}s`,
    width: `${7 + index % 5}px`,
    height: `${10 + index % 6}px`,
} as CSSProperties));
export default function TypingResultModal({ session, language = 'en', wpm, speedUnit = 'WPM', accuracy, correct, total, loading, onNext, onRetry, onDismiss }: {
    session: TypingSession;
    wpm: number;
    accuracy: number;
    correct: number;
    total: number;
    loading: boolean;
    speedUnit?: 'WPM' | 'CPM';
    language?: PracticeLanguage;
    onNext: () => void;
    onRetry: () => void;
    onDismiss: () => void;
}) {
    const { t } = useLocale();
    return <Dialog open onClose={onDismiss} className="typing-result-modal">
    <DialogBackdrop className="result-modal-backdrop"/>
    <div className="result-confetti" aria-hidden="true">{petals.map((style, index) => <span key={index} style={style}/>)}</div>
    <div className="result-modal-viewport"><div className="result-modal-center">
    <DialogPanel as={m.div} className="result-modal-panel" initial={{ opacity: 0, y: 14, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}>
      <button type="button" className="result-modal-close" aria-label={t("結果を閉じる")} onClick={onDismiss}><FontAwesomeIcon icon={xmarkIcon} aria-hidden="true"/></button>
      <span className="result-modal-icon"><FontAwesomeIcon icon={flagCheckeredIcon} aria-hidden="true"/></span>
      <DialogTitle>{session.reason === 'completed' ? t("クリア！ おつかれさまでした。") : session.reason === 'timeout' ? t("時間になりました。") : t("練習を終了しました。")}</DialogTitle>
      <Description>{session.elapsed.toFixed(1)}{t("秒で、")}{correct} / {total}{t("文字を正しく入力しました。")}</Description>
      <LanguageBadge language={language}/>
      <dl className="result-modal-stats"><div><dt><FontAwesomeIcon icon={speedIcon} className="result-speed-icon" aria-hidden="true"/>{t("入力速度")}</dt><dd>{wpm}<small> {speedUnit}</small></dd></div><div><dt><FontAwesomeIcon icon={accuracyIcon} className="result-accuracy-icon" aria-hidden="true"/>{t("正確率")}</dt><dd>{accuracy}<small> %</small></dd></div><div><dt><FontAwesomeIcon icon={circleExclamationIcon} className="result-mistakes-icon" aria-hidden="true"/>{t("ミス")}</dt><dd>{session.mistakes}<small>{t("回")}</small></dd></div></dl>
      <div className="result-modal-actions"><button type="button" className="result-modal-next" disabled={loading} onClick={onNext} data-autofocus>{t("次の問題")}<FontAwesomeIcon icon={arrowRightIcon} aria-hidden="true"/></button><button type="button" disabled={loading} onClick={onRetry}><FontAwesomeIcon icon={rotateLeftIcon} aria-hidden="true"/>{t("同じ文でやり直す")}</button></div>
      <p className="result-modal-hint">{t("Esc キーでも閉じられます。")}</p>
    </DialogPanel>
    </div></div>
  </Dialog>;
}
