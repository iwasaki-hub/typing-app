import type { LearningAction, LearningItem, LearningSession } from './session.ts'

export const AUTO_ADVANCE_DELAY = 250
export function scheduleLearningAdvance<T extends LearningItem>(state: LearningSession<T>, dispatch: (action: LearningAction<T>) => void) {
  if (state.finished || state.feedback !== 'correct') return () => {}
  const timer = setTimeout(() => dispatch({ type: 'next', expectedIndex: state.index, expectedOrder: state.order }), AUTO_ADVANCE_DELAY)
  return () => clearTimeout(timer)
}
