import { loadEnv } from 'vite'
import { createApiClient } from '../src/api/client.ts'

const env = loadEnv('development', process.cwd(), 'VITE_')
const url = env.VITE_SUPABASE_URL
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!url || !key) {
  throw new Error('.env.local に Supabase の URL と Publishable key を設定してください。')
}

const client = createApiClient(new URL(url).origin, { apikey: key })
await client.get('/auth/v1/settings')

console.log('Supabase Auth API への接続に成功しました。')
