import { useEffect, useState } from 'react'
import { getInitData } from '../telegramAuth'

type Entry = {
  id: number
  guest_name: string
  gift_name: string
  code: string
  redeemed: boolean
  expires_at: string | null
  created_at: string
}

type Props = { slug: string }

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function HistoryTab({ slug }: Props) {
  const [entries, setEntries] = useState<Entry[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/reports?type=history&init_data=${encodeURIComponent(getInitData())}&slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setEntries(data)
        else setError(data.error || 'Не удалось загрузить историю')
      })
      .catch(() => setError('Не удалось загрузить историю'))
  }, [slug])

  return (
    <div className="panel-card">
      <h2>История</h2>
      <p className="panel-hint">Последние 200 выигрышей — кто, что и когда получил.</p>

      {error && <div className="panel-error">{error}</div>}
      {!error && entries === null && <p className="panel-hint">Загрузка…</p>}
      {!error && entries && entries.length === 0 && <p className="panel-hint">Пока пусто</p>}

      {entries &&
        entries.map((e) => (
          <div className="panel-row" key={e.id}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5 }}>
                {e.guest_name} — {e.gift_name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                {e.code} · {formatDate(e.created_at)}
              </div>
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: e.redeemed ? 'var(--neon)' : 'var(--muted)',
                whiteSpace: 'nowrap',
              }}
            >
              {e.redeemed ? 'погашен' : 'активен'}
            </span>
          </div>
        ))}
    </div>
  )
}
