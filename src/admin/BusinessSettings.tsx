import { useEffect, useState } from 'react'
import { ADMIN_PASSWORD_KEY, ADMIN_SLUG_KEY, ADMIN_BUSINESS_NAME_KEY } from './AdminGate'

type Business = {
  name: string
  logo_url?: string | null
  primary_color?: string | null
  design_theme?: string | null
  description?: string | null
}

export default function BusinessSettings() {
  const slug = sessionStorage.getItem(ADMIN_SLUG_KEY) || ''
  const password = sessionStorage.getItem(ADMIN_PASSWORD_KEY) || ''

  const [form, setForm] = useState<Business>({ name: '', logo_url: '', primary_color: '#39ff8a', description: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/business-settings?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((data) => {
        setForm({
          name: data.name || '',
          logo_url: data.logo_url || '',
          primary_color: data.primary_color || '#39ff8a',
          description: data.description || '',
        })
      })
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
        body: JSON.stringify({ slug, password, ...form }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Не удалось сохранить')
      sessionStorage.setItem(ADMIN_BUSINESS_NAME_KEY, data.name)
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="biz-settings-page">Загрузка…</div>

  return (
    <div className="biz-settings-page">
      <h1>Настройки бренда</h1>
      <p className="biz-settings-sub">Название, логотип и цвет, которые увидит гость в мини-аппе</p>

      <form onSubmit={handleSave} className="biz-settings-card">
        <label>Название</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />

        <label>Ссылка на логотип (URL картинки)</label>
        <input value={form.logo_url || ''} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} placeholder="https://…" />

        <label>Фирменный цвет</label>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            type="color"
            value={form.primary_color || '#39ff8a'}
            onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
            style={{ width: 44, height: 36, padding: 0, border: 'none', background: 'none' }}
          />
          <input value={form.primary_color || ''} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} />
        </div>

        <label>Описание заведения</label>
        <textarea
          value={form.description || ''}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
        />

        <button className="biz-settings-btn" type="submit" disabled={saving}>
          {saving ? 'Сохранение…' : saved ? 'Сохранено ✓' : 'Сохранить'}
        </button>
        {error && <div className="biz-settings-error">{error}</div>}
      </form>

      <style>{`
        .biz-settings-page h1{ font-family:Rajdhani; font-size:26px; margin-bottom:4px; }
        .biz-settings-sub{ color:var(--muted); font-size:13px; margin-bottom:20px; }
        .biz-settings-card{
          background: rgba(255,255,255,.03);
          border: 1px solid var(--line);
          border-radius:18px;
          padding:22px;
          display:flex;
          flex-direction:column;
          gap:6px;
          max-width:420px;
        }
        .biz-settings-card label{ font-size:12px; color:var(--muted); margin-top:10px; }
        .biz-settings-card input, .biz-settings-card textarea{
          padding:12px 14px;
          border-radius:12px;
          border:1px solid var(--line);
          background: rgba(0,0,0,.25);
          color:#eef7f0;
          font-family:Rajdhani;
          font-size:15px;
          resize:vertical;
        }
        .biz-settings-btn{
          margin-top:18px;
          border:none;
          cursor:pointer;
          padding:13px;
          border-radius:12px;
          font-family:Rajdhani;
          font-size:16px;
          font-weight:700;
          color:#04140a;
          background: linear-gradient(100deg, #21c85f, var(--neon) 60%);
        }
        .biz-settings-btn:disabled{ opacity:.5; }
        .biz-settings-error{ color:#ff6b6b; font-size:13px; margin-top:10px; }
      `}</style>
    </div>
  )
}
