import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import App from './App'
import Admin from './Admin'
import AdminGate from './admin/AdminGate'

const path = window.location.pathname

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {path.startsWith('/admin') ? (
      <AdminGate>
        <Admin />
      </AdminGate>
    ) : (
      <App />
    )}
  </StrictMode>,
)
