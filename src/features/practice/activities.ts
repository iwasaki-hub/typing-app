import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { keyboardIcon, globeIcon, householdIcon } from '../../lib/icons.ts'

export interface PracticeActivity {
  id: string
  path: `/practice/${string}`
  title: string
  description: string
  category: string
  icon: IconDefinition
  Page: LazyExoticComponent<ComponentType>
}

// Add an activity here to register both its menu card and its route.
export const practiceActivities: readonly PracticeActivity[] = [
  {
    id: 'sentences', path: '/practice/sentences', title: '文章タイピング',
    description: '英語・韓国語の文章で、速さと正確さを練習。打鍵音を選び、履歴やグラフで上達を確認できます。',
    category: 'タイピング練習', icon: keyboardIcon,
    Page: lazy(() => import('../../pages/practice/sentences/SentencePracticePage')),
  },
  {
    id: 'countries', path: '/practice/countries', title: '国名タイピング',
    description: '国旗を見ながら、世界の国の英語名を学習。お手本モードとクイズモードで楽しく覚えましょう。',
    category: 'タイピングで学ぶ', icon: globeIcon,
    Page: lazy(() => import('../../pages/practice/countries/CountryPracticePage')),
  },
  {
    id: 'household', path: '/practice/household', title: '日用品の英単語',
    description: 'キッチン・バスルーム・掃除・文房具・リビング。身近な日用品の英単語をカテゴリー別に覚えましょう。',
    category: 'タイピングで学ぶ', icon: householdIcon,
    Page: lazy(() => import('../../pages/practice/household/HouseholdPracticePage')),
  },

]
