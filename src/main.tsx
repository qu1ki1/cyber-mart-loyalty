import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import App from './App'
import BusinessLogin from './pages/BusinessLogin'

// Единственный отдельный путь помимо мини-аппа: /login — вход для
// владельца с обычного компьютера, без Telegram (см. src/pages/BusinessLogin.tsx).
const isLoginPage = window.location.pathname.startsWith('/login')

createRoot(document.getElementById('root')!).render(
  <StrictMode>{isLoginPage ? <BusinessLogin /> : <App />}</StrictMode>,
)
