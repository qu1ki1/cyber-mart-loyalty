import { useState } from 'react'

const SESSION_KEY = 'cyberMartManagerUnlocked'
export const MANAGER_PASSWORD_KEY = 'cyberMartAdminPassword'
export const MANAGER_SLUG_KEY = 'cyberMartAdminSlug'

export default function ManagerGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1')
  const [slug, setSlug] = useState('')
  const [password, setPassword] = useState('')
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setChecking(true)
    setError(null)
    try {
      const res = await fetch('/api/manager-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, password }),
      })
      const data = await res.json()
      if (res.ok) {
        sessionStorage.setItem(SESSION_KEY, '1')
        sessionStorage.setItem(MANAGER_PASSWORD_KEY, password)
        sessionStorage.setItem(MANAGER_SLUG_KEY, slug)
        setUnlocked(true)
      } else {
        setError(data.error || 'Неверный пароль')
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
          LOYAL<span>TY</span> MANAGER
        </div>
        <form onSubmit={handleSubmit}>
          <input placeholder="Ссылка бизнеса (slug)" value={slug} onChange={(e) => setSlug(e.target.value)} autoFocus style={{ marginBottom: 10 }} />
          <input type="password" placeholder="Пароль управляющего" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="cta" type="submit" disabled={checking} style={{ marginTop: 12 }}>
            {checking ? 'Проверка…' : 'Войти'}
          </button>
        </form>
        {error && <div className="status-pill error">{error}</div>}
      </div>
    </div>
  )
}
