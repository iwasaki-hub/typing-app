import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

let client: ReturnType<typeof createClient> | undefined

export function getSupabase() {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error('Supabase の接続設定がありません。環境変数を設定して再デプロイしてください。')
  }
  client ??= createClient(supabaseUrl, supabasePublishableKey)
  return client
}
