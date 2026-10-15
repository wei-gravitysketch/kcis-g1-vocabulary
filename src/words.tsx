import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AllWords from './components/AllWords'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AllWords />
  </StrictMode>,
)
