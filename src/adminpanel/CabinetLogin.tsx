import { useState } from 'react'
import { setWebSession } from '../auth'

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

export default function CabinetLogin({ onLoggedIn, onRegisterInstead }: Props) {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!login.trim() || !password.trim()) return
    setBusy(true)
    setError(null)
    try {
      // /api/team владелец-only — успешный ответ значит пароль верный.
      const checkRes = await fetch(`/api/team?slug=${encodeURIComponent(login.trim())}&password=${encodeURIComponent(password)}`)
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

  return (
    <div className="cyber-card">
      <h1>Личный кабинет</h1>
      <p className="panel-hint" style={{ marginBottom: 20 }}>
        Логин и пароль, которые ты задал(а) при регистрации бизнеса.
      </p>
      <form onSubmit={handleSubmit} className="panel-form" style={{ maxWidth: 320, width: '100%' }}>
        <input className="panel-input" value={login} onChange={(e) => setLogin(e.target.value)} placeholder="Логин" required autoFocus />
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
      <button className="ghost" onClick={onRegisterInstead}>
        Впервые здесь? Зарегистрировать бизнес
      </button>
    </div>
  )
}
