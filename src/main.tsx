import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import AuthProvider from './components/AuthProvider'
import ThemeProvider from './components/ThemeProvider'
import './styles/themes.css'
import { LazyMotion, domMax, MotionConfig } from 'motion/react'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <LazyMotion features={domMax} strict><MotionConfig reducedMotion="user" transition={{ duration: 0.3, ease: 'easeOut' }}><ThemeProvider><AuthProvider><App /></AuthProvider></ThemeProvider></MotionConfig></LazyMotion>
    </BrowserRouter>
  </StrictMode>,
)
