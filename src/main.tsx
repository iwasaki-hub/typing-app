import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import AuthProvider from './components/AuthProvider'
import { LazyMotion, domMax, MotionConfig } from 'motion/react'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <LazyMotion features={domMax} strict><MotionConfig reducedMotion="user" transition={{ duration: 0.3, ease: 'easeOut' }}><AuthProvider><App /></AuthProvider></MotionConfig></LazyMotion>
    </BrowserRouter>
  </StrictMode>,
)
