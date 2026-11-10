import { loadEnv } from 'vite'

const env = loadEnv('development', process.cwd(), 'VITE_')
const url = env.VITE_SUPABASE_URL
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!url || !key) {
  throw new Error('.env.local に Supabase の URL と Publishable key を設定してください。')
}

const response = await fetch(new URL('/auth/v1/settings', url), {
  headers: { apikey: key },
  signal: AbortSignal.timeout(15000),
})

if (!response.ok) {
  throw new Error(`Supabase 接続確認に失敗しました (HTTP ${response.status})`)
}

console.log('Supabase Auth API への接続に成功しました。')
