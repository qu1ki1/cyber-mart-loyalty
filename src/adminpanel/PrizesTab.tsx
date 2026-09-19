import { useEffect, useState } from 'react'

type Gift = { id: number; name: string; chance: number; active: boolean }
type Props = { telegramId: number; slug: string }

export default function PrizesTab({ telegramId, slug }: Props) {
  const [gifts, setGifts] = useState<Gift[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [chance, setChance] = useState(10)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    const res = await fetch(`/api/gifts?telegram_id=${telegramId}&slug=${encodeURIComponent(slug)}`)
    const data = await res.json()
    if (res.ok) setGifts(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function addGift(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setError(null)
    const res = await fetch('/api/gifts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telegram_id: telegramId, slug, name, chance }),
    })
    const data = await res.json()
    if (!res.ok) return setError(data.error)
    setName('')
    setChance(10)
    load()
  }

  async function toggleGift(g: Gift) {
    await fetch('/api/gifts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telegram_id: telegramId, slug, id: g.id, active: !g.active }),
    })
    load()
  }

  async function deleteGift(g: Gift) {
    await fetch('/api/gifts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telegram_id: telegramId, slug, id: g.id }),
    })
    load()
  }

  return (
    <div>
      <div className="panel-card">
        <h2>Добавить приз</h2>
        <form onSubmit={addGift} className="panel-form">
          <input className="panel-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Название приза" />
          <input className="panel-input" type="number" min={1} value={chance} onChange={(e) => setChance(Number(e.target.value))} placeholder="Вес (шанс выпадения)" />
          <button className="panel-btn" type="submit">
            Добавить
          </button>
        </form>
        {error && <div className="panel-error">{error}</div>}
      </div>

      <div className="panel-card">
        <h2>Текущие призы</h2>
        {loading && <p className="panel-hint">Загрузка…</p>}
        {!loading && gifts.length === 0 && <p className="panel-hint">Призов пока нет</p>}
        {gifts.map((g) => (
          <div className="panel-row" key={g.id}>
            <button className={`panel-toggle ${g.active ? 'on' : ''}`} onClick={() => toggleGift(g)} />
            <span style={{ flex: 1, marginLeft: 12 }}>
              {g.name} <span style={{ color: 'var(--muted)', fontSize: 12 }}>вес {g.chance}</span>
            </span>
            <button
              onClick={() => deleteGift(g)}
              style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontSize: 12 }}
            >
              удалить
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
