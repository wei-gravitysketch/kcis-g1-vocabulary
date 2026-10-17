import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Announcement from './components/Announcement'
import GrammarApp from './components/grammar/GrammarApp'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GrammarApp />
    <Announcement />
  </StrictMode>,
)
