import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Announcement from './components/Announcement'
import AllWords from './components/AllWords'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AllWords />
    <Announcement />
  </StrictMode>,
)
