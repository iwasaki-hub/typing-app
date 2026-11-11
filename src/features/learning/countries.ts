export type CountryRegion = 'asia' | 'europe' | 'northAmerica' | 'southAmerica' | 'africa' | 'oceania'
export interface Country { code: string; english: string; ja: string; ko: string; region: CountryRegion }
// Common English country names for spelling practice, rather than formal state names.
export const countries: Country[] = [
  { code: 'jp', english: 'Japan', ja: '日本', ko: '일본', region: 'asia' },
  { code: 'kr', english: 'South Korea', ja: '韓国', ko: '대한민국', region: 'asia' },
  { code: 'cn', english: 'China', ja: '中国', ko: '중국', region: 'asia' },
  { code: 'in', english: 'India', ja: 'インド', ko: '인도', region: 'asia' },
  { code: 'th', english: 'Thailand', ja: 'タイ', ko: '태국', region: 'asia' },
  { code: 'fr', english: 'France', ja: 'フランス', ko: '프랑스', region: 'europe' },
  { code: 'de', english: 'Germany', ja: 'ドイツ', ko: '독일', region: 'europe' },
  { code: 'it', english: 'Italy', ja: 'イタリア', ko: '이탈리아', region: 'europe' },
  { code: 'es', english: 'Spain', ja: 'スペイン', ko: '스페인', region: 'europe' },
  { code: 'gb', english: 'United Kingdom', ja: 'イギリス', ko: '영국', region: 'europe' },
  { code: 'ca', english: 'Canada', ja: 'カナダ', ko: '캐나다', region: 'northAmerica' },
  { code: 'us', english: 'United States', ja: 'アメリカ合衆国', ko: '미국', region: 'northAmerica' },
  { code: 'mx', english: 'Mexico', ja: 'メキシコ', ko: '멕시코', region: 'northAmerica' },
  { code: 'br', english: 'Brazil', ja: 'ブラジル', ko: '브라질', region: 'southAmerica' },
  { code: 'ar', english: 'Argentina', ja: 'アルゼンチン', ko: '아르헨티나', region: 'southAmerica' },
  { code: 'eg', english: 'Egypt', ja: 'エジプト', ko: '이집트', region: 'africa' },
  { code: 'ke', english: 'Kenya', ja: 'ケニア', ko: '케냐', region: 'africa' },
  { code: 'au', english: 'Australia', ja: 'オーストラリア', ko: '호주', region: 'oceania' },
  { code: 'nz', english: 'New Zealand', ja: 'ニュージーランド', ko: '뉴질랜드', region: 'oceania' },
  { code: 'fj', english: 'Fiji', ja: 'フィジー', ko: '피지', region: 'oceania' },
]
export const regionLabels: Record<CountryRegion, string> = {
  asia: 'アジア', europe: 'ヨーロッパ', northAmerica: '北アメリカ', southAmerica: '南アメリカ', africa: 'アフリカ', oceania: 'オセアニア',
}
export function countryRound(region: CountryRegion | 'all', random = Math.random) {
  const choices = countries.filter(country => region === 'all' || country.region === region)
  for (let index = choices.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1))
    ;[choices[index], choices[other]] = [choices[other], choices[index]]
  }
  return choices.slice(0, 10)
}
export { normalizeLearningAnswer as normalizeCountryAnswer } from './answer.ts'
