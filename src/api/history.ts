import { getSupabase } from '../lib/supabase'
import { getSupabaseApi } from './supabase'
import { parseHistory, type TypingResult } from '../features/typing/history'

export async function syncHistory(userId: string, results: TypingResult[], signal: AbortSignal) {
  const { data, error } = await getSupabase().auth.getSession()
  if (error || !data.session || data.session.user.id !== userId || signal.aborted) throw new Error('ログイン状態を確認してください。')
  const headers = { Authorization: `Bearer ${data.session.access_token}` }
  const api = getSupabaseApi()
  const reset = await api.get<{ cleared_at: string }[]>('/rest/v1/practice_history_resets', { signal, headers, params: { select: 'cleared_at', user_id: `eq.${userId}` } })
  const clearedAt = reset.data[0]?.cleared_at
  results = results.filter(item => !clearedAt || Date.parse(item.savedAt) > Date.parse(clearedAt))
  if (results.length) await api.post('/rest/v1/practice_results', results.map(result => ({
    user_id: userId, id: result.id, saved_at: result.savedAt, result,
  })), { signal, params: { on_conflict: 'user_id,id' }, headers: { ...headers, Prefer: 'resolution=ignore-duplicates,return=minimal' } })
  const response = await api.get<{ result: TypingResult }[]>('/rest/v1/practice_results', {
    signal, headers, params: { select: 'result', user_id: `eq.${userId}`, order: 'saved_at.desc,id.asc', limit: 100 },
  })
  if (!Array.isArray(response.data)) throw new Error('履歴の応答形式が異なります。')
  return { results: parseHistory(JSON.stringify(response.data.map(row => row.result))), clearedAt }
}

export async function clearCloudHistory(userId: string, signal: AbortSignal) {
  const { data, error } = await getSupabase().auth.getSession()
  if (error || data.session?.user.id !== userId || signal.aborted) throw new Error('ログイン状態を確認してください。')
  const response = await getSupabaseApi().post<string>('/rest/v1/rpc/clear_practice_history', {}, {
    signal, headers: { Authorization: `Bearer ${data.session.access_token}` },
  })
  return response.data
}
