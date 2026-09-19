import { useState } from 'react'

type Props = { telegramId: number; slug: string; botUsername: string }

export default function TeamTab({ telegramId, slug, botUsername }: Props) {
  return (
    <div>
      <InviteCard telegramId={telegramId} slug={slug} role="manager" botUsername={botUsername} title="Пригласить управляющего" hint="Может гасить коды и выдавать попытки" />
      <InviteCard telegramId={telegramId} slug={slug} role="staff" botUsername={botUsername} title="Пригласить сотрудника" hint="Может только гасить коды" />
    </div>
  )
}

function InviteCard({
  telegramId,
  slug,
  role,
  botUsername,
  title,
  hint,
}: {
  telegramId: number
  slug: string
  role: 'manager' | 'staff'
  botUsername: string
  title: string
  hint: string
}) {
  const [link, setLink] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function generate() {
    setBusy(true)
    setError(null)
    setLink(null)
    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegram_id: telegramId, slug, role }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Не удалось создать приглашение')
      setLink(`https://t.me/${botUsername}?start=join-${data.code}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось создать приглашение')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="panel-card">
      <h2>{title}</h2>
      <p className="panel-hint">{hint}. Ссылка одноразовая — сработает у того, кто перейдёт по ней первым.</p>
      <button className="panel-btn" onClick={generate} disabled={busy}>
        {busy ? '…' : 'Создать ссылку'}
      </button>
      {link && (
        <div className="panel-result" style={{ wordBreak: 'break-all' }}>
          {link}
          <br />
          <button
            className="panel-btn"
            style={{ marginTop: 8, width: 'auto', padding: '6px 14px', fontSize: 13 }}
            onClick={() => navigator.clipboard?.writeText(link)}
          >
            Скопировать
          </button>
        </div>
      )}
      {error && <div className="panel-error">{error}</div>}
    </div>
  )
}
