import { useEffect, useState } from 'react'
import { getInitData } from '../telegramAuth'

type Props = { telegramId: number; slug: string; onSaved?: () => void }

type Business = {
  name: string
  primary_color?: string | null
  text_color?: string | null
  description?: string | null
  reminder_text?: string | null
}

export default function BrandTab({ telegramId, slug, onSaved }: Props) {
  const [form, setForm] = useState<Business>({ name: '', primary_color: '#39ff8a', text_color: '#eef7f0', description: '', reminder_text: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/business-settings?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((data) =>
        setForm({
          name: data.name || '',
          primary_color: data.primary_color || '#39ff8a',
          text_color: data.text_color || '#eef7f0',
          description: data.description || '',
          reminder_text: data.reminder_text || '',
        })
      )
      .finally(() => setLoading(false))
  }, [slug])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    setError(null)
    try {
      const res = await fetch('/api/business-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ init_data: getInitData(), telegram_id: telegramId, slug, ...form }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Не удалось сохранить')
      setSaved(true)
      onSaved?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="panel-card">Загрузка…</div>

  return (
    <div className="panel-card">
      <h2>Настройки дизайна</h2>
      <form onSubmit={handleSave} className="panel-form">
        <label style={{ fontSize: 12, color: 'var(--muted)' }}>Название бизнеса</label>
        <input className="panel-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Название" required />

        <label style={{ fontSize: 12, color: 'var(--muted)' }}>Акцентный цвет (кнопки, подсветка, барабан)</label>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="color"
            value={form.primary_color || '#39ff8a'}
            onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
            style={{ width: 44, height: 44, padding: 0, border: 'none', background: 'none' }}
          />
          <input
            className="panel-input"
            value={form.primary_color || ''}
            onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
            style={{ textAlign: 'left' }}
          />
        </div>

        <label style={{ fontSize: 12, color: 'var(--muted)' }}>Цвет текста и заголовков</label>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="color"
            value={form.text_color || '#eef7f0'}
            onChange={(e) => setForm({ ...form, text_color: e.target.value })}
            style={{ width: 44, height: 44, padding: 0, border: 'none', background: 'none' }}
          />
          <input
            className="panel-input"
            value={form.text_color || ''}
            onChange={(e) => setForm({ ...form, text_color: e.target.value })}
            style={{ textAlign: 'left' }}
          />
        </div>

        <textarea
          className="panel-input"
          rows={3}
          value={form.description || ''}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Описание заведения"
        />

<label style={{ fontSize: 12, color: 'var(--muted)' }}>Текст напоминания о сгорающем подарке (необязательно)</label>
        <textarea
          className="panel-input"
          rows={2}
          value={form.reminder_text || ''}
          onChange={(e) => setForm({ ...form, reminder_text: e.target.value })}
          placeholder="Если оставить пустым — используется стандартный текст"
        />

                <button className="panel-btn" type="submit" disabled={saving}>
          {saving ? 'Сохранение…' : saved ? 'Сохранено ✓' : 'Сохранить'}
        </button>
        {error && <div className="panel-error">{error}</div>}
      </form>
    </div>
  )
}
