import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import App from './App'
import Admin from './Admin'
import AdminGate from './admin/AdminGate'
import Register from './Register'

const path = window.location.pathname

function Root() {
  if (path.startsWith('/register')) return <Register />
  if (path.startsWith('/admin')) {
    return (
      <AdminGate>
        <Admin />
      </AdminGate>
    )
  }
  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
