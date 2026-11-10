import { isAxiosError } from 'axios'
import { getSupabase } from '../lib/supabase'
import { getSupabaseApi } from './supabase'
import type { TypingResult } from '../features/typing/history'
import { isRankingEligible } from '../features/typing/ranking'

export interface RankingEntry {
  id: string; user_id: string; display_name: string; duration: number
  wpm: number; accuracy: number; elapsed: number; created_at: string
}

export async function getRanking(duration: number, signal?: AbortSignal): Promise<RankingEntry[]> {
  const { data } = await getSupabaseApi().get<RankingEntry[]>('/rest/v1/typing_leaderboard', {
    signal, params: { select: 'id,user_id,display_name,duration,wpm,accuracy,elapsed,created_at', duration: `eq.${duration}`, order: 'wpm.desc,accuracy.desc,created_at.asc,id.asc', limit: 100 },
  })
  if (!Array.isArray(data)) throw new Error('ランキングの応答を確認できませんでした。')
  return data
}

export async function publishResult(result: TypingResult, name: string) {
  if (!isRankingEligible(result)) throw new Error('この結果はランキングの対象外です。')
  const displayName = name.trim()
  if (!displayName || [...displayName].length > 20 || [...displayName].some((char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)) throw new Error('表示名は1〜20文字で入力してください。')
  const { data, error } = await getSupabase().auth.getSession()
  if (error || !data.session) throw new Error('先にメールでログインしてください。')
  try {
    await getSupabaseApi().post('/rest/v1/typing_scores', {
      id: result.id, user_id: data.session.user.id, display_name: displayName,
      duration: result.duration, elapsed: result.elapsed, correct: result.correct,
      attempts: result.attempts, mistakes: result.mistakes,
      text_length: result.text.length, reason: result.reason,
    }, { headers: { Authorization: `Bearer ${data.session.access_token}`, Prefer: 'return=minimal' } })
  } catch (error) {
    // A retry after a lost response is successful only if the same owner's record exists.
    if (!isAxiosError(error) || error.response?.data?.code !== '23505') throw error
    const { data: existing } = await getSupabaseApi().get<RankingEntry[]>('/rest/v1/typing_scores', {
      params: { select: 'id', id: `eq.${result.id}`, user_id: `eq.${data.session.user.id}` },
    })
    if (!existing.length) throw new Error('同じIDの記録が既に登録されています。新しい練習結果で投稿してください。', { cause: error })
  }
}

export function rankingError(error: unknown) {
  if (isAxiosError(error)) {
    if (error.response?.status === 401) return 'ログインの有効期限が切れました。再度ログインしてください。'
    return 'ランキングに接続できませんでした。時間をおいて再試行してください。'
  }
  return error instanceof Error ? error.message : '処理に失敗しました。'
}
