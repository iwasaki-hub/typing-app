export type SessionStatus = 'ready' | 'running' | 'finished'
export interface TypingSession {
  input: string
  attempts: number
  mistakes: number
  startedAt: number | null
  elapsed: number
  status: SessionStatus
  reason: 'completed' | 'timeout' | 'stopped' | null
}

export function newSession(): TypingSession {
  return { input: '', attempts: 0, mistakes: 0, startedAt: null, elapsed: 0, status: 'ready', reason: null }
}

type SessionAction =
  | { type: 'reset' }
  | { type: 'tick'; now: number; duration: number }
  | { type: 'stop'; now: number; duration: number }
  | { type: 'start'; now: number; duration: number }
  | { type: 'input'; value: string; text: string; now: number; duration: number; language?: 'en' | 'ko'; composed?: boolean }

export function sessionReducer(state: TypingSession, action: SessionAction): TypingSession {
  if (action.type === 'reset') return newSession()
  if (state.status === 'finished') return state
  const elapsed = state.startedAt === null ? 0 : Math.min(action.duration, Math.max(0, (action.now - state.startedAt) / 1000))
  if (state.status === 'running' && elapsed >= action.duration) {
    return { ...state, elapsed, status: 'finished', reason: 'timeout' }
  }
  if (action.type === 'tick') return state.status === 'running' ? { ...state, elapsed } : state
  if (action.type === 'stop') return state.status === 'running' ? { ...state, elapsed, status: 'finished', reason: 'stopped' } : state
  if (action.type === 'start') return state.status === 'ready' ? { ...state, startedAt: action.now, status: 'running' } : state
  // IME drafts are handled by the UI; only committed Korean syllables enter scoring.
  const value = action.value.normalize('NFC')
  const suffix = value.slice(state.input.length)
  const korean = action.language === 'ko'
  const validSuffix = korean ? /^[\x20-\x7E\uAC00-\uD7A3]+$/.test(suffix) : /^[\x20-\x7E]$/.test(suffix)
  const added = value.startsWith(state.input) && suffix.length > 0 && validSuffix && (suffix.length === 1 || (korean && action.composed === true))
  const deleted = value.length < state.input.length && state.input.startsWith(value)
  if ((!added && !deleted) || value.length > action.text.length) return state
  const startedAt = state.startedAt ?? action.now
  const completed = value === action.text
  return {
    ...state,
    input: value,
    startedAt,
    elapsed,
    attempts: state.attempts + (added ? suffix.length : 0),
    mistakes: state.mistakes + (added ? [...suffix].filter((letter, index) => letter !== action.text[state.input.length + index]).length : 0),
    status: completed ? 'finished' : 'running',
    reason: completed ? 'completed' : null,
  }
}

export function sessionMetrics(state: TypingSession, text: string) {
  const correct = [...state.input].filter((letter, index) => letter === text[index]).length
  return {
    correct,
    progress: Math.round(correct / Math.max(1, text.length) * 100),
    accuracy: state.attempts ? Math.round((state.attempts - state.mistakes) / state.attempts * 100) : 100,
    wpm: state.elapsed > 0 ? Math.round(correct / 5 / (state.elapsed / 60)) : 0,
    cpm: state.elapsed > 0 ? Math.round(correct / (state.elapsed / 60)) : 0,
  }
}
