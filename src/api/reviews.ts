import { getSupabaseApi } from './supabase'
import { getSupabase } from '../lib/supabase'
import { validateReview, type ReviewInput, type PublicReview } from '../features/reviews/review'

const fields = 'id,display_name,rating,title,comment,created_at'
export async function getPublicReviews(signal?: AbortSignal): Promise<PublicReview[]> {
  const { data } = await getSupabaseApi().get<PublicReview[]>('/rest/v1/app_reviews', { signal, params: { select: fields, order: 'created_at.desc,id.asc', limit: 6 } })
  if (!Array.isArray(data)) throw new Error('レビューを読み込めませんでした。')
  return data
}
async function authHeaders(userId: string) {
  const { data, error } = await getSupabase().auth.getSession()
  if (error || data.session?.user.id !== userId) throw new Error('再度ログインしてください。')
  return { Authorization: `Bearer ${data.session.access_token}` }
}
export async function getOwnReview(userId: string, signal: AbortSignal) {
  const headers = await authHeaders(userId)
  const { data } = await getSupabaseApi().get<PublicReview[]>('/rest/v1/app_reviews', { signal, headers, params: { select: fields, user_id: `eq.${userId}`, limit: 1 } })
  return data[0] ?? null
}
export async function saveReview(userId: string, input: ReviewInput, signal: AbortSignal) {
  const value = validateReview(input)
  const headers = await authHeaders(userId)
  await getSupabaseApi().post('/rest/v1/app_reviews', { ...value, user_id: userId }, {
    signal, params: { on_conflict: 'user_id' }, headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=minimal' },
  })
}
