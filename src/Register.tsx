import { useState } from 'react'

export default function Register() {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ slug: string; deep_link_hint: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/business-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Не удалось зарегистрировать бизнес')
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось зарегистрировать бизнес')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="app">
      <div className="bg-grid" />
      <div className="bg-glow" />
      <div className="cyber-card" style={{ maxWidth: 380 }}>
        <div className="wordmark" style={{ marginBottom: 24 }}>
          LOYAL<span>TY</span>
        </div>
        <h1>Регистрация бизнеса</h1>

        {result ? (
          <div className="ticket" style={{ textAlign: 'left' }}>
            <div className="ticket-row">
              <span className="label">Готово</span>
              <span className="value">{name}</span>
            </div>
            <div className="ticket-row">
              <span className="label">Ссылка для QR</span>
              <span className="value">{result.deep_link_hint}</span>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 12 }}>
              Замени `&lt;твой_бот&gt;` на username своего бота и сделай QR-код из этой ссылки — распечатай и повесь в заведении.
              Пароль для входа в админку — тот, что ты только что придумал.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              style={{ padding: "13px 15px", borderRadius: 12, border: "1px solid var(--line-dim)", background: "var(--panel)", color: "var(--ink)", fontSize: 15 }}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Название бизнеса"
              required
            />
            <input
              style={{ padding: "13px 15px", borderRadius: 12, border: "1px solid var(--line-dim)", background: "var(--panel)", color: "var(--ink)", fontSize: 15 }}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль для входа в админку"
              required
            />
            <button className="cta" type="submit" disabled={busy}>
              {busy ? 'Регистрируем…' : 'Зарегистрировать'}
            </button>
            {error && <div className="status-pill error">{error}</div>}
          </form>
        )}
      </div>
    </div>
  )
}
