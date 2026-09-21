import { useState } from 'react'
import CashierTab from './CashierTab'
import PrizesTab from './PrizesTab'
import BrandTab from './BrandTab'
import StatsTab from './StatsTab'
import TeamTab from './TeamTab'
import HistoryTab from './HistoryTab'

type Role = 'owner' | 'manager' | 'staff'
type Tab = 'cashier' | 'prizes' | 'brand' | 'stats' | 'team' | 'history'

type Props = {
  telegramId: number
  slug: string
  role: Role
  botUsername: string
  onBrandSaved?: () => void
}

const TABS_BY_ROLE: Record<Role, { key: Tab; label: string }[]> = {
  staff: [{ key: 'cashier', label: 'Админ' }],
  manager: [
    { key: 'cashier', label: 'Админ' },
    { key: 'stats', label: 'Статистика' },
  ],
  owner: [
    { key: 'cashier', label: 'Админ' },
    { key: 'prizes', label: 'Призы' },
    { key: 'brand', label: 'Дизайн' },
    { key: 'stats', label: 'Статистика' },
    { key: 'history', label: 'История' },
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
      {active === 'history' && role === 'owner' && <HistoryTab slug={slug} />}
      {active === 'team' && role === 'owner' && <TeamTab telegramId={telegramId} slug={slug} botUsername={botUsername} />}
    </div>
  )
}
