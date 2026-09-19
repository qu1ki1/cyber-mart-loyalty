import { useState } from 'react'

type Stats = {
  total_businesses: number
  total_users: number
  total_spins: number
  total_redeemed: number
  businesses: { id: number; name: string; slug: string; created_at: string; total_spins: number; total_redeemed: number }[]
}

export default function SuperAdmin() {
  const [password, setPassword] = useState('')
  const [stats, setStats] = useState<Stats | null>(null)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setChecking(true)
    setError(null)
    try {
      const res = await fetch('/api/super-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Не удалось войти')
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось войти')
    } finally {
      setChecking(false)
    }
  }

  if (!stats) {
    return (
      <div className="admin-app">
        <div className="bg-grid" />
        <div className="bg-glow" />
        <div className="admin-login">
          <div className="wordmark">
            LOYAL<span>TY</span> PLATFORM
          </div>
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              placeholder="Пароль супер-администратора"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            <button className="cta" type="submit" disabled={checking} style={{ marginTop: 12 }}>
              {checking ? 'Проверка…' : 'Войти'}
            </button>
          </form>
          {error && <div className="status-pill error">{error}</div>}
        </div>
      </div>
    )
  }

  return (
    <div className="admin-app">
      <div className="bg-grid" />
      <div className="bg-glow" />
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 720, margin: '0 auto' }}>
        <div className="wordmark" style={{ marginBottom: 20 }}>
          LOYAL<span>TY</span> PLATFORM
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14, marginBottom: 24 }}>
          <StatBox label="Бизнесов" value={stats.total_businesses} />
          <StatBox label="Гостей всего" value={stats.total_users} />
          <StatBox label="Открытий кейса" value={stats.total_spins} />
          <StatBox label="Погашено" value={stats.total_redeemed} />
        </div>

        <h2 style={{ fontFamily: 'Rajdhani', fontSize: 18, marginBottom: 12, color: 'var(--muted)' }}>Бизнесы на платформе</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {stats.businesses.map((b) => (
            <div
              key={b.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(255,255,255,.03)',
                border: '1px solid var(--line-dim)',
                borderRadius: 12,
                padding: '12px 16px',
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{b.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>/{b.slug}</div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--neon)', textAlign: 'right' }}>
                {b.total_spins} открытий · {b.total_redeemed} погашено
              </div>
            </div>
          ))}
          {stats.businesses.length === 0 && <p style={{ color: 'var(--muted)' }}>Пока ни одного бизнеса</p>}
        </div>
      </div>
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid var(--line-dim)', borderRadius: 14, padding: 16 }}>
      <div style={{ fontFamily: 'Rajdhani', fontSize: 28, fontWeight: 700, color: 'var(--neon)' }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{label}</div>
    </div>
  )
}
