import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import App from './App'
import Admin from './Admin'
import AdminGate from './admin/AdminGate'
import Register from './Register'
import Staff from './Staff'
import StaffGate from './StaffGate'
import Manager from './Manager'
import ManagerGate from './ManagerGate'
import SuperAdmin from './SuperAdmin'

const path = window.location.pathname

function Root() {
  if (path.startsWith('/register')) return <Register />
  if (path.startsWith('/super-admin')) return <SuperAdmin />
  if (path.startsWith('/staff')) {
    return (
      <StaffGate>
        <Staff />
      </StaffGate>
    )
  }
  if (path.startsWith('/manager')) {
    return (
      <ManagerGate>
        <Manager />
      </ManagerGate>
    )
  }
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
