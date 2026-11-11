import { getFormattingLocale } from '../../features/locale/store'
import { useLocale } from '../../features/locale/useLocale'
import SentenceCredit from './SentenceCredit';
import { useId, useState } from 'react';
import LanguageBadge from './LanguageBadge';
import type { TypingResult } from '../../features/typing/history';
import type { PracticeLanguage } from '../../features/typing/samples';
import { chartResults, chartSpeed, speedCeiling } from '../../features/typing/chart';
import './PracticeChart.css';
const dateLabel = (value: string) => new Date(value).toLocaleString(getFormattingLocale(), { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
const reasons = { completed: 'クリア', timeout: '時間切れ', stopped: '手動終了' };
function LineChart({ results, metric, selectedId, onSelect }: {
    results: TypingResult[];
    metric: 'speed' | 'accuracy';
    selectedId: string;
    onSelect: (id: string) => void;
}) {
    const { t } = useLocale();
    const titleId = useId();
    const speed = metric === 'speed';
    const unit = speed ? results[0].language === 'ko' ? 'CPM' : 'WPM' : '%';
    const ceiling = speed ? speedCeiling(results) : 100;
    const width = Math.max(640, results.length * 22);
    const height = 220;
    const left = 56, right = width - 30, top = 18, bottom = 174;
    const points = results.map((result, index) => ({
        result, value: speed ? chartSpeed(result) : result.accuracy,
        x: results.length === 1 ? (left + right) / 2 : left + index / (results.length - 1) * (right - left),
        y: bottom - (speed ? chartSpeed(result) : result.accuracy) / ceiling * (bottom - top),
    }));
    const labels = new Set([0, Math.floor((results.length - 1) / 2), results.length - 1]);
    return <figure className={`practice-line-chart ${speed ? 'chart-speed' : 'chart-accuracy'}`} aria-labelledby={titleId}>
    <figcaption id={titleId}>{speed ? t("入力速度") : t("正確率")} <span>（{unit}）</span></figcaption>
    <div className="practice-chart-scroll" role="region" aria-label={t("{0}のグラフ（横にスクロールできます）", [speed ? t("入力速度") : t("正確率")])} tabIndex={0}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ minWidth: width }} aria-hidden="true">
        {[0, 1, 2, 3, 4].map(index => {
            const y = bottom - index / 4 * (bottom - top);
            return <g key={index}><line className="chart-grid" x1={left} x2={right} y1={y} y2={y}/><text x={left - 10} y={y + 4} textAnchor="end">{Number((ceiling * index / 4).toFixed(1))}</text></g>;
        })}
        {points.length > 1 && <polyline className="chart-line" points={points.map(p => `${p.x},${p.y}`).join(' ')}/>}
        {points.map((point, index) => <g key={point.result.id}>
          {point.result.id === selectedId && <line className="chart-selected-line" x1={point.x} x2={point.x} y1={top} y2={bottom}/>}
          <circle className="chart-hit" cx={point.x} cy={point.y} r={10} onMouseEnter={() => onSelect(point.result.id)} onClick={() => onSelect(point.result.id)}><title>{dateLabel(point.result.savedAt)}：{point.value} {unit}</title></circle>
          <circle className="chart-dot" cx={point.x} cy={point.y} r={point.result.id === selectedId ? 5 : 3}/>
          {labels.has(index) && <text x={point.x} y={bottom + 27} textAnchor={points.length === 1 ? 'middle' : index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'middle'}>{dateLabel(point.result.savedAt)}</text>}
        </g>)}
      </svg>
    </div>
  </figure>;
}
export default function PracticeChart({ results }: {
    results: TypingResult[];
}) {
    const { t } = useLocale();
    const [language, setLanguage] = useState<PracticeLanguage>(() => results[0]?.language ?? 'en');
    const [limit, setLimit] = useState(30);
    const [selectedId, setSelectedId] = useState('');
    const entries = chartResults(results, language, limit);
    const selected = entries.find(item => item.id === selectedId) ?? entries.at(-1);
    return <div className="practice-chart">
    <div className="practice-chart-controls">
      <label>{t("練習言語")}<select value={language} onChange={event => { setLanguage(event.target.value === 'ko' ? 'ko' : 'en'); setSelectedId(''); }}><option value="en">{t("🇺🇸 英語")}</option><option value="ko">{t("🇰🇷 韓国語")}</option></select></label>
      <label>{t("表示件数")}<select value={limit} onChange={event => setLimit(Number(event.target.value))}><option value={30}>{t("直近30件")}</option><option value={100}>{t("最大100件")}</option></select></label>
      <LanguageBadge language={language}/>
    </div>
    <p>{t("横軸は練習順（古い → 新しい）です。点に触れるか、下の選択欄で各回の結果を確認できます。手動終了の記録も含みます。")}</p>
    {!selected ? <p>{t("この言語の練習記録はまだありません。")}</p> : <>
      <LineChart results={entries} metric="speed" selectedId={selected.id} onSelect={setSelectedId}/>
      <LineChart results={entries} metric="accuracy" selectedId={selected.id} onSelect={setSelectedId}/>
      <div className="practice-chart-detail">
        <label>{t("結果を確認")}<select value={selected.id} onChange={event => setSelectedId(event.target.value)}>{entries.map((entry, index) => <option key={entry.id} value={entry.id}>{index + 1}. {dateLabel(entry.savedAt)} · {chartSpeed(entry)} {language === 'ko' ? 'CPM' : 'WPM'} · {entry.accuracy}%</option>)}</select></label>
        <dl><div><dt>{t("入力速度")}</dt><dd>{chartSpeed(selected)} {language === 'ko' ? 'CPM' : 'WPM'}</dd></div><div><dt>{t("正確率")}</dt><dd>{selected.accuracy}%</dd></div><div><dt>{t("ミス")}</dt><dd>{selected.mistakes}{t("回")}</dd></div><div><dt>{t("結果")}</dt><dd>{t(reasons[selected.reason])}（{selected.duration}{t("秒設定）")}</dd></div></dl>
        <p>{selected.text}</p><SentenceCredit credit={selected.credit}/>
      </div>
    </>}
  </div>;
}
