import { useEffect, useState } from 'react'

type Props = { telegramId: number; slug: string }
type Stats = { total_spins_today: number; redeemed_today: number }

export default function StatsTab({ telegramId, slug }: Props) {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch(`/api/stats?telegram_id=${telegramId}&slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => {})
  }, [telegramId, slug])

  if (!stats) return <div className="panel-card">Загрузка…</div>

  return (
    <div className="panel-card">
      <h2>Сегодня</h2>
      <div className="panel-stat-row">
        <div className="panel-stat">
          <div className="panel-stat-value">{stats.total_spins_today}</div>
          <div className="panel-stat-label">Открытий кейса</div>
        </div>
        <div className="panel-stat">
          <div className="panel-stat-value">{stats.redeemed_today}</div>
          <div className="panel-stat-label">Погашено</div>
        </div>
      </div>
    </div>
  )
}
