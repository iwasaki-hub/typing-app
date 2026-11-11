export const shopCategories = {
  "coffee": {
    "label": "コーヒーショップ",
    "emoji": "☕"
  },
  "burgers": {
    "label": "ハンバーガー",
    "emoji": "🍔"
  },
  "pizza": {
    "label": "ピザ",
    "emoji": "🍕"
  },
  "chicken": {
    "label": "フライドチキン",
    "emoji": "🍗"
  },
  "sweets": {
    "label": "スイーツ・アイス",
    "emoji": "🍨"
  }
} as const
export type ShopCategory = keyof typeof shopCategories
export interface ShopWord { id: string; english: string; ja: string; ko: string; category: ShopCategory; domain: string; logo: string; emoji: string; inputKind: 'brand' }
export const shopWords: ShopWord[] = [
  {
    "id": "starbucks",
    "logo": "/logos/starbucks.png",
    "english": "Starbucks",
    "ja": "スターバックス",
    "ko": "스타벅스",
    "category": "coffee",
    "domain": "starbucks.com",
    "emoji": "☕",
    "inputKind": "brand"
  },
  {
    "id": "dunkin",
    "logo": "/logos/dunkin.png",
    "english": "Dunkin'",
    "ja": "ダンキン",
    "ko": "던킨",
    "category": "coffee",
    "domain": "dunkindonuts.com",
    "emoji": "☕",
    "inputKind": "brand"
  },
  {
    "id": "costa",
    "logo": "/logos/costa.png",
    "english": "Costa Coffee",
    "ja": "コスタコーヒー",
    "ko": "코스타 커피",
    "category": "coffee",
    "domain": "costa.co.uk",
    "emoji": "☕",
    "inputKind": "brand"
  },
  {
    "id": "tim-hortons",
    "logo": "/logos/tim-hortons.png",
    "english": "Tim Hortons",
    "ja": "ティムホートンズ",
    "ko": "팀 홀튼스",
    "category": "coffee",
    "domain": "timhortons.com",
    "emoji": "☕",
    "inputKind": "brand"
  },
  {
    "id": "mcdonalds",
    "logo": "/logos/mcdonalds.png",
    "english": "McDonald's",
    "ja": "マクドナルド",
    "ko": "맥도날드",
    "category": "burgers",
    "domain": "mcdonalds.com",
    "emoji": "🍔",
    "inputKind": "brand"
  },
  {
    "id": "burger-king",
    "logo": "/logos/burger-king.png",
    "english": "Burger King",
    "ja": "バーガーキング",
    "ko": "버거킹",
    "category": "burgers",
    "domain": "bk.com",
    "emoji": "🍔",
    "inputKind": "brand"
  },
  {
    "id": "wendys",
    "logo": "/logos/wendys.png",
    "english": "Wendy's",
    "ja": "ウェンディーズ",
    "ko": "웬디스",
    "category": "burgers",
    "domain": "wendys.com",
    "emoji": "🍔",
    "inputKind": "brand"
  },
  {
    "id": "mos",
    "logo": "/logos/mos.png",
    "english": "MOS Burger",
    "ja": "モスバーガー",
    "ko": "모스버거",
    "category": "burgers",
    "domain": "mos.jp",
    "emoji": "🍔",
    "inputKind": "brand"
  },
  {
    "id": "dominos",
    "logo": "/logos/dominos.png",
    "english": "Domino's Pizza",
    "ja": "ドミノ・ピザ",
    "ko": "도미노피자",
    "category": "pizza",
    "domain": "dominos.com",
    "emoji": "🍕",
    "inputKind": "brand"
  },
  {
    "id": "pizza-hut",
    "logo": "/logos/pizza-hut.png",
    "english": "Pizza Hut",
    "ja": "ピザハット",
    "ko": "피자헛",
    "category": "pizza",
    "domain": "pizzahut.com",
    "emoji": "🍕",
    "inputKind": "brand"
  },
  {
    "id": "papa-johns",
    "logo": "/logos/papa-johns.png",
    "english": "Papa Johns",
    "ja": "パパジョンズ",
    "ko": "파파존스",
    "category": "pizza",
    "domain": "papajohns.com",
    "emoji": "🍕",
    "inputKind": "brand"
  },
  {
    "id": "little-caesars",
    "logo": "/logos/little-caesars.png",
    "english": "Little Caesars",
    "ja": "リトルシーザーズ",
    "ko": "리틀 시저스",
    "category": "pizza",
    "domain": "littlecaesars.com",
    "emoji": "🍕",
    "inputKind": "brand"
  },
  {
    "id": "kfc",
    "logo": "/logos/kfc.png",
    "english": "KFC",
    "ja": "ケンタッキーフライドチキン",
    "ko": "KFC",
    "category": "chicken",
    "domain": "kfc.com",
    "emoji": "🍗",
    "inputKind": "brand"
  },
  {
    "id": "popeyes",
    "logo": "/logos/popeyes.png",
    "english": "Popeyes",
    "ja": "ポパイズ",
    "ko": "파파이스",
    "category": "chicken",
    "domain": "popeyes.com",
    "emoji": "🍗",
    "inputKind": "brand"
  },
  {
    "id": "chick-fil-a",
    "logo": "/logos/chick-fil-a.svg",
    "english": "Chick-fil-A",
    "ja": "チックフィレイ",
    "ko": "칙필레",
    "category": "chicken",
    "domain": "chick-fil-a.com",
    "emoji": "🍗",
    "inputKind": "brand"
  },
  {
    "id": "jollibee",
    "logo": "/logos/jollibee.png",
    "english": "Jollibee",
    "ja": "ジョリビー",
    "ko": "졸리비",
    "category": "chicken",
    "domain": "jollibee.com",
    "emoji": "🍗",
    "inputKind": "brand"
  },
  {
    "id": "baskin-robbins",
    "logo": "/logos/baskin-robbins.png",
    "english": "Baskin-Robbins",
    "ja": "サーティワン アイスクリーム",
    "ko": "배스킨라빈스",
    "category": "sweets",
    "domain": "baskinrobbins.com",
    "emoji": "🍨",
    "inputKind": "brand"
  },
  {
    "id": "dairy-queen",
    "logo": "/logos/dairy-queen.jpg",
    "english": "Dairy Queen",
    "ja": "デイリークイーン",
    "ko": "데어리 퀸",
    "category": "sweets",
    "domain": "dairyqueen.com",
    "emoji": "🍨",
    "inputKind": "brand"
  },
  {
    "id": "krispy-kreme",
    "logo": "/logos/krispy-kreme.png",
    "english": "Krispy Kreme",
    "ja": "クリスピー・クリーム・ドーナツ",
    "ko": "크리스피 크림 도넛",
    "category": "sweets",
    "domain": "krispykreme.com",
    "emoji": "🍨",
    "inputKind": "brand"
  },
  {
    "id": "cold-stone",
    "logo": "/logos/cold-stone.png",
    "english": "Cold Stone Creamery",
    "ja": "コールド・ストーン・クリーマリー",
    "ko": "콜드스톤 크리머리",
    "category": "sweets",
    "domain": "coldstonecreamery.com",
    "emoji": "🍨",
    "inputKind": "brand"
  }
]
export function shopRound(category: ShopCategory, random = Math.random) {
  const words = shopWords.filter(word => word.category === category)
  for (let index = words.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1))
    ;[words[index], words[other]] = [words[other], words[index]]
  }
  return words
}
