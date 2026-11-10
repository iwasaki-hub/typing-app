export interface ReviewInput { display_name: string; rating: number; title: string; comment: string }
export interface PublicReview extends ReviewInput { id: string; created_at: string }

export function validateReview(input: ReviewInput): ReviewInput {
  const value = { ...input, display_name: input.display_name.trim(), title: input.title.trim(), comment: input.comment.trim() }
  if (!value.display_name || [...value.display_name].length > 20) throw new Error('公開する表示名は1〜20文字で入力してください。')
  if (!Number.isInteger(value.rating) || value.rating < 1 || value.rating > 5) throw new Error('評価を1〜5から選んでください。')
  if (!value.title || [...value.title].length > 60) throw new Error('見出しは1〜60文字で入力してください。')
  if ([...value.comment].length < 10 || [...value.comment].length > 500) throw new Error('コメントは10〜500文字で入力してください。')
  const control = (text: string, allowLines = false) => [...text].some(char => { const code = char.charCodeAt(0); return code === 127 || (code < 32 && !(allowLines && [9, 10, 13].includes(code))) })
  if (control(value.display_name + value.title) || control(value.comment, true)) throw new Error('使用できない制御文字が含まれています。')
  return value
}
