import { useState } from 'react'
import { getInitData } from '../telegramAuth'
import { setWebSession } from '../auth'

type Props = { telegramId: number; onCreated: (slug: string) => void }

function slugifyPreview(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яё\s-]/gi, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default function RegisterInApp({ telegramId, onCreated }: Props) {
  const [name, setName] = useState('')
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !login.trim() || !password.trim()) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/business-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          init_data: getInitData(),
          name: name.trim(),
          login: login.trim(),
          owner_password: password,
          telegram_id: telegramId,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Не удалось создать бизнес')
      // Сразу запоминаем как сессию личного кабинета — не нужно логиниться отдельно.
      setWebSession(data.slug, password)
      onCreated(data.slug)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось создать бизнес')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="cyber-card">
      <h1>Запусти свою программу лояльности</h1>
      <p className="panel-hint" style={{ marginBottom: 20 }}>
        Название, логин и пароль — с ними потом заходишь в свой личный кабинет прямо здесь, в приложении.
      </p>
      <form onSubmit={handleSubmit} className="panel-form" style={{ maxWidth: 320, width: '100%' }}>
        <input className="panel-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Название заведения" required autoFocus />
        <input
          className="panel-input"
          value={login}
          onChange={(e) => setLogin(slugifyPreview(e.target.value))}
          placeholder="Логин (латиницей, например cyber-mart)"
          required
        />
        <input
          className="panel-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль (минимум 4 символа)"
          required
          minLength={4}
        />
        <button className="cta" type="submit" disabled={busy}>
          {busy ? 'Создаём…' : 'Создать'}
        </button>
        {error && <div className="status-pill error">{error}</div>}
      </form>
    </div>
  )
}
