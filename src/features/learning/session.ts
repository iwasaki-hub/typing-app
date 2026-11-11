import { normalizeLearningAnswer } from './answer.ts'
export type LearnMode = 'guide' | 'quiz'
export interface LearningItem { english: string; inputKind?: 'brand' }
export function isLearningInput(value: string, item: LearningItem) {
  return item.inputKind === 'brand' ? /^[A-Za-z '-]{0,64}$/.test(value) : /^[A-Za-z ]{0,64}$/.test(value)
}
export interface LearningAnswer<T extends LearningItem> { item: T; skipped: boolean; hinted: boolean; mistakes: number }
export interface LearningSession<T extends LearningItem> {
  order: T[]; index: number; input: string; mode: LearnMode
  hinted: boolean; mistakes: number; feedback: 'none' | 'incorrect' | 'correct' | 'skipped'; finished: boolean; answers: LearningAnswer<T>[]
}
export function newLearningSession<T extends LearningItem>(order: T[], mode: LearnMode): LearningSession<T> {
  return { order, mode, index: 0, input: '', hinted: false, mistakes: 0, feedback: 'none', finished: order.length === 0, answers: [] }
}
export type LearningAction<T extends LearningItem> = { type: 'input'; value: string } | { type: 'check' | 'hint' | 'skip' } | { type: 'next'; expectedIndex?: number; expectedOrder?: T[] } | { type: 'reset'; order: T[]; mode: LearnMode }
export function learningReducer<T extends LearningItem>(state: LearningSession<T>, action: LearningAction<T>): LearningSession<T> {
  if (action.type === 'reset') return newLearningSession(action.order, action.mode)
  if (state.finished) return state
  const answered = state.feedback === 'correct' || state.feedback === 'skipped'
  if (action.type === 'next') {
    if ((action.expectedIndex !== undefined && action.expectedIndex !== state.index) || (action.expectedOrder && action.expectedOrder !== state.order)) return state
    if (!answered) return state
    if (state.index === state.order.length - 1) return { ...state, finished: true }
    return { ...state, index: state.index + 1, input: '', hinted: false, mistakes: 0, feedback: 'none' }
  }
  if (answered) return state
  if (action.type === 'input') {
    if (!isLearningInput(action.value, state.order[state.index])) return state
    const target = normalizeLearningAnswer(state.order[state.index].english)
    const value = normalizeLearningAnswer(action.value)
    const enteredWrongPrefix = value && !target.startsWith(value) && target.startsWith(normalizeLearningAnswer(state.input)) && action.value.length >= state.input.length
    const next: LearningSession<T> = { ...state, input: action.value, feedback: 'none', mistakes: state.mistakes + (enteredWrongPrefix ? 1 : 0) }
    return value === target
      ? learningReducer(next, { type: 'check' }) : next
  }
  if (action.type === 'hint') return { ...state, hinted: true }
  const item = state.order[state.index]
  if (action.type === 'check') {
    if (!state.input.trim()) return state
    if (normalizeLearningAnswer(state.input) !== normalizeLearningAnswer(item.english)) {
      const countedDuringInput = state.mistakes > 0 && !normalizeLearningAnswer(item.english).startsWith(normalizeLearningAnswer(state.input))
      return { ...state, mistakes: state.mistakes + (countedDuringInput ? 0 : 1), feedback: 'incorrect' }
    }
  }
  return { ...state, feedback: action.type === 'skip' ? 'skipped' : 'correct', answers: [...state.answers, { item, skipped: action.type === 'skip', hinted: state.hinted, mistakes: state.mistakes }] }
}
