import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import Header from './Header.tsx'
import { ThemeProvider } from '../contexts/ThemeProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <Header />


    </ThemeProvider>
  </StrictMode>,
)
