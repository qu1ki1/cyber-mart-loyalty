import { useEffect, useState } from 'react'
import { authQueryString } from '../auth'

type Props = { telegramId: number; slug: string }
type Period = 'day' | 'week' | 'month'
type Stats = {
  total_spins: number
  redeemed: number
  unique_guests: number
  redeem_rate: number
  breakdown: { name: string; count: number }[]
}

const LABELS: Record<Period, string> = { day: 'День', week: 'Неделя', month: 'Месяц' }
const TITLES: Record<Period, string> = { day: 'Сегодня', week: 'За неделю', month: 'За месяц' }

export default function StatsTab({ telegramId, slug }: Props) {
  const [period, setPeriod] = useState<Period>('day')
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    setStats(null)
    fetch(`/api/reports?type=stats&${authQueryString()}&slug=${encodeURIComponent(slug)}&period=${period}`)
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => {})
  }, [telegramId, slug, period])

  return (
    <div className="panel-card">
      <div className="mode-switch" style={{ margin: '0 auto 16px', width: 'fit-content' }}>
        {(['day', 'week', 'month'] as Period[]).map((p) => (
          <button key={p} className={period === p ? 'active' : ''} onClick={() => setPeriod(p)}>
            {LABELS[p]}
          </button>
        ))}
      </div>

      {!stats ? (
        <p className="panel-hint">Загрузка…</p>
      ) : (
        <>
          <h2>{TITLES[period]}</h2>
          <div className="panel-stat-row">
            <div className="panel-stat">
              <div className="panel-stat-value">{stats.total_spins}</div>
              <div className="panel-stat-label">Открытий кейса</div>
            </div>
            <div className="panel-stat">
              <div className="panel-stat-value">{stats.redeemed}</div>
              <div className="panel-stat-label">Погашено</div>
            </div>
          </div>
          <div className="panel-stat-row" style={{ marginTop: 10 }}>
            <div className="panel-stat">
              <div className="panel-stat-value">{stats.unique_guests}</div>
              <div className="panel-stat-label">Уникальных гостей</div>
            </div>
            <div className="panel-stat">
              <div className="panel-stat-value">{stats.redeem_rate}%</div>
              <div className="panel-stat-label">% погашения</div>
            </div>
          </div>

          <h3 style={{ fontSize: 13, color: 'var(--muted)', margin: '18px 0 10px', textAlign: 'center' }}>По призам</h3>
          {stats.breakdown.length === 0 && <p className="panel-hint">Пока пусто</p>}
          {stats.breakdown.map((b) => (
            <div className="panel-row" key={b.name}>
              <span>{b.name}</span>
              <span style={{ color: 'var(--neon)', fontWeight: 600 }}>{b.count}</span>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
