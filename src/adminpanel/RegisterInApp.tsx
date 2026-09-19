import { useState } from 'react'

type Props = { telegramId: number; onCreated: (slug: string) => void }

export default function RegisterInApp({ telegramId, onCreated }: Props) {
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/business-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), telegram_id: telegramId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Не удалось создать бизнес')
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
        Придумай название — всё остальное (призы, QR-ссылка) настроится автоматически, доделаешь позже.
      </p>
      <form onSubmit={handleSubmit} className="panel-form" style={{ maxWidth: 320, width: '100%' }}>
        <input className="panel-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Название заведения" required autoFocus />
        <button className="cta" type="submit" disabled={busy}>
          {busy ? 'Создаём…' : 'Создать'}
        </button>
        {error && <div className="status-pill error">{error}</div>}
      </form>
    </div>
  )
}
