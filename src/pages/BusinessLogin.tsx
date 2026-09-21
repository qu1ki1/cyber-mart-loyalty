import { useState } from 'react'
import { setWebSession } from '../auth'
import AdminPanel from '../adminpanel/AdminPanel'

type Business = { name: string }

export default function BusinessLogin() {
  const [slug, setSlug] = useState('')
  const [password, setPassword] = useState('')
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loggedIn, setLoggedIn] = useState<{ slug: string; business: Business } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setChecking(true)
    setError(null)
    try {
      // /api/team владелец-only — если пароль верный, значит вход состоялся.
      const res = await fetch(`/api/team?slug=${encodeURIComponent(slug)}&password=${encodeURIComponent(password)}`)
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Неверный slug или пароль')
      }

      const bizRes = await fetch(`/api/business-settings?slug=${encodeURIComponent(slug)}`)
      const business = await bizRes.json()

      setWebSession(slug, password)
      setLoggedIn({ slug, business })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неверный slug или пароль')
    } finally {
      setChecking(false)
    }
  }

  function logout() {
    sessionStorage.clear()
    setLoggedIn(null)
    window.location.reload()
  }

  if (loggedIn) {
    return (
      <div className="app">
        <div className="bg-grid" />
        <div className="bg-glow" />
        <header>
          <div className="wordmark">
            LOYAL<span>TY</span>
          </div>
          <button className="ghost" onClick={logout} style={{ marginTop: 0 }}>
            Выйти
          </button>
        </header>
        <AdminPanel telegramId={0} slug={loggedIn.slug} role="owner" botUsername={import.meta.env.VITE_BOT_USERNAME || ''} />
        <footer>{loggedIn.business.name?.toUpperCase()} · LOYALTY</footer>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="bg-grid" />
      <div className="bg-glow" />
      <div className="cyber-card" style={{ maxWidth: 340 }}>
        <div className="wordmark" style={{ marginBottom: 24 }}>
          LOYAL<span>TY</span>
        </div>
        <h1>Вход для владельца</h1>
        <p className="panel-hint" style={{ marginBottom: 20 }}>
          Управляй бизнесом с компьютера, без Telegram. Пароль задаётся во вкладке «Дизайн» внутри мини-аппа.
        </p>
        <form onSubmit={handleSubmit} className="panel-form" style={{ width: '100%' }}>
          <input className="panel-input" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Ссылка бизнеса (slug)" required />
          <input
            className="panel-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            required
          />
          <button className="cta" type="submit" disabled={checking}>
            {checking ? 'Проверка…' : 'Войти'}
          </button>
          {error && <div className="status-pill error">{error}</div>}
        </form>
      </div>
    </div>
  )
}
