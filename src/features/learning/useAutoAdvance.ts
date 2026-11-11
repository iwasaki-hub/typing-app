import { useEffect } from 'react'
import { scheduleLearningAdvance } from './autoAdvance'
import type { LearningAction, LearningItem, LearningSession } from './session'

export function useAutoAdvance<T extends LearningItem>(state: LearningSession<T>, dispatch: (action: LearningAction<T>) => void) {
  useEffect(() => scheduleLearningAdvance(state, dispatch), [state, dispatch])
}
