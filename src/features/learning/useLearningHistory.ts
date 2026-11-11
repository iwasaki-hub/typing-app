import { useEffect, useMemo } from 'react'
import { useHistory } from '../typing/historyContext'
import { createLearningRecorder, type LearningActivity } from './history'
import type { LearningItem, LearningSession } from './session'

export function useLearningHistory<T extends LearningItem & { ja: string; ko: string }>(state: LearningSession<T>, activity: LearningActivity, category: string) {
  const { store } = useHistory()
  const record = useMemo(() => createLearningRecorder(result => store.save(result)), [store])
  useEffect(() => { record(state, activity, category) }, [record, state, activity, category])
}
