import { useEffect, useState } from 'react'
import { THEMES, THEME_LABELS, type ThemeKey } from '../themes'

type Props = { telegramId: number; slug: string; onSaved?: () => void }

type Business = {
  name: string
  primary_color?: string | null
  design_theme?: ThemeKey | null
  description?: string | null
}

export default function BrandTab({ telegramId, slug, onSaved }: Props) {
  const [form, setForm] = useState<Business>({ name: '', primary_color: '#39ff8a', design_theme: 'neon_gaming', description: '' })
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
          design_theme: data.design_theme || 'neon_gaming',
          description: data.description || '',
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
        body: JSON.stringify({ telegram_id: telegramId, slug, ...form }),
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
      <h2>Настройки бренда</h2>
      <form onSubmit={handleSave} className="panel-form">
        <input className="panel-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Название" required />

        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="color"
            value={form.primary_color || '#39ff8a'}
            onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
            style={{ width: 44, height: 44, padding: 0, border: 'none', background: 'none' }}
          />
          <input className="panel-input" value={form.primary_color || ''} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} />
        </div>

        <select
          className="panel-input"
          value={form.design_theme || 'neon_gaming'}
          onChange={(e) => setForm({ ...form, design_theme: e.target.value as ThemeKey })}
        >
          {(Object.keys(THEMES) as ThemeKey[]).map((key) => (
            <option key={key} value={key}>
              {THEME_LABELS[key]}
            </option>
          ))}
        </select>

        <textarea
          className="panel-input"
          rows={3}
          value={form.description || ''}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Описание заведения"
        />

        <button className="panel-btn" type="submit" disabled={saving}>
          {saving ? 'Сохранение…' : saved ? 'Сохранено ✓' : 'Сохранить'}
        </button>
        {error && <div className="panel-error">{error}</div>}
      </form>
    </div>
  )
}
