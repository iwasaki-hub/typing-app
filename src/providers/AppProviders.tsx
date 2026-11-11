import type { ReactNode } from 'react'
import { LazyMotion, domMax, MotionConfig } from 'motion/react'
import AuthProvider from './AuthProvider'
import HistoryProvider from './HistoryProvider'
import LocaleProvider from './LocaleProvider'
import ThemeProvider from './ThemeProvider'

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="user" transition={{ duration: 0.3, ease: 'easeOut' }}>
        <LocaleProvider>
          <ThemeProvider>
            <AuthProvider>
              <HistoryProvider>{children}</HistoryProvider>
            </AuthProvider>
          </ThemeProvider>
        </LocaleProvider>
      </MotionConfig>
    </LazyMotion>
  )
}
