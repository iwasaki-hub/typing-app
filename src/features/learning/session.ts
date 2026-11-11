import { normalizeLearningAnswer } from './answer.ts'
export type LearnMode = 'guide' | 'quiz'
export interface LearningItem { english: string }
export interface LearningAnswer<T extends LearningItem> { item: T; skipped: boolean; hinted: boolean; mistakes: number }
export interface LearningSession<T extends LearningItem> {
  order: T[]; index: number; input: string; mode: LearnMode
  hinted: boolean; mistakes: number; feedback: 'none' | 'incorrect' | 'correct' | 'skipped'; finished: boolean; answers: LearningAnswer<T>[]
}
export function newLearningSession<T extends LearningItem>(order: T[], mode: LearnMode): LearningSession<T> {
  return { order, mode, index: 0, input: '', hinted: false, mistakes: 0, feedback: 'none', finished: order.length === 0, answers: [] }
}
export type LearningAction<T extends LearningItem> = { type: 'input'; value: string } | { type: 'check' | 'hint' | 'skip' | 'next' } | { type: 'reset'; order: T[]; mode: LearnMode }
export function learningReducer<T extends LearningItem>(state: LearningSession<T>, action: LearningAction<T>): LearningSession<T> {
  if (action.type === 'reset') return newLearningSession(action.order, action.mode)
  if (state.finished) return state
  const answered = state.feedback === 'correct' || state.feedback === 'skipped'
  if (action.type === 'next') {
    if (!answered) return state
    if (state.index === state.order.length - 1) return { ...state, finished: true }
    return { ...state, index: state.index + 1, input: '', hinted: false, mistakes: 0, feedback: 'none' }
  }
  if (answered) return state
  if (action.type === 'input') return /^[A-Za-z ]{0,64}$/.test(action.value) ? { ...state, input: action.value, feedback: 'none' } : state
  if (action.type === 'hint') return { ...state, hinted: true }
  const item = state.order[state.index]
  if (action.type === 'check') {
    if (!state.input.trim()) return state
    if (normalizeLearningAnswer(state.input) !== normalizeLearningAnswer(item.english)) return { ...state, mistakes: state.mistakes + 1, feedback: 'incorrect' }
  }
  return { ...state, feedback: action.type === 'skip' ? 'skipped' : 'correct', answers: [...state.answers, { item, skipped: action.type === 'skip', hinted: state.hinted, mistakes: state.mistakes }] }
}
