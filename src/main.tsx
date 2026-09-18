import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// @ts-ignore
import Admin from './Admin.jsx'

import WebApp from '@twa-dev/sdk'

if (WebApp && typeof WebApp.ready === "function") {
  WebApp.ready()
}

if (WebApp && typeof WebApp.expand === "function") {
  WebApp.expand()
}

const path = window.location.pathname

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {
      path === "/admin"
        ? <Admin />
        : <App />
    }
  </StrictMode>
)