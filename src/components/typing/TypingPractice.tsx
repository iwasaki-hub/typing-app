import { createKoreanPartSoundTracker } from '../../features/typing/koreanPartSound'
import KoreanCompositionGuide from './KoreanCompositionGuide'
import { koreanDraftFeedback } from '../../features/typing/koreanParts'
import { useLocale } from '../../features/locale/useLocale'
import { arrowRightIcon, rotateLeftIcon, volumeHighIcon, volumeXmarkIcon } from '../../lib/icons';
import { useEffect, useReducer, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { PracticeQuote } from '../../api/quotes';
import TypingResultModal from './TypingResultModal';
import LanguageBadge, { LanguageFlag } from './LanguageBadge';
import SentenceCredit from './SentenceCredit';
import { newSession, sessionMetrics, sessionReducer } from '../../features/typing/session';
import { useTypingSound } from '../../features/typing/useTypingSound';
import { useHistory } from '../../features/typing/historyContext';
import type { PracticeLanguage } from '../../features/typing/samples';
import { durationSetting, isDuration, isEnabled, readSetting, statsVisibleSetting, writeSetting } from '../../features/typing/settings';
import './TypingPractice.css';
export default function TypingPractice({ quote, loading, notice, onNext, onLanguageChange }: {
    quote: PracticeQuote;
    loading: boolean;
    notice: string;
    onNext: () => void;
    onLanguageChange: (language: PracticeLanguage) => void;
}) {
    const { t } = useLocale();
    const { store: typingHistory } = useHistory();
    const [session, dispatch] = useReducer(sessionReducer, undefined, newSession);
    const [duration, setDuration] = useState(() => readSetting(durationSetting, 60, isDuration));
    useEffect(() => { writeSetting(durationSetting, duration); }, [duration]);
    const [statsVisible, setStatsVisible] = useState(() => readSetting(statsVisibleSetting, true, isEnabled));
    useEffect(() => { writeSetting(statsVisibleSetting, statsVisible); }, [statsVisible]);
    const [inputNotice, setInputNotice] = useState('');
    const [draft, setDraft] = useState<string | null>(null);
    const composing = useRef(false);
    const partSound = useRef(createKoreanPartSoundTracker());
    const field = useRef<HTMLInputElement>(null);
    const resultButton = useRef<HTMLButtonElement>(null);
    const focusAfterLoad = useRef(false);
    const [dismissedResult, setDismissedResult] = useState<typeof session | null>(null);
    const sound = useTypingSound();
    const text = quote.text;
    const language = quote.language ?? 'en';
    const korean = language === 'ko';
    const running = session.status === 'running';
    const finished = session.status === 'finished';
    const metrics = sessionMetrics(session, text);
    const koreanPreview = korean && draft !== null && !finished ? koreanDraftFeedback(text, draft) : null;
    const savedSession = useRef<typeof session | null>(null);
    useEffect(() => {
        if (session.status !== 'finished' || !session.reason || savedSession.current === session)
            return;
        savedSession.current = session;
        const result = sessionMetrics(session, text);
        typingHistory.save({
            id: crypto.randomUUID(), savedAt: new Date().toISOString(), text, duration, language, cpm: result.cpm,
            credit: quote.credit,
            elapsed: session.elapsed, wpm: result.wpm, accuracy: result.accuracy,
            mistakes: session.mistakes, attempts: session.attempts, correct: result.correct, reason: session.reason,
        });
    }, [session, text, duration, language, typingHistory, quote.credit]);
    useEffect(() => {
        if (!running)
            return;
        const tick = () => dispatch({ type: 'tick', now: performance.now(), duration });
        const timer = window.setInterval(tick, 100);
        document.addEventListener('visibilitychange', tick);
        return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', tick); };
    }, [running, duration]);
    function reset() {
        composing.current = false;
        partSound.current.reset();
        setDraft(null);
        focusAfterLoad.current = true;
        field.current?.focus();
        dispatch({ type: 'reset' });
        setInputNotice('');
    }
    function nextQuestion() {
        if (loading || running)
            return;
        composing.current = false;
        partSound.current.reset();
        setDraft(null);
        focusAfterLoad.current = true;
        dispatch({ type: 'reset' });
        setInputNotice('');
        onNext();
    }
    function dismissResult() {
        setDismissedResult(session);
        // The completed input is disabled; restore focus to the result trigger instead.
        requestAnimationFrame(() => resultButton.current?.focus({ preventScroll: true }));
    }
    useEffect(() => {
        if (!loading && session.status === 'ready' && focusAfterLoad.current) {
            focusAfterLoad.current = false;
            field.current?.focus();
        }
    }, [loading, session.status, text]);
    function handleInput(value: string, isComposing: boolean, committed = false) {
        if (loading || finished) return;
        if (isComposing) {
            if (korean) {
                if (session.startedAt !== null && performance.now() - session.startedAt >= duration * 1000) {
                    dispatch({ type: 'tick', now: performance.now(), duration });
                    return;
                }
                setDraft(value);
                const kind = partSound.current.update(value, text);
                if (kind) void sound.play(kind);
            } else
                setInputNotice('英字入力に切り替えてください。');
            return;
        }
        const now = performance.now();
        const action = { type: 'input' as const, value, text, now, duration, language, composed: committed };
        const next = sessionReducer(session, action);
        if (next === session)
            return;
        dispatch(action);
        setInputNotice('');
        const partKind = korean && next.reason !== 'timeout' ? partSound.current.update(value, text) : null;
        if (next.reason === 'completed')
            void sound.play('complete');
        else if (korean) {
            if (partKind) void sound.play(partKind);
        }
        else if (next.attempts > session.attempts)
            void sound.play(next.mistakes > session.mistakes ? 'error' : 'key');
    }
    return (<section className="typing-practice" data-stats-visible={statsVisible} id="practice" aria-labelledby="practice-title">
      <div className="typing-heading"><h2 id="practice-title">{t("タイピング練習")}</h2><div className="typing-language-context"><LanguageBadge language={language}/><span>{text.length}{t("文字")}</span></div></div>
      <div className="typing-settings">
        <label>{t("練習言語")}<select value={language} disabled={running} onChange={(event) => onLanguageChange(event.target.value === 'ko' ? 'ko' : 'en')}><option value="en">{t("🇺🇸 英語")}</option><option value="ko">{t("🇰🇷 韓国語")}</option></select></label>
        <label>{t("制限時間")}<select value={duration} disabled={running || loading} onChange={(event) => { setDuration(Number(event.target.value)); reset(); }}><option value={30}>{t("30秒")}</option><option value={60}>{t("60秒")}</option><option value={120}>{t("120秒")}</option></select></label>
        <label>{t("練習状況")}<select value={statsVisible ? 'show' : 'hide'} onChange={(event) => setStatsVisible(event.target.value === 'show')}><option value="show">{t("表示")}</option><option value="hide">{t("非表示")}</option></select></label>
        <span className="typing-settings-break" aria-hidden="true"/>
        <label>{t("打鍵音")}<FontAwesomeIcon className={`typing-sound-icon${sound.enabled ? ' is-enabled' : ''}`} icon={sound.enabled ? volumeHighIcon : volumeXmarkIcon} aria-hidden="true"/><select value={sound.enabled ? 'on' : 'off'} onChange={(event) => { if ((event.target.value === 'on') !== sound.enabled)
        sound.toggle(); }}><option value="on">ON</option><option value="off">OFF</option></select></label>
        <label>{t("音の種類")}<select value={sound.preset} onChange={(event) => sound.selectPreset(event.target.value)}>{Object.entries(sound.presets).map(([value, preset]) => <option key={value} value={value}>{t(preset.label)}</option>)}</select></label>
        <button type="button" onClick={sound.preview} disabled={sound.volume === 0} aria-label={t("選択中のタイピング音を試聴する")}><FontAwesomeIcon icon={volumeHighIcon} aria-hidden="true"/>{t("試聴")}</button>
        <label className="typing-volume">{t("音量")}<input type="range" min="0" max="100" value={Math.round(sound.volume * 100)} onChange={(event) => sound.setVolume(Number(event.target.value) / 100)} aria-label={t("タイピング音の音量")}/><span>{Math.round(sound.volume * 100)}%</span></label>
      </div>
      {sound.notice && <p className="typing-notice" role="status">{t(sound.notice)}</p>}
      {statsVisible && <dl className="typing-stats" aria-label={t("練習状況")}>
        <div><dt>{t("残り時間")}</dt><dd className={duration - session.elapsed < 10 ? 'typing-urgent' : ''}>{Math.ceil(duration - session.elapsed)}<small>{t("秒")}</small></dd></div>
        <div><dt>{t("入力速度")}</dt><dd>{korean ? metrics.cpm : metrics.wpm}<small> {korean ? 'CPM' : 'WPM'}</small></dd></div>
        <div><dt>{t("正確率")}</dt><dd>{metrics.accuracy}<small> %</small></dd></div>
        <div><dt>{t("ミス")}</dt><dd>{session.mistakes}<small>{t("回")}</small></dd></div>
      </dl>}
      <div className="typing-body">
        <p className="typing-notice" role="status">{t(notice)}</p>
        <p className={`typing-text${korean ? ' typing-text-korean' : ''}`} lang={language} aria-label={text}>{[...text].map((letter, index) => {
          const previewState = koreanPreview?.characters[index]?.state;
          const color = previewState === 'partial' ? 'typing-partial' : previewState === 'correct' ? 'typing-correct' : previewState === 'incorrect' ? 'typing-incorrect' : koreanPreview ? '' : index < session.input.length ? session.input[index] === letter ? 'typing-correct' : 'typing-incorrect' : '';
          const cursor = !finished && index === (koreanPreview?.activeIndex ?? session.input.length);
          return <span key={index} aria-hidden="true" className={`${color} ${cursor ? 'typing-cursor' : ''}`}>{letter}</span>;
        })}</p>
        {korean && !finished && <KoreanCompositionGuide text={text} committed={session.input} draft={draft} />}
        {quote.source === 'tatoeba' ? <SentenceCredit credit={quote.credit}/> : <p className="typing-credit">{quote.source === 'dummyjson' ? <>{t("出典:")}<a href="https://dummyjson.com/docs/quotes" target="_blank" rel="noopener noreferrer">DummyJSON</a>{quote.author && ` / ${quote.author}`}</> : t("オリジナル練習文")}</p>}
        <label htmlFor="typing-input" className="typing-input-label">{finished ? t("練習が終了しました") : t("{0}を入力（最初の入力で計測開始）", [korean ? t("韓国語") : t("英文")])}</label>
        <div className="typing-input-wrap">
        <span className="typing-input-flag" aria-hidden="true"><LanguageFlag language={language}/></span>
        <input ref={field} id="typing-input" className="typing-input" lang={language} value={finished ? session.input : draft ?? session.input} disabled={loading || finished} onCompositionStart={() => { composing.current = true; if (korean) {
        setDraft(session.input);
        dispatch({ type: 'start', now: performance.now(), duration });
    } }} onCompositionEnd={(event) => { composing.current = false; setDraft(null); if (korean)
        handleInput(event.currentTarget.value, false, true);
    else
        setInputNotice('英字入力に切り替えてください。'); }} onChange={(event) => handleInput(event.target.value, composing.current || (event.nativeEvent as InputEvent).isComposing)} onSelect={(event) => { if (composing.current)
        return; const target = event.currentTarget; target.setSelectionRange(target.value.length, target.value.length); }} onPaste={(event) => { event.preventDefault(); setInputNotice('練習中は貼り付けできません。キーボードで入力してください。'); }} onDrop={(event) => event.preventDefault()} autoComplete="off" autoCapitalize="off" spellCheck={false} maxLength={text.length + (korean ? 2 : 0)} aria-describedby="typing-help" placeholder={korean ? t("ここに韓国語を入力してください") : t("ここに英文を入力してください")}/>
        </div>
        <p className="typing-notice" id="typing-help" role="status">{t(inputNotice) || (korean ? t("韓国語キーボード（IME）で入力してください。組み立て中はパーツごとに色で確認でき、ミスは確定後に記録します。貼り付けは無効です。") : running ? t("Backspace で修正できます。修正前のミスも正確率に含まれます。") : t("英字入力で練習してください。貼り付けは無効です。"))}</p>
        <label className="typing-progress-label">{t("進み具合")}{metrics.progress}%<progress max="100" value={metrics.progress}/></label>
        {finished && <button ref={resultButton} type="button" className="typing-result-open" onClick={() => setDismissedResult(null)}>{t("結果を表示する")}</button>}
        {finished && dismissedResult !== session && <TypingResultModal language={language} session={session} wpm={korean ? metrics.cpm : metrics.wpm} speedUnit={korean ? 'CPM' : 'WPM'} accuracy={metrics.accuracy} correct={metrics.correct} total={text.length} loading={loading} onNext={nextQuestion} onRetry={reset} onDismiss={dismissResult}/>}
        <div className="typing-actions">
          <button type="button" disabled={loading} onClick={reset}><FontAwesomeIcon icon={rotateLeftIcon} aria-hidden="true"/>{t("同じ文でやり直す")}</button>
          {running && <button type="button" onClick={() => dispatch({ type: 'stop', now: performance.now(), duration })}>{t("ここで終了")}</button>}
          <button type="button" className="typing-next" onClick={nextQuestion} disabled={loading || running}>{loading ? t("読み込み中…") : t("次の問題")} <FontAwesomeIcon icon={arrowRightIcon} aria-hidden="true"/></button>
        </div>
        <p className="typing-footnote">{korean ? t("CPM は1分あたりの正しく入力した確定文字数です。ハングル1音節を1文字として数えます。") : t("WPM は正しく入力した5文字を1語として換算。")}{t("1文の入力完了、または制限時間で終了します。")}</p>
      </div>
    </section>);
}
