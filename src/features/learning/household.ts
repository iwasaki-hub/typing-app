export const householdCategories = {
  kitchen: { label: 'キッチン', emoji: '🍽️' },
  bathroom: { label: '洗面所・バスルーム', emoji: '🛁' },
  cleaning: { label: '掃除・洗濯', emoji: '🧹' },
  stationery: { label: '文房具', emoji: '✏️' },
  living: { label: 'リビング', emoji: '🛋️' },
} as const
export type HouseholdCategory = keyof typeof householdCategories
export interface HouseholdWord { id: string; english: string; ja: string; ko: string; emoji: string; category: HouseholdCategory }
export const householdWords: HouseholdWord[] = [
  { id: 'spoon', english: 'spoon', ja: 'スプーン', ko: '숟가락', emoji: '🥄', category: 'kitchen' },
  { id: 'fork', english: 'fork', ja: 'フォーク', ko: '포크', emoji: '🍴', category: 'kitchen' },
  { id: 'knife', english: 'knife', ja: 'ナイフ', ko: '칼', emoji: '🔪', category: 'kitchen' },
  { id: 'plate', english: 'plate', ja: '皿', ko: '접시', emoji: '🍽️', category: 'kitchen' },
  { id: 'bowl', english: 'bowl', ja: 'ボウル・おわん', ko: '그릇', emoji: '🥣', category: 'kitchen' },
  { id: 'cup', english: 'cup', ja: 'カップ', ko: '컵', emoji: '☕', category: 'kitchen' },
  { id: 'kettle', english: 'kettle', ja: 'やかん', ko: '주전자', emoji: '🫖', category: 'kitchen' },
  { id: 'cutting-board', english: 'cutting board', ja: 'まな板', ko: '도마', emoji: '🥕', category: 'kitchen' },
  { id: 'toothbrush', english: 'toothbrush', ja: '歯ブラシ', ko: '칫솔', emoji: '🪥', category: 'bathroom' },
  { id: 'toothpaste', english: 'toothpaste', ja: '歯みがき粉', ko: '치약', emoji: '🦷', category: 'bathroom' },
  { id: 'towel', english: 'towel', ja: 'タオル', ko: '수건', emoji: '🛁', category: 'bathroom' },
  { id: 'soap', english: 'soap', ja: 'せっけん', ko: '비누', emoji: '🧼', category: 'bathroom' },
  { id: 'shampoo', english: 'shampoo', ja: 'シャンプー', ko: '샴푸', emoji: '🧴', category: 'bathroom' },
  { id: 'comb', english: 'comb', ja: 'くし', ko: '빗', emoji: '🪮', category: 'bathroom' },
  { id: 'mirror', english: 'mirror', ja: '鏡', ko: '거울', emoji: '🪞', category: 'bathroom' },
  { id: 'hair-dryer', english: 'hair dryer', ja: 'ヘアドライヤー', ko: '헤어드라이어', emoji: '💨', category: 'bathroom' },
  { id: 'broom', english: 'broom', ja: 'ほうき', ko: '빗자루', emoji: '🧹', category: 'cleaning' },
  { id: 'mop', english: 'mop', ja: 'モップ', ko: '밀대', emoji: '🧽', category: 'cleaning' },
  { id: 'bucket', english: 'bucket', ja: 'バケツ', ko: '양동이', emoji: '🪣', category: 'cleaning' },
  { id: 'sponge', english: 'sponge', ja: 'スポンジ', ko: '스펀지', emoji: '🧽', category: 'cleaning' },
  { id: 'detergent', english: 'detergent', ja: '洗剤', ko: '세제', emoji: '🧴', category: 'cleaning' },
  { id: 'trash-bag', english: 'trash bag', ja: 'ごみ袋', ko: '쓰레기봉투', emoji: '🗑️', category: 'cleaning' },
  { id: 'dustpan', english: 'dustpan', ja: 'ちりとり', ko: '쓰레받기', emoji: '🧹', category: 'cleaning' },
  { id: 'vacuum-cleaner', english: 'vacuum cleaner', ja: '掃除機', ko: '진공청소기', emoji: '🏠', category: 'cleaning' },
  { id: 'pen', english: 'pen', ja: 'ペン', ko: '펜', emoji: '🖊️', category: 'stationery' },
  { id: 'pencil', english: 'pencil', ja: 'えんぴつ', ko: '연필', emoji: '✏️', category: 'stationery' },
  { id: 'eraser', english: 'eraser', ja: '消しゴム', ko: '지우개', emoji: '✏️', category: 'stationery' },
  { id: 'ruler', english: 'ruler', ja: '定規', ko: '자', emoji: '📏', category: 'stationery' },
  { id: 'notebook', english: 'notebook', ja: 'ノート', ko: '공책', emoji: '📓', category: 'stationery' },
  { id: 'scissors', english: 'scissors', ja: 'はさみ', ko: '가위', emoji: '✂️', category: 'stationery' },
  { id: 'stapler', english: 'stapler', ja: 'ホッチキス', ko: '스테이플러', emoji: '📎', category: 'stationery' },
  { id: 'glue', english: 'glue', ja: 'のり', ko: '풀', emoji: '🧴', category: 'stationery' },
  { id: 'table', english: 'table', ja: 'テーブル', ko: '탁자', emoji: '🪑', category: 'living' },
  { id: 'chair', english: 'chair', ja: 'いす', ko: '의자', emoji: '🪑', category: 'living' },
  { id: 'lamp', english: 'lamp', ja: 'ランプ', ko: '램프', emoji: '💡', category: 'living' },
  { id: 'clock', english: 'clock', ja: '時計', ko: '시계', emoji: '🕰️', category: 'living' },
  { id: 'cushion', english: 'cushion', ja: 'クッション', ko: '쿠션', emoji: '🛋️', category: 'living' },
  { id: 'curtain', english: 'curtain', ja: 'カーテン', ko: '커튼', emoji: '🪟', category: 'living' },
  { id: 'bookshelf', english: 'bookshelf', ja: '本棚', ko: '책장', emoji: '📚', category: 'living' },
  { id: 'remote-control', english: 'remote control', ja: 'リモコン', ko: '리모컨', emoji: '📺', category: 'living' },
]
export function householdRound(category: HouseholdCategory, random = Math.random) {
  const words = householdWords.filter(word => word.category === category)
  for (let index = words.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1))
    ;[words[index], words[other]] = [words[other], words[index]]
  }
  return words
}
