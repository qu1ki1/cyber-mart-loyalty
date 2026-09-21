import { useEffect, useState } from 'react'
import { getInitData } from '../telegramAuth'

type CodeEntry = {
  id: number
  gift_name: string
  code: string
  redeemed: boolean
  expires_at: string | null
  created_at: string
}

type Props = { telegramId: number; slug: string; onBack: () => void }

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}

function isExpired(iso: string | null): boolean {
  if (!iso) return false
  return new Date(iso) < new Date()
}

export default function MyCodes({ telegramId, slug, onBack }: Props) {
  const [codes, setCodes] = useState<CodeEntry[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/my-codes?init_data=${encodeURIComponent(getInitData())}&slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCodes(data)
        else setError(data.error || 'Не удалось загрузить коды')
      })
      .catch(() => setError('Не удалось загрузить коды'))
  }, [telegramId, slug])

  return (
    <div className="cyber-card">
      <h1>Мои коды</h1>

      {error && <div className="status-pill error">{error}</div>}
      {!error && codes === null && <p className="panel-hint">Загрузка…</p>}
      {!error && codes && codes.length === 0 && <p className="panel-hint">Пока пусто — открой кейс, чтобы получить первый код.</p>}

      {codes && codes.length > 0 && (
        <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {codes.map((c) => {
            const expired = isExpired(c.expires_at)
            const dimmed = c.redeemed || expired
            return (
              <div
                key={c.id}
                className="ticket"
                style={{
                  margin: 0,
                  opacity: dimmed ? 0.45 : 1,
                  borderColor: dimmed ? 'var(--line-dim)' : 'var(--line)',
                  boxShadow: dimmed ? 'none' : '0 0 30px -18px var(--neon-soft)',
                  transition: 'opacity 200ms ease',
                }}
              >
                <div className="ticket-row">
                  <span className="label">{c.gift_name}</span>
                  <span className="value" style={{ color: dimmed ? 'var(--muted)' : 'var(--neon)' }}>
                    {c.code}
                  </span>
                </div>
                <div className="ticket-row">
                  <span className="label">{c.redeemed ? 'Погашен' : expired ? 'Срок истёк' : 'Действует до'}</span>
                  <span className="value" style={{ color: dimmed ? 'var(--muted)' : 'var(--neon)' }}>
                    {c.redeemed ? 'использован' : formatDate(c.expires_at)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <button className="ghost" onClick={onBack}>
        Назад
      </button>
    </div>
  )
}
