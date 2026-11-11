import { useLocale } from '../../features/locale/useLocale'
import { useEffect, useRef, useState } from 'react';
import TypingPractice from './TypingPractice';
import { fallbackQuotes, getFallbackQuote, getPracticeQuote } from '../../api/quotes';
import type { PracticeLanguage } from '../../features/typing/samples';
import { createKoreanQueue, koreanFallback } from '../../features/typing/koreanQueue';
import { getKoreanBatch } from '../../api/tatoeba';
import { isLanguage, languageSetting, readSetting, writeSetting } from '../../features/typing/settings';
type LanguageProps = {
    onLanguageChange: (language: PracticeLanguage) => void;
};
function EnglishPractice({ onLanguageChange }: LanguageProps) {
    const { t } = useLocale();
    const [quote, setQuote] = useState(fallbackQuotes[0]);
    const [loading, setLoading] = useState(true);
    const [notice, setNotice] = useState('英文を読み込んでいます…');
    const request = useRef<AbortController | null>(null);
    const pending = useRef(false);
    useEffect(() => {
        const controller = new AbortController();
        request.current = controller;
        getPracticeQuote(undefined, controller.signal).then((next) => {
            if (!controller.signal.aborted) {
                setQuote(next);
                setNotice('新しい英文を用意しました。');
            }
        }).catch(() => {
            if (!controller.signal.aborted)
                setNotice('英文を取得できなかったため、アプリ内の例文を表示しています。');
        }).finally(() => {
            if (!controller.signal.aborted)
                setLoading(false);
        });
        return () => { controller.abort(); request.current?.abort(); };
    }, []);
    async function nextQuestion() {
        if (loading || pending.current)
            return;
        pending.current = true;
        const controller = new AbortController();
        request.current = controller;
        setLoading(true);
        setNotice('英文を読み込んでいます…');
        try {
            const next = await getPracticeQuote(quote.text, controller.signal);
            if (!controller.signal.aborted) {
                setQuote(next);
                setNotice('新しい英文を用意しました。');
            }
        }
        catch {
            if (!controller.signal.aborted) {
                setQuote(getFallbackQuote(quote.text));
                setNotice('英文を取得できなかったため、アプリ内の例文を表示しています。');
            }
        }
        finally {
            pending.current = false;
            if (!controller.signal.aborted)
                setLoading(false);
        }
    }
    return <TypingPractice quote={quote} loading={loading} notice={t(notice)} onNext={nextQuestion} onLanguageChange={onLanguageChange}/>;
}
function KoreanPractice({ onLanguageChange }: LanguageProps) {
    const { t } = useLocale();
    const [quote, setQuote] = useState(() => koreanFallback());
    const [loading, setLoading] = useState(true);
    const queue = useRef<ReturnType<typeof createKoreanQueue> | null>(null);
    const pending = useRef(false);
    useEffect(() => {
        const current = createKoreanQueue({ load: getKoreanBatch, storage: () => window.sessionStorage });
        queue.current = current;
        let active = true;
        current.next().then(next => { if (active) {
            setQuote(next);
            setLoading(false);
        } }).catch(() => { if (active)
            setLoading(false); });
        return () => { active = false; current.dispose(); if (queue.current === current)
            queue.current = null; };
    }, []);
    async function nextQuestion() {
        const current = queue.current;
        if (!current || loading || pending.current)
            return;
        pending.current = true;
        setLoading(true);
        try {
            const next = await current.next(quote.text);
            if (queue.current === current)
                setQuote(next);
        }
        finally {
            pending.current = false;
            if (queue.current === current)
                setLoading(false);
        }
    }
    return <TypingPractice quote={quote} loading={loading} notice={loading ? t("韓国語の例文を用意しています…") : quote.source === 'tatoeba' ? t("Tatoeba の韓国語例文です。残りが少なくなると自動で補充します。") : t("APIの例文を利用できないため、アプリ内の25文から出題しています。")} onNext={() => { void nextQuestion().catch(() => { }); }} onLanguageChange={onLanguageChange}/>;
}
export default function QuotePractice() {
    const [language, setLanguage] = useState<PracticeLanguage>(() => readSetting(languageSetting, 'en', isLanguage));
    useEffect(() => { writeSetting(languageSetting, language); }, [language]);
    return language === 'en' ? <EnglishPractice onLanguageChange={setLanguage}/> : <KoreanPractice onLanguageChange={setLanguage}/>;
}
