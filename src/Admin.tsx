import AdminMenu from './admin/AdminMenu'

import Dashboard from './admin/Dashboard'
import Users from './admin/Users'
import Gifts from './admin/Gifts'
import Winners from './admin/Winners'
import Settings from './admin/Settings'
import Cashier from './admin/Cashier'

import { motion } from 'framer-motion'

export default function Admin() {
  const path = window.location.pathname

  let page = <Dashboard />

  if (path === '/admin/users') page = <Users />
  if (path === '/admin/gifts') page = <Gifts />
  if (path === '/admin/winners') page = <Winners />
  if (path === '/admin/settings') page = <Settings />
  if (path === '/admin/cashier') page = <Cashier />

  return (
    <div className="admin-app">
      <div className="bg-grid" />
      <div className="bg-glow" />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'relative', zIndex: 2 }}>
        <AdminMenu />

        <section style={{ marginTop: 20 }}>{page}</section>
      </motion.div>
    </div>
  )
}
