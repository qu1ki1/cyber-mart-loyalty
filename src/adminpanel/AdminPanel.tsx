import { useState } from 'react'
import CashierTab from './CashierTab'
import PrizesTab from './PrizesTab'
import BrandTab from './BrandTab'
import StatsTab from './StatsTab'
import TeamTab from './TeamTab'

type Role = 'owner' | 'manager' | 'staff'
type Tab = 'cashier' | 'prizes' | 'brand' | 'stats' | 'team'

type Props = {
  telegramId: number
  slug: string
  role: Role
  botUsername: string
  onBrandSaved?: () => void
}

const TABS_BY_ROLE: Record<Role, { key: Tab; label: string }[]> = {
  staff: [{ key: 'cashier', label: 'Касса' }],
  manager: [
    { key: 'cashier', label: 'Касса' },
    { key: 'stats', label: 'Статистика' },
  ],
  owner: [
    { key: 'cashier', label: 'Касса' },
    { key: 'prizes', label: 'Призы' },
    { key: 'brand', label: 'Бренд' },
    { key: 'stats', label: 'Статистика' },
    { key: 'team', label: 'Команда' },
  ],
}

export default function AdminPanel({ telegramId, slug, role, botUsername, onBrandSaved }: Props) {
  const tabs = TABS_BY_ROLE[role]
  const [active, setActive] = useState<Tab>(tabs[0].key)

  return (
    <div className="panel">
      <div className="panel-tabs">
        {tabs.map((t) => (
          <button key={t.key} className={active === t.key ? 'active' : ''} onClick={() => setActive(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {active === 'cashier' && <CashierTab telegramId={telegramId} slug={slug} role={role} />}
      {active === 'prizes' && role === 'owner' && <PrizesTab telegramId={telegramId} slug={slug} />}
      {active === 'brand' && role === 'owner' && <BrandTab telegramId={telegramId} slug={slug} onSaved={onBrandSaved} />}
      {active === 'stats' && role !== 'staff' && <StatsTab telegramId={telegramId} slug={slug} />}
      {active === 'team' && role === 'owner' && <TeamTab telegramId={telegramId} slug={slug} botUsername={botUsername} />}
    </div>
  )
}
