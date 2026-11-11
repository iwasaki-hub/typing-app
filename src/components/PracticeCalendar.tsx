import { getFormattingLocale } from '../features/locale/store'
import { useLocale } from '../features/locale/useLocale'
import SentenceCredit from './SentenceCredit';
import LanguageBadge from './LanguageBadge';
import { chevronLeftIcon, chevronRightIcon } from '../lib/icons';
import { useId, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { formatResultSpeed, type TypingResult } from '../features/typing/history';
import { groupResultsByDay, localDateKey, monthCells } from '../features/typing/calendar';
import './PracticeCalendar.css';
const reasons = { completed: 'クリア', timeout: '時間切れ', stopped: '手動終了' };
const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
export default function PracticeCalendar({ results }: {
    results: TypingResult[];
}) {
    const { t } = useLocale();
    const [selected, setSelected] = useState(() => new Date());
    const titleId = useId();
    const detailId = useId();
    const year = selected.getFullYear();
    const month = selected.getMonth();
    const selectedKey = localDateKey(selected);
    const todayKey = localDateKey(new Date());
    const grouped = groupResultsByDay(results);
    const entries = grouped.get(selectedKey) ?? [];
    const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}-`;
    const activeDays = [...grouped.keys()].filter((key) => key.startsWith(monthPrefix)).length;
    const cells = monthCells(year, month);
    function changeMonth(offset: number) { setSelected(new Date(year, month + offset, 1)); }
    return <div className="practice-calendar">
    <div className="calendar-heading"><h3 id={titleId} aria-live="polite">{year}{t("年")}{month + 1}{t("月")}</h3><div><button type="button" aria-label={t("前の月")} onClick={() => changeMonth(-1)}><FontAwesomeIcon icon={chevronLeftIcon} aria-hidden="true"/></button><button type="button" onClick={() => setSelected(new Date())}>{t("今日")}</button><button type="button" aria-label={t("次の月")} onClick={() => changeMonth(1)}><FontAwesomeIcon icon={chevronRightIcon} aria-hidden="true"/></button></div></div>
    <p>{t("この月の練習日数：")}{activeDays}{t("日。日付を選ぶと、その日の記録を表示します。")}</p>
    <table aria-labelledby={titleId}><thead><tr>{weekdays.map((day) => <th scope="col" key={t(String(day))}>{t(String(day))}</th>)}</tr></thead><tbody>{Array.from({ length: cells.length / 7 }, (_, week) => <tr key={week}>{cells.slice(week * 7, week * 7 + 7).map((day, index) => {
                if (day === null)
                    return <td key={index}/>;
                const key = localDateKey(new Date(year, month, day));
                const count = grouped.get(key)?.length ?? 0;
                return <td key={index}><button type="button" className={`${count ? 'calendar-practiced' : ''}${key === selectedKey ? ' calendar-selected' : ''}`} aria-label={t("{0}年{1}月{2}日、練習{3}件", [year, month + 1, t(String(day)), count])} aria-pressed={key === selectedKey} aria-current={key === todayKey ? 'date' : undefined} aria-controls={detailId} onClick={() => setSelected(new Date(year, month, day))}><span>{t(String(day))}</span>{count > 0 && <small>{count}<span className="calendar-unit">{t("件")}</span></small>}</button></td>;
            })}</tr>)}</tbody></table>
    <section id={detailId} className="calendar-detail" aria-labelledby={`${detailId}-title`}><h3 id={`${detailId}-title`}>{month + 1}{t("月")}{selected.getDate()}{t("日の記録")}<small>{entries.length}{t("件")}</small></h3>
      {entries.length === 0 ? <p>{t("この日の練習記録はありません。")}</p> : <ul>{entries.map((result) => <li key={result.id}><div><time dateTime={result.savedAt}>{new Date(result.savedAt).toLocaleTimeString(getFormattingLocale(), { hour: '2-digit', minute: '2-digit' })}</time><LanguageBadge language={result.language} compact/><span>{t(reasons[result.reason])} · {result.duration}{t("秒設定")}</span></div><strong>{formatResultSpeed(result)} <small>{t("正確率")}{result.accuracy}{t("% · ミス")}{result.mistakes}{t("回")}</small></strong><p>{result.text}</p><SentenceCredit credit={result.credit}/></li>)}</ul>}
    </section>
  </div>;
}
