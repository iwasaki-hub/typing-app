import { getSupabase } from '../lib/supabase'
import { getSupabaseApi } from './supabase'
import { parseHistory, type TypingResult } from '../features/typing/history'

export async function syncHistory(userId: string, results: TypingResult[], signal: AbortSignal): Promise<TypingResult[]> {
  const { data, error } = await getSupabase().auth.getSession()
  if (error || !data.session || data.session.user.id !== userId || signal.aborted) throw new Error('ログイン状態を確認してください。')
  const headers = { Authorization: `Bearer ${data.session.access_token}` }
  const api = getSupabaseApi()
  if (results.length) await api.post('/rest/v1/practice_results', results.map(result => ({
    user_id: userId, id: result.id, saved_at: result.savedAt, result,
  })), { signal, params: { on_conflict: 'user_id,id' }, headers: { ...headers, Prefer: 'resolution=ignore-duplicates,return=minimal' } })
  const response = await api.get<{ result: TypingResult }[]>('/rest/v1/practice_results', {
    signal, headers, params: { select: 'result', user_id: `eq.${userId}`, order: 'saved_at.desc,id.asc', limit: 100 },
  })
  if (!Array.isArray(response.data)) throw new Error('履歴の応答形式が異なります。')
  return parseHistory(JSON.stringify(response.data.map(row => row.result)))
}
