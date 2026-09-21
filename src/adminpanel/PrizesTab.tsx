import { useEffect, useState } from 'react'
import { getAuthFields, authQueryString } from '../auth'
import { Icon, ICON_OPTIONS, type IconKey } from '../components/Icon'

type Gift = { id: number; name: string; chance: number; icon: IconKey; active: boolean }
type Props = { telegramId: number; slug: string }

export default function PrizesTab({ telegramId, slug }: Props) {
  const [gifts, setGifts] = useState<Gift[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [percent, setPercent] = useState(10)
  const [icon, setIcon] = useState<IconKey>('star')
  const [error, setError] = useState<string | null>(null)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editPercent, setEditPercent] = useState(10)
  const [editIcon, setEditIcon] = useState<IconKey>('star')

  async function load() {
    const res = await fetch(`/api/gifts?${authQueryString()}&slug=${encodeURIComponent(slug)}`)
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
      body: JSON.stringify({ ...getAuthFields(), telegram_id: telegramId, slug, name, chance: percent, icon }),
    })
    const data = await res.json()
    if (!res.ok) return setError(data.error)
    setName('')
    setPercent(10)
    setIcon('star')
    load()
  }

  async function toggleGift(g: Gift) {
    await fetch('/api/gifts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...getAuthFields(), telegram_id: telegramId, slug, id: g.id, active: !g.active }),
    })
    load()
  }

  async function deleteGift(g: Gift) {
    await fetch('/api/gifts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...getAuthFields(), telegram_id: telegramId, slug, id: g.id }),
    })
    load()
  }

  function startEdit(g: Gift) {
    setEditingId(g.id)
    setEditName(g.name)
    setEditPercent(g.chance)
    setEditIcon(g.icon || 'star')
  }

  async function saveEdit(g: Gift) {
    if (!editName.trim()) return
    await fetch('/api/gifts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...getAuthFields(), telegram_id: telegramId,
        slug,
        id: g.id,
        name: editName,
        chance: editPercent,
        icon: editIcon,
      }),
    })
    setEditingId(null)
    load()
  }

  return (
    <div>
      <ExpirySettingCard telegramId={telegramId} slug={slug} />

      <div className="panel-card">
        <h2>Добавить приз</h2>
        <p className="panel-hint">
          Название и процент выпадения. <strong style={{ color: 'var(--ink)' }}>Чем ценнее приз — тем ниже должен быть процент</strong>, иначе
          джекпоты будут выпадать слишком часто.
        </p>
        <form onSubmit={addGift} className="panel-form">
          <input className="panel-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Название приза" />
          <input
            className="panel-input"
            type="number"
            min={1}
            value={percent}
            onChange={(e) => setPercent(Number(e.target.value))}
            placeholder="Процент (например, 5 для редкого)"
          />
          <label style={{ fontSize: 12, color: 'var(--muted)' }}>Иконка</label>
          <IconGrid value={icon} onChange={setIcon} />
          <button className="panel-btn" type="submit">
            Добавить
          </button>
        </form>
        {error && <div className="panel-error">{error}</div>}
      </div>

      <div className="panel-card">
        <h2>Текущие призы</h2>
        <p className="panel-hint">Нажми на приз, чтобы изменить название, процент или иконку.</p>
        {loading && <p className="panel-hint">Загрузка…</p>}
        {!loading && gifts.length === 0 && <p className="panel-hint">Призов пока нет</p>}
        {gifts.map((g) =>
          editingId === g.id ? (
            <div className="panel-row" key={g.id} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
              <input className="panel-input" value={editName} onChange={(e) => setEditName(e.target.value)} />
              <input className="panel-input" type="number" min={1} value={editPercent} onChange={(e) => setEditPercent(Number(e.target.value))} />
              <IconGrid value={editIcon} onChange={setEditIcon} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="panel-btn" style={{ flex: 1 }} onClick={() => saveEdit(g)}>
                  Сохранить
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  style={{ background: 'none', border: '1px solid var(--line-dim)', borderRadius: 12, color: 'var(--muted)', cursor: 'pointer', padding: '0 14px' }}
                >
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <div className="panel-row" key={g.id}>
              <button className={`panel-toggle ${g.active ? 'on' : ''}`} onClick={() => toggleGift(g)} />
              <Icon icon={g.icon || 'star'} className="panel-prize-icon" />
              <span style={{ flex: 1, marginLeft: 10, cursor: 'pointer' }} onClick={() => startEdit(g)}>
                {g.name} <span style={{ color: 'var(--muted)', fontSize: 12 }}>{g.chance}%</span>
              </span>
              <button
                onClick={() => deleteGift(g)}
                style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontSize: 12 }}
              >
                удалить
              </button>
            </div>
          )
        )}
      </div>
    </div>
  )
}

function IconGrid({ value, onChange }: { value: IconKey; onChange: (k: IconKey) => void }) {
  return (
    <div className="icon-grid">
      {ICON_OPTIONS.map((key) => (
        <button
          key={key}
          type="button"
          className={`icon-btn ${value === key ? 'selected' : ''}`}
          onClick={() => onChange(key)}
        >
          <Icon icon={key} />
        </button>
      ))}
    </div>
  )
}

function ExpirySettingCard({ telegramId, slug }: { telegramId: number; slug: string }) {
  const [days, setDays] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch(`/api/business-settings?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((data) => setDays(data.code_lifetime_days || 14))
  }, [slug])

  async function save() {
    setSaving(true)
    setSaved(false)
    await fetch('/api/business-settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...getAuthFields(), telegram_id: telegramId, slug, code_lifetime_days: days }),
    })
    setSaving(false)
    setSaved(true)
  }

  if (days === null) return null

  return (
    <div className="panel-card">
      <h2>Срок действия кода</h2>
      <p className="panel-hint">Сколько дней код остаётся активным после выигрыша, для всех призов сразу.</p>
      <form className="panel-form row" onSubmit={(e) => e.preventDefault()}>
        <input
          className="panel-input"
          type="number"
          min={1}
          value={days}
          onChange={(e) => {
            setDays(Number(e.target.value))
            setSaved(false)
          }}
          style={{ maxWidth: 100 }}
        />
        <span style={{ alignSelf: 'center', color: 'var(--muted)', fontSize: 14 }}>дней</span>
        <button className="panel-btn" onClick={save} disabled={saving}>
          {saving ? '…' : saved ? 'Сохранено ✓' : 'Сохранить'}
        </button>
      </form>
    </div>
  )
}
