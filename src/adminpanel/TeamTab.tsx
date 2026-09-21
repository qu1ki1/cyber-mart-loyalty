import { useEffect, useState } from 'react'
import { getAuthFields, authQueryString } from '../auth'

type Props = { telegramId: number; slug: string; botUsername: string }
type Member = { id: number; role: 'manager' | 'staff'; added_at: string; name: string }

export default function TeamTab({ telegramId, slug, botUsername }: Props) {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div>
      <QrCard slug={slug} botUsername={botUsername} />
      <InviteCard
        telegramId={telegramId}
        slug={slug}
        role="manager"
        botUsername={botUsername}
        title="Пригласить управляющего"
        hint="Может гасить коды и выдавать попытки"
        onCreated={() => setRefreshKey((k) => k + 1)}
      />
      <InviteCard
        telegramId={telegramId}
        slug={slug}
        role="staff"
        botUsername={botUsername}
        title="Пригласить сотрудника"
        hint="Может только гасить коды"
        onCreated={() => setRefreshKey((k) => k + 1)}
      />
      <TeamList telegramId={telegramId} slug={slug} refreshKey={refreshKey} />
    </div>
  )
}

function QrCard({ slug, botUsername }: { slug: string; botUsername: string }) {
  const [downloading, setDownloading] = useState(false)

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
  // Печатный размер побольше (900px) — чтобы не размывалось при печати А5/А4.
  const qrImg = `https://api.qrserver.com/v1/create-qr-code/?size=900x900&margin=20&data=${encodeURIComponent(deepLink)}`

  async function downloadQr() {
    setDownloading(true)
    try {
      // Просто <a href download> не работает для внешних картинок — браузер
      // такое скачивание блокирует. Поэтому качаем как файл сами и отдаём
      // как blob-ссылку — так скачивается по-настоящему, а не открывается вкладкой.
      const res = await fetch(qrImg)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `qr-${slug}.png`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      window.open(qrImg, '_blank')
    } finally {
      setDownloading(false)
    }
  }

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
      <button className="panel-btn" onClick={downloadQr} disabled={downloading}>
        {downloading ? 'Скачиваю…' : 'Скачать QR для печати'}
      </button>
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
  onCreated,
}: {
  telegramId: number
  slug: string
  role: 'manager' | 'staff'
  botUsername: string
  title: string
  hint: string
  onCreated: () => void
}) {
  const [link, setLink] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function generate() {
    setBusy(true)
    setError(null)
    setLink(null)
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...getAuthFields(), telegram_id: telegramId, slug, role }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Не удалось создать приглашение')
      setLink(`https://t.me/${botUsername}?start=join-${data.code}`)
      onCreated()
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

function TeamList({ telegramId, slug, refreshKey }: { telegramId: number; slug: string; refreshKey: number }) {
  const [members, setMembers] = useState<Member[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  function load() {
    fetch(`/api/team?${authQueryString()}&slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setMembers(data)
        else setError(data.error || 'Не удалось загрузить команду')
      })
      .catch(() => setError('Не удалось загрузить команду'))
  }

  useEffect(load, [slug, refreshKey])

  async function remove(id: number) {
    await fetch('/api/team', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...getAuthFields(), telegram_id: telegramId, slug, admin_id: id }),
    })
    load()
  }

  const roleLabel: Record<Member['role'], string> = { manager: 'управляющий', staff: 'сотрудник' }

  return (
    <div className="panel-card">
      <h2>Команда</h2>
      {error && <div className="panel-error">{error}</div>}
      {!error && members === null && <p className="panel-hint">Загрузка…</p>}
      {!error && members && members.length === 0 && <p className="panel-hint">Пока никого не приглашал(а)</p>}
      {members &&
        members.map((m) => (
          <div className="panel-row" key={m.id}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5 }}>{m.name}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>{roleLabel[m.role]}</div>
            </div>
            <button
              onClick={() => remove(m.id)}
              style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontSize: 12 }}
            >
              удалить
            </button>
          </div>
        ))}
    </div>
  )
}
