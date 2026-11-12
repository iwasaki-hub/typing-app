const initials = [...'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ']
const vowels = [...'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ']
const finals = ['', ...'ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ']
const compounds: Record<string, string> = {
  ㄲ: 'ㄱㄱ', ㄸ: 'ㄷㄷ', ㅃ: 'ㅂㅂ', ㅆ: 'ㅅㅅ', ㅉ: 'ㅈㅈ',
  ㄳ: 'ㄱㅅ', ㄵ: 'ㄴㅈ', ㄶ: 'ㄴㅎ', ㄺ: 'ㄹㄱ', ㄻ: 'ㄹㅁ', ㄼ: 'ㄹㅂ',
  ㄽ: 'ㄹㅅ', ㄾ: 'ㄹㅌ', ㄿ: 'ㄹㅍ', ㅀ: 'ㄹㅎ', ㅄ: 'ㅂㅅ',
  ㅘ: 'ㅗㅏ', ㅙ: 'ㅗㅐ', ㅚ: 'ㅗㅣ', ㅝ: 'ㅜㅓ', ㅞ: 'ㅜㅔ', ㅟ: 'ㅜㅣ', ㅢ: 'ㅡㅣ',
}

// Unicode Hangul decomposition (SBase AC00, 19 initials × 21 vowels × 28 finals).
// Convert canonical jamo too, so different IME encodings compare identically.
export function koreanParts(text: string): string[] {
  return [...text.normalize('NFC')].flatMap(letter => {
    const code = letter.codePointAt(0)!
    const index = code - 0xac00
    let parts: string[]
    if (index >= 0 && index < 11172) {
      parts = [initials[Math.floor(index / 588)], vowels[Math.floor(index % 588 / 28)], finals[index % 28]]
    } else if (code >= 0x1100 && code <= 0x1112) parts = [initials[code - 0x1100]]
    else if (code >= 0x1161 && code <= 0x1175) parts = [vowels[code - 0x1161]]
    else if (code >= 0x11a8 && code <= 0x11c2) parts = [finals[code - 0x11a7]]
    else parts = [letter]
    return parts.flatMap(part => [...(compounds[part] ?? part)])
  })
}

export type PartState = 'correct' | 'incorrect' | 'pending'
export function koreanDraftFeedback(text: string, draft: string) {
  const typed = koreanParts(draft)
  let offset = 0
  const characters = [...text].map(letter => {
    const start = offset
    const parts = koreanParts(letter).map(part => {
      const actual = typed[offset++]
      return { part, actual, state: (actual === undefined ? 'pending' : actual === part ? 'correct' : 'incorrect') as PartState }
    })
    const state = parts.some(part => part.state === 'incorrect') ? 'incorrect'
      : parts.every(part => part.state === 'correct') ? 'correct'
      : parts.some(part => part.state === 'correct') ? 'partial' : 'pending'
    return { letter, parts, state, start, end: offset }
  })
  const found = characters.findIndex(character => character.end >= Math.max(1, typed.length))
  const activeIndex = found < 0 ? Math.max(0, characters.length - 1) : found
  return { characters, activeIndex, extra: typed.slice(offset) }
}
