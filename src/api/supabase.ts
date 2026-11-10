import { createApiClient } from './client'

let client: ReturnType<typeof createApiClient> | undefined

function getSupabaseApi() {
  if (client) return client
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) {
    throw new Error('Supabase の接続設定が不足しています。下の手順で環境変数を設定してください。')
  }
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    throw new Error('Supabase の URL の形式を確認してください。')
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Supabase の URL には http または https を指定してください。')
  }
  client = createApiClient(parsed.origin, { apikey: key })
  return client
}

export async function checkSupabaseConnection(signal?: AbortSignal): Promise<void> {
  const { data } = await getSupabaseApi().get('/auth/v1/settings', { signal })
  if (!data || typeof data !== 'object' || !('external' in data)) {
    throw new Error('接続先から想定した応答がありませんでした。Supabase の URL を確認してください。')
  }
}
