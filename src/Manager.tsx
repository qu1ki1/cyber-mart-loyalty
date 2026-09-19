import Cashier from './admin/Cashier'

const SESSION_KEY = 'cyberMartManagerUnlocked'

function logout() {
  sessionStorage.removeItem(SESSION_KEY)
  window.location.reload()
}

export default function Manager() {
  return (
    <div className="admin-app">
      <div className="bg-grid" />
      <div className="bg-glow" />
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 520, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div className="wordmark">
            LOYAL<span>TY</span> MANAGER
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
        <Cashier />
      </div>
    </div>
  )
}
