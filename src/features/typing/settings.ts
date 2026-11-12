export function readSetting<T>(key: string, fallback: T, valid: (value: unknown) => value is T): T {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(key) ?? 'null')
    return valid(value) ? value : fallback
  } catch { return fallback }
}

export function writeSetting<T>(key: string, value: T) {
  try { window.localStorage.setItem(key, JSON.stringify(value)) }
  catch { /* Settings still work for this visit when storage is unavailable. */ }
}

export const languageSetting = 'typing-app:language:v1'
export const durationSetting = 'typing-app:duration:v1'
export const soundEnabledSetting = 'typing-app:sound-enabled:v1'
export const volumeSetting = 'typing-app:sound-volume:v1'
export const koreanPartsVisibleSetting = 'typing-app:korean-parts-visible:v1'
export const statsVisibleSetting = 'typing-app:stats-visible:v1'
export const isLanguage = (value: unknown): value is 'en' | 'ko' => value === 'en' || value === 'ko'
export const isDuration = (value: unknown): value is number => value === 30 || value === 60 || value === 120
export const isEnabled = (value: unknown): value is boolean => typeof value === 'boolean'
export const isVolume = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1
