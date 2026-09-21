import { useEffect, useState } from 'react'
import { setWebSession, getWebSession, clearWebSession } from '../auth'
import AdminPanel from '../adminpanel/AdminPanel'

type Business = { name: string }

export default function BusinessLogin() {
  const [slug, setSlug] = useState('')
  const [password, setPassword] = useState('')
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loggedIn, setLoggedIn] = useState<{ slug: string; business: Business } | null>(null)
  const [mode, setMode] = useState<'login' | 'forgot'>('login')
  const [autoChecking, setAutoChecking] = useState(true)

  useEffect(() => {
    const session = getWebSession()
    if (!session) {
      setAutoChecking(false)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(
          `/api/team?slug=${encodeURIComponent(session.slug)}&password=${encodeURIComponent(session.password)}`
        )
        if (!res.ok) {
          clearWebSession()
          if (!cancelled) setAutoChecking(false)
          return
        }
        const bizRes = await fetch(`/api/business-settings?slug=${encodeURIComponent(session.slug)}`)
        const business = await bizRes.json()
        if (!cancelled) setLoggedIn({ slug: session.slug, business })
      } catch {
        if (!cancelled) setAutoChecking(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setChecking(true)
    setError(null)
    setSuccess(null)
    try {
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

  async function handleRecover(e: React.FormEvent) {
    e.preventDefault()
    if (!slug.trim()) return
    setChecking(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch('/api/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: slug.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Не удалось восстановить доступ')
      setSuccess(data.message || 'Новый пароль отправлен в Telegram.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось восстановить доступ')
    } finally {
      setChecking(false)
    }
  }

  function logout() {
    clearWebSession()
    setLoggedIn(null)
    window.location.reload()
  }

  if (autoChecking && !loggedIn) {
    return (
      <div className="app">
        <div className="bg-grid" />
        <div className="bg-glow" />
        <div className="cyber-card" style={{ maxWidth: 340 }}>
          <p className="panel-hint">Проверяем сохранённый вход…</p>
        </div>
      </div>
    )
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

        {mode === 'forgot' ? (
          <>
            <h1>Забыл пароль</h1>
            <p className="panel-hint" style={{ marginBottom: 20 }}>
              Введи логин бизнеса. Новый пароль придёт владельцу в Telegram.
            </p>
            <form onSubmit={handleRecover} className="panel-form" style={{ width: '100%' }}>
              <input
                className="panel-input"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="Логин / slug"
                required
              />
              <button className="cta" type="submit" disabled={checking}>
                {checking ? 'Отправляем…' : 'Восстановить'}
              </button>
              {error && <div className="status-pill error">{error}</div>}
              {success && <div className="status-pill ready">{success}</div>}
            </form>
            <button className="ghost" onClick={() => { setMode('login'); setError(null); setSuccess(null) }}>
              ← Назад ко входу
            </button>
          </>
        ) : (
          <>
            <h1>Вход для владельца</h1>
            <p className="panel-hint" style={{ marginBottom: 20 }}>
              Управляй бизнесом с компьютера, без Telegram. После входа сессия сохраняется.
            </p>
            <form onSubmit={handleSubmit} className="panel-form" style={{ width: '100%' }}>
              <input
                className="panel-input"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="Ссылка бизнеса (slug)"
                required
              />
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
            <button className="ghost" onClick={() => { setMode('forgot'); setError(null); setSuccess(null) }}>
              Забыл логин или пароль
            </button>
          </>
        )}
      </div>
    </div>
  )
}
