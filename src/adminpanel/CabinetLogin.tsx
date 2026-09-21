import { useEffect, useState } from 'react'
import { setWebSession, getWebSession } from '../auth'

type Business = {
  id: number
  slug: string
  name: string
  primary_color?: string | null
  text_color?: string | null
  design_theme?: string | null
  description?: string | null
}

type Props = { onLoggedIn: (business: Business) => void; onRegisterInstead: () => void }

type Mode = 'login' | 'forgot'

export default function CabinetLogin({ onLoggedIn, onRegisterInstead }: Props) {
  const [mode, setMode] = useState<Mode>('login')
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [autoChecking, setAutoChecking] = useState(true)

  // Авто-вход, если сессия уже сохранена (после регистрации или прошлого входа)
  useEffect(() => {
    const session = getWebSession()
    if (!session) {
      setAutoChecking(false)
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const checkRes = await fetch(
          `/api/team?slug=${encodeURIComponent(session.slug)}&password=${encodeURIComponent(session.password)}`
        )
        if (!checkRes.ok) {
          // Сессия устарела (пароль сменили) — очищаем
          const { clearWebSession } = await import('../auth')
          clearWebSession()
          if (!cancelled) setAutoChecking(false)
          return
        }
        const bizRes = await fetch(`/api/business-settings?slug=${encodeURIComponent(session.slug)}`)
        if (!bizRes.ok) {
          if (!cancelled) setAutoChecking(false)
          return
        }
        const business: Business = await bizRes.json()
        if (!cancelled) onLoggedIn(business)
      } catch {
        if (!cancelled) setAutoChecking(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [onLoggedIn])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!login.trim() || !password.trim()) return
    setBusy(true)
    setError(null)
    setSuccess(null)
    try {
      const checkRes = await fetch(
        `/api/team?slug=${encodeURIComponent(login.trim())}&password=${encodeURIComponent(password)}`
      )
      if (!checkRes.ok) {
        const data = await checkRes.json().catch(() => ({}))
        throw new Error(data.error || 'Неверный логин или пароль')
      }

      const bizRes = await fetch(`/api/business-settings?slug=${encodeURIComponent(login.trim())}`)
      if (!bizRes.ok) throw new Error('Не удалось загрузить бизнес')
      const business: Business = await bizRes.json()

      setWebSession(login.trim(), password)
      onLoggedIn(business)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неверный логин или пароль')
    } finally {
      setBusy(false)
    }
  }

  async function handleRecover(e: React.FormEvent) {
    e.preventDefault()
    if (!login.trim()) return
    setBusy(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch('/api/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: login.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Не удалось восстановить доступ')
      setSuccess(data.message || 'Новый пароль отправлен владельцу в Telegram.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось восстановить доступ')
    } finally {
      setBusy(false)
    }
  }

  if (autoChecking) {
    return (
      <div className="cyber-card">
        <h1>Личный кабинет</h1>
        <p className="panel-hint">Проверяем сохранённый вход…</p>
      </div>
    )
  }

  if (mode === 'forgot') {
    return (
      <div className="cyber-card">
        <h1>Забыл логин или пароль</h1>
        <p className="panel-hint" style={{ marginBottom: 20 }}>
          Введи логин бизнеса. Новый пароль придёт владельцу в Telegram (тому аккаунту, с которого регистрировали).
        </p>
        <form onSubmit={handleRecover} className="panel-form" style={{ maxWidth: 320, width: '100%' }}>
          <input
            className="panel-input"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder="Логин (например cybermart00)"
            required
            autoFocus
          />
          <button className="cta" type="submit" disabled={busy}>
            {busy ? 'Отправляем…' : 'Восстановить пароль'}
          </button>
          {error && <div className="status-pill error">{error}</div>}
          {success && <div className="status-pill ready">{success}</div>}
        </form>
        <button
          className="ghost"
          onClick={() => {
            setMode('login')
            setError(null)
            setSuccess(null)
          }}
        >
          ← Назад ко входу
        </button>
      </div>
    )
  }

  return (
    <div className="cyber-card">
      <h1>Личный кабинет</h1>
      <p className="panel-hint" style={{ marginBottom: 20 }}>
        Логин и пароль, которые ты задал(а) при регистрации бизнеса. В Telegram вход запоминается автоматически.
      </p>
      <form onSubmit={handleLogin} className="panel-form" style={{ maxWidth: 320, width: '100%' }}>
        <input
          className="panel-input"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          placeholder="Логин"
          required
          autoFocus
        />
        <input
          className="panel-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль"
          required
        />
        <button className="cta" type="submit" disabled={busy}>
          {busy ? 'Входим…' : 'Войти'}
        </button>
        {error && <div className="status-pill error">{error}</div>}
      </form>
      <button
        className="ghost"
        onClick={() => {
          setMode('forgot')
          setError(null)
          setSuccess(null)
        }}
      >
        Забыл логин или пароль
      </button>
      <button className="ghost" onClick={onRegisterInstead}>
        Впервые здесь? Зарегистрировать бизнес
      </button>
    </div>
  )
}
