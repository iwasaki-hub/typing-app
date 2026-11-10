import axios from 'axios'

// Shared transport defaults. Keep credentials on service-specific instances.
export function createApiClient(baseURL: string, headers: Record<string, string> = {}) {
  return axios.create({ baseURL, headers, timeout: 15000 })
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return '接続がタイムアウトしました。時間をおいて再確認してください。'
    }
    if (error.response) {
      return `接続できませんでした（HTTP ${error.response.status}）。URL と公開用キーを確認してください。`
    }
    return '通信できませんでした。接続先 URL とネットワークを確認してください。'
  }
  return error instanceof Error ? error.message : '接続に失敗しました。再確認してください。'
}
