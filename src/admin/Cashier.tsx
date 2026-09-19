import { useState } from 'react'
import { ADMIN_PASSWORD_KEY } from './AdminGate'

function getAdminPassword(): string {
  return sessionStorage.getItem(ADMIN_PASSWORD_KEY) || ''
}

export default function Cashier() {
  return (
    <div className="cashier-page">
      <h1>Касса</h1>
      <p className="cashier-sub">Погашение кода и выдача бонусных попыток гостям</p>

      <RedeemCard />
      <GrantAttemptCard />

      <style>{`
        .cashier-page h1{
          font-family:Rajdhani;
          font-size:26px;
          font-weight:700;
          margin-bottom:4px;
        }
        .cashier-sub{ color:var(--muted); font-size:13px; margin-bottom:20px; }
        .cashier-card{
          background: rgba(255,255,255,.03);
          border: 1px solid var(--line);
          border-radius:18px;
          padding:20px;
          margin-bottom:16px;
        }
        .cashier-card h2{ font-family:Rajdhani; font-size:18px; margin-bottom:4px; }
        .cashier-hint{ color:var(--muted); font-size:13px; margin-bottom:14px; }
        .cashier-form{ display:flex; flex-direction:column; gap:10px; }
        .cashier-form.row{ flex-direction:row; }
        .cashier-input{
          padding:12px 14px;
          border-radius:12px;
          border:1px solid var(--line);
          background: rgba(0,0,0,.25);
          color:#eef7f0;
          font-family:Rajdhani;
          font-size:15px;
          flex:1;
        }
        .cashier-btn{
          border:none;
          cursor:pointer;
          padding:12px 20px;
          border-radius:12px;
          font-family:Rajdhani;
          font-size:15px;
          font-weight:700;
          color:#04140a;
          background: linear-gradient(100deg, #21c85f, var(--neon) 60%);
        }
        .cashier-btn:disabled{ opacity:.5; cursor:not-allowed; }
        .cashier-result{ margin-top:12px; font-size:14px; color: var(--neon); }
        .cashier-error{ margin-top:12px; font-size:14px; color:#ff6b6b; }
      `}</style>
    </div>
  )
}

function RedeemCard() {
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ gift_name: string; guest_name: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return
    setBusy(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), password: getAdminPassword() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Не удалось погасить код')
      setResult(data)
      setCode('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось погасить код')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="cashier-card">
      <h2>Погасить код гостя</h2>
      <p className="cashier-hint">Попроси показать экран с кодом и введи его сюда.</p>
      <form onSubmit={handleSubmit} className="cashier-form row">
        <input
          className="cashier-input"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Например, CM30-4821"
          autoCapitalize="characters"
        />
        <button className="cashier-btn" type="submit" disabled={busy}>
          {busy ? '…' : 'Погасить'}
        </button>
      </form>

      {result && (
        <div className="cashier-result">
          <strong>{result.gift_name}</strong> — гость: {result.guest_name}
        </div>
      )}
      {error && <div className="cashier-error">{error}</div>}
    </div>
  )
}

function GrantAttemptCard() {
  const [username, setUsername] = useState('')
  const [count, setCount] = useState(1)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ guest_name: string; granted: number; total_bonus_attempts: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!username.trim()) return
    setBusy(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/grant-attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), count, password: getAdminPassword() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Не удалось выдать попытку')
      setResult(data)
      setUsername('')
      setCount(1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось выдать попытку')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="cashier-card">
      <h2>Выдать попытку</h2>
      <p className="cashier-hint">
        Работает только если гость хотя бы раз открывал мини-апп и у него задан username в Telegram.
      </p>
      <form onSubmit={handleSubmit} className="cashier-form">
        <input
          className="cashier-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="username гостя, например nickname (без @)"
        />
        <input
          className="cashier-input"
          type="number"
          min={1}
          value={count}
          onChange={(e) => setCount(Math.max(1, Number(e.target.value)))}
          placeholder="Количество попыток"
        />
        <button className="cashier-btn" type="submit" disabled={busy}>
          {busy ? '…' : 'Выдать попытку'}
        </button>
      </form>

      {result && (
        <div className="cashier-result">
          {result.guest_name} получил(а) +{result.granted} — всего бонусных попыток: {result.total_bonus_attempts}
        </div>
      )}
      {error && <div className="cashier-error">{error}</div>}
    </div>
  )
}
