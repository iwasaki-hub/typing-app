export const travelCategories = {
  "airport": {
    "label": "空港",
    "emoji": "✈️",
    "ja": "チェックインや搭乗の場面で使う表現を練習します。",
    "ko": "체크인이나 탑승 상황에서 쓰는 표현을 연습합니다."
  },
  "hotel": {
    "label": "ホテル",
    "emoji": "🏨",
    "ja": "チェックインや宿泊中のお願いに使う表現を練習します。",
    "ko": "체크인이나 숙박 중 부탁할 때 쓰는 표현을 연습합니다."
  },
  "restaurant": {
    "label": "レストラン",
    "emoji": "🍽️",
    "ja": "注文や会計の場面で使う表現を練習します。",
    "ko": "주문하거나 계산할 때 쓰는 표현을 연습합니다."
  },
  "shopping": {
    "label": "買い物",
    "emoji": "🛍️",
    "ja": "値段やサイズを尋ねる表現を練習します。",
    "ko": "가격이나 사이즈를 물을 때 쓰는 표현을 연습합니다."
  },
  "transport": {
    "label": "交通",
    "emoji": "🚆",
    "ja": "道案内や電車・バスで使う表現を練習します。",
    "ko": "길을 묻거나 기차와 버스를 이용할 때 쓰는 표현을 연습합니다."
  }
} as const
export type TravelCategory = keyof typeof travelCategories
export interface TravelPhrase { id: string; category: TravelCategory; english: string; ja: string; ko: string; emoji: string; inputKind: 'phrase' }
export const travelPhrases: TravelPhrase[] = [
  {
    "id": "travel-1",
    "category": "airport",
    "english": "Where is the check-in counter?",
    "ja": "チェックインカウンターはどこですか？",
    "ko": "체크인 카운터는 어디인가요?",
    "emoji": "✈️",
    "inputKind": "phrase"
  },
  {
    "id": "travel-2",
    "category": "airport",
    "english": "Here is my passport.",
    "ja": "こちらが私のパスポートです。",
    "ko": "여기 제 여권입니다.",
    "emoji": "✈️",
    "inputKind": "phrase"
  },
  {
    "id": "travel-3",
    "category": "airport",
    "english": "Can I have a window seat?",
    "ja": "窓側の席にしてもらえますか？",
    "ko": "창가 좌석으로 해 주실 수 있나요?",
    "emoji": "✈️",
    "inputKind": "phrase"
  },
  {
    "id": "travel-4",
    "category": "airport",
    "english": "What time does boarding start?",
    "ja": "搭乗は何時に始まりますか？",
    "ko": "탑승은 몇 시에 시작하나요?",
    "emoji": "✈️",
    "inputKind": "phrase"
  },
  {
    "id": "travel-5",
    "category": "airport",
    "english": "Where is gate twenty?",
    "ja": "20番ゲートはどこですか？",
    "ko": "20번 탑승구는 어디인가요?",
    "emoji": "✈️",
    "inputKind": "phrase"
  },
  {
    "id": "travel-6",
    "category": "airport",
    "english": "My luggage has not arrived.",
    "ja": "私の荷物が届いていません。",
    "ko": "제 짐이 아직 도착하지 않았습니다.",
    "emoji": "✈️",
    "inputKind": "phrase"
  },
  {
    "id": "travel-7",
    "category": "hotel",
    "english": "I have a reservation.",
    "ja": "予約しています。",
    "ko": "예약했습니다.",
    "emoji": "🏨",
    "inputKind": "phrase"
  },
  {
    "id": "travel-8",
    "category": "hotel",
    "english": "I'd like to check in.",
    "ja": "チェックインをお願いします。",
    "ko": "체크인하고 싶습니다.",
    "emoji": "🏨",
    "inputKind": "phrase"
  },
  {
    "id": "travel-9",
    "category": "hotel",
    "english": "What time is check-out?",
    "ja": "チェックアウトは何時ですか？",
    "ko": "체크아웃은 몇 시인가요?",
    "emoji": "🏨",
    "inputKind": "phrase"
  },
  {
    "id": "travel-10",
    "category": "hotel",
    "english": "Is breakfast included?",
    "ja": "朝食は含まれていますか？",
    "ko": "아침 식사가 포함되어 있나요?",
    "emoji": "🏨",
    "inputKind": "phrase"
  },
  {
    "id": "travel-11",
    "category": "hotel",
    "english": "Could I have an extra towel?",
    "ja": "タオルをもう1枚もらえますか？",
    "ko": "수건을 한 장 더 받을 수 있나요?",
    "emoji": "🏨",
    "inputKind": "phrase"
  },
  {
    "id": "travel-12",
    "category": "hotel",
    "english": "What is the Wi-Fi password?",
    "ja": "Wi-Fiのパスワードは何ですか？",
    "ko": "와이파이 비밀번호가 무엇인가요?",
    "emoji": "🏨",
    "inputKind": "phrase"
  },
  {
    "id": "travel-13",
    "category": "restaurant",
    "english": "Could I see the menu, please?",
    "ja": "メニューを見せてもらえますか？",
    "ko": "메뉴를 보여 주시겠어요?",
    "emoji": "🍽️",
    "inputKind": "phrase"
  },
  {
    "id": "travel-14",
    "category": "restaurant",
    "english": "I'd like this, please.",
    "ja": "これをお願いします。",
    "ko": "이것으로 주세요.",
    "emoji": "🍽️",
    "inputKind": "phrase"
  },
  {
    "id": "travel-15",
    "category": "restaurant",
    "english": "Do you have any recommendations?",
    "ja": "おすすめはありますか？",
    "ko": "추천 메뉴가 있나요?",
    "emoji": "🍽️",
    "inputKind": "phrase"
  },
  {
    "id": "travel-16",
    "category": "restaurant",
    "english": "I am allergic to peanuts.",
    "ja": "私はピーナッツアレルギーです。",
    "ko": "저는 땅콩 알레르기가 있습니다.",
    "emoji": "🍽️",
    "inputKind": "phrase"
  },
  {
    "id": "travel-17",
    "category": "restaurant",
    "english": "Could I have some water, please?",
    "ja": "お水をいただけますか？",
    "ko": "물 좀 주시겠어요?",
    "emoji": "🍽️",
    "inputKind": "phrase"
  },
  {
    "id": "travel-18",
    "category": "restaurant",
    "english": "Could I have the bill, please?",
    "ja": "お会計をお願いします。",
    "ko": "계산서 좀 주시겠어요?",
    "emoji": "🍽️",
    "inputKind": "phrase"
  },
  {
    "id": "travel-19",
    "category": "shopping",
    "english": "How much is this?",
    "ja": "これはいくらですか？",
    "ko": "이것은 얼마인가요?",
    "emoji": "🛍️",
    "inputKind": "phrase"
  },
  {
    "id": "travel-20",
    "category": "shopping",
    "english": "Can I try this on?",
    "ja": "これを試着してもいいですか？",
    "ko": "이것을 입어 봐도 될까요?",
    "emoji": "🛍️",
    "inputKind": "phrase"
  },
  {
    "id": "travel-21",
    "category": "shopping",
    "english": "Do you have a smaller size?",
    "ja": "もっと小さいサイズはありますか？",
    "ko": "더 작은 사이즈가 있나요?",
    "emoji": "🛍️",
    "inputKind": "phrase"
  },
  {
    "id": "travel-22",
    "category": "shopping",
    "english": "Do you have this in blue?",
    "ja": "これの青色はありますか？",
    "ko": "이것의 파란색이 있나요?",
    "emoji": "🛍️",
    "inputKind": "phrase"
  },
  {
    "id": "travel-23",
    "category": "shopping",
    "english": "Can I pay by card?",
    "ja": "カードで支払えますか？",
    "ko": "카드로 결제할 수 있나요?",
    "emoji": "🛍️",
    "inputKind": "phrase"
  },
  {
    "id": "travel-24",
    "category": "shopping",
    "english": "Could I have a receipt, please?",
    "ja": "レシートをいただけますか？",
    "ko": "영수증 좀 주시겠어요?",
    "emoji": "🛍️",
    "inputKind": "phrase"
  },
  {
    "id": "travel-25",
    "category": "transport",
    "english": "Where is the nearest station?",
    "ja": "最寄りの駅はどこですか？",
    "ko": "가장 가까운 역은 어디인가요?",
    "emoji": "🚆",
    "inputKind": "phrase"
  },
  {
    "id": "travel-26",
    "category": "transport",
    "english": "Which platform should I go to?",
    "ja": "どのホームへ行けばよいですか？",
    "ko": "어느 승강장으로 가야 하나요?",
    "emoji": "🚆",
    "inputKind": "phrase"
  },
  {
    "id": "travel-27",
    "category": "transport",
    "english": "Does this bus go to the airport?",
    "ja": "このバスは空港に行きますか？",
    "ko": "이 버스는 공항에 가나요?",
    "emoji": "🚆",
    "inputKind": "phrase"
  },
  {
    "id": "travel-28",
    "category": "transport",
    "english": "How long does it take?",
    "ja": "どのくらい時間がかかりますか？",
    "ko": "얼마나 걸리나요?",
    "emoji": "🚆",
    "inputKind": "phrase"
  },
  {
    "id": "travel-29",
    "category": "transport",
    "english": "I'd like a one-way ticket.",
    "ja": "片道切符をお願いします。",
    "ko": "편도 표를 주세요.",
    "emoji": "🚆",
    "inputKind": "phrase"
  },
  {
    "id": "travel-30",
    "category": "transport",
    "english": "Please take me to this address.",
    "ja": "この住所までお願いします。",
    "ko": "이 주소로 가 주세요.",
    "emoji": "🚆",
    "inputKind": "phrase"
  }
]
export function travelRound(category: TravelCategory, random = Math.random) {
  const phrases = travelPhrases.filter(phrase => phrase.category === category)
  for (let index = phrases.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1))
    ;[phrases[index], phrases[other]] = [phrases[other], phrases[index]]
  }
  return phrases
}
