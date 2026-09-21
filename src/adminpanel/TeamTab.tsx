import { useState } from 'react'
import { getInitData } from '../telegramAuth'

type Props = { telegramId: number; slug: string; botUsername: string }

export default function TeamTab({ telegramId, slug, botUsername }: Props) {
  return (
    <div>
      <QrCard slug={slug} botUsername={botUsername} />
      <InviteCard telegramId={telegramId} slug={slug} role="manager" botUsername={botUsername} title="Пригласить управляющего" hint="Может гасить коды и выдавать попытки" />
      <InviteCard telegramId={telegramId} slug={slug} role="staff" botUsername={botUsername} title="Пригласить сотрудника" hint="Может только гасить коды" />
    </div>
  )
}

function QrCard({ slug, botUsername }: { slug: string; botUsername: string }) {
  if (!botUsername) {
    return (
      <div className="panel-card">
        <h2>QR-код для заведения</h2>
        <p className="panel-hint">
          Чтобы показать QR, нужно задать VITE_BOT_USERNAME в переменных окружения Vercel — username твоего бота без @.
        </p>
      </div>
    )
  }

  const deepLink = `https://t.me/${botUsername}?start=${slug}`
  const qrImg = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(deepLink)}`

  return (
    <div className="panel-card" style={{ textAlign: 'center' }}>
      <h2>QR-код для заведения</h2>
      <p className="panel-hint">Распечатай и повесь у входа или на кассе — гости сканируют и сразу попадают в игру.</p>
      <img
        src={qrImg}
        alt="QR-код"
        style={{ width: 180, height: 180, borderRadius: 12, background: '#fff', padding: 10, margin: '4px auto 12px' }}
      />
      <div style={{ fontSize: 12, color: 'var(--muted)', wordBreak: 'break-all', marginBottom: 10 }}>{deepLink}</div>
      <a href={qrImg} download={`qr-${slug}.png`} className="panel-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>
        Скачать QR
      </a>
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
        body: JSON.stringify({ init_data: getInitData(), telegram_id: telegramId, slug, role }),
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
