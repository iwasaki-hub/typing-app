import type { TypingResult } from './history'

export function isRankingEligible(result: TypingResult) {
  return ['completed', 'timeout'].includes(result.reason)
    && [30, 60, 120].includes(result.duration)
    && Number.isFinite(result.elapsed) && result.elapsed >= 5 && result.elapsed <= result.duration
    && Number.isInteger(result.correct) && result.correct > 0 && result.correct <= result.text.length
    && result.text.length >= 20 && result.text.length <= 180
    && /^[\x20-\x7e]+$/.test(result.text)
    && result.wpm > 0 && result.wpm <= 300
    && Number.isInteger(result.mistakes) && result.mistakes >= 0
    && Number.isInteger(result.attempts) && Number(result.attempts) >= result.correct + result.mistakes && Number(result.attempts) <= 10000
    && (result.reason !== 'completed' || result.correct === result.text.length)
    && (result.reason !== 'timeout' || result.elapsed === result.duration)
}
