import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import WebApp from '@twa-dev/sdk'

if (WebApp && typeof WebApp.ready === "function") {
  WebApp.ready()
}

if (WebApp && typeof WebApp.expand === "function") {
  WebApp.expand()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)