import { koreanParts } from './koreanParts.ts'

export function createKoreanPartSoundTracker() {
  let previous: string[] = []
  return {
    reset() { previous = [] },
    update(value: string, text: string): 'key' | 'error' | null {
      const next = koreanParts(value)
      const before = previous
      previous = next
      let changed = 0
      while (changed < before.length && changed < next.length && before[changed] === next[changed]) changed++
      // Deletion, repeated input events and IME syllable regrouping are silent.
      if (next.length < before.length || changed === next.length) return null
      const expected = koreanParts(text)
      return next.slice(changed).some((part, index) => part !== expected[changed + index]) ? 'error' : 'key'
    },
  }
}
