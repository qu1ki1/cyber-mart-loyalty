import { RedeemCard } from './admin/Cashier'

const SESSION_KEY = 'cyberMartStaffUnlocked'

function logout() {
  sessionStorage.removeItem(SESSION_KEY)
  window.location.reload()
}

export default function Staff() {
  return (
    <div className="admin-app">
      <div className="bg-grid" />
      <div className="bg-glow" />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: 480, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div className="wordmark">
            LOYAL<span>TY</span>
          </div>
          <button
            onClick={logout}
            style={{
              background: 'none',
              border: '1px solid var(--line-dim)',
              color: 'var(--muted)',
              fontSize: 12,
              padding: '7px 14px',
              borderRadius: 100,
              cursor: 'pointer',
            }}
          >
            Выйти
          </button>
        </div>

        <h1 style={{ fontFamily: 'Rajdhani', fontSize: 24, marginBottom: 4 }}>Касса персонала</h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 20 }}>Погашение кода гостя</p>

        <RedeemCard />
      </div>
    </div>
  )
}
