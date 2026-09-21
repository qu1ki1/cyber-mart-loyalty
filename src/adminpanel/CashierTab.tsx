import { useState } from 'react'
import { getInitData } from '../telegramAuth'

type Props = { telegramId: number; slug: string; role: 'owner' | 'manager' | 'staff' }

export default function CashierTab({ telegramId, slug, role }: Props) {
  return (
    <div>
      <RedeemCard telegramId={telegramId} slug={slug} />
      {role !== 'staff' && <GrantCard telegramId={telegramId} slug={slug} />}
    </div>
  )
}

function RedeemCard({ telegramId, slug }: { telegramId: number; slug: string }) {
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
        body: JSON.stringify({ init_data: getInitData(), code: code.trim(), slug, telegram_id: telegramId }),
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
    <div className="panel-card">
      <h2>Погасить код гостя</h2>
      <p className="panel-hint">Попроси показать экран с кодом и введи его сюда.</p>
      <form onSubmit={handleSubmit} className="panel-form row">
        <input
          className="panel-input"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Например, CM30-4821"
          autoCapitalize="characters"
        />
        <button className="panel-btn" type="submit" disabled={busy}>
          {busy ? '…' : 'Погасить'}
        </button>
      </form>
      {result && (
        <div className="panel-result">
          <strong>{result.gift_name}</strong> — гость: {result.guest_name}
        </div>
      )}
      {error && <div className="panel-error">{error}</div>}
    </div>
  )
}

function GrantCard({ telegramId, slug }: { telegramId: number; slug: string }) {
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
        body: JSON.stringify({ init_data: getInitData(), username: username.trim(), count, slug, telegram_id: telegramId }),
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
    <div className="panel-card">
      <h2>Выдать попытку</h2>
      <p className="panel-hint">Работает, если гость хотя бы раз открывал приложение и у него задан username.</p>
      <form onSubmit={handleSubmit} className="panel-form">
        <input className="panel-input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username гостя (без @)" />
        <input
          className="panel-input"
          type="number"
          min={1}
          value={count}
          onChange={(e) => setCount(Math.max(1, Number(e.target.value)))}
        />
        <button className="panel-btn" type="submit" disabled={busy}>
          {busy ? '…' : 'Выдать попытку'}
        </button>
      </form>
      {result && (
        <div className="panel-result">
          {result.guest_name} получил(а) +{result.granted} (всего бонусных: {result.total_bonus_attempts})
        </div>
      )}
      {error && <div className="panel-error">{error}</div>}
    </div>
  )
}
