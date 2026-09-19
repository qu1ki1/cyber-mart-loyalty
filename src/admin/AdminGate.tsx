import { useState } from 'react'

const SESSION_KEY = 'cyberMartAdminUnlocked'

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1')
  const [password, setPassword] = useState('')
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setChecking(true)
    setError(null)

    try {
      const res = await fetch('/api/admin-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        sessionStorage.setItem(SESSION_KEY, '1')
        setUnlocked(true)
      } else {
        setError('Неверный пароль')
      }
    } catch {
      setError('Не удалось проверить пароль — проверь соединение')
    } finally {
      setChecking(false)
    }
  }

  if (unlocked) return <>{children}</>

  return (
    <div className="admin-app">
      <div className="bg-grid" />
      <div className="bg-glow" />
      <div className="admin-login">
        <div className="wordmark">
          CYBER<span>MART</span> ADMIN
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Пароль администратора"
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
