import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Icon, type IconKey } from './Icon'
import type { Rarity } from './GameReel'

const TIER_LABEL: Record<Rarity, string> = {
  common: 'Обычный',
  uncommon: 'Необычный',
  rare: 'Редкий',
  epic: 'Эпический',
  legendary: 'Легендарный',
}

function formatExpiry(iso?: string): string {
  if (!iso) return '—'
  return `до ${new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}`
}

type Props = {
  gift: string
  code: string
  rarity: Rarity
  icon: IconKey
  expiresAt?: string
  redeemed?: boolean
  onClose: () => void
}

export default function GameRewardResult({ gift, code, rarity, icon, expiresAt, redeemed, onClose }: Props) {
  useEffect(() => {
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success')
  }, [])

  return (
    <motion.div
      className="cyber-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      style={{ '--tier-color': `var(--r-${rarity})` } as React.CSSProperties}
    >
      <div className="result-kicker">ТВОЙ ПОДАРОК</div>
      <div className="result-rays" />
      <div className="reward-badge">
        <Icon icon={icon} />
      </div>
      <div className="reward-name">{gift}</div>
      <div className="reward-tier">{TIER_LABEL[rarity]}</div>

      <div className="ticket">
        <div className="ticket-row"><span className="label">Код бонуса</span><span className="value">{code}</span></div>
        <div className="ticket-row"><span className="label">Действует</span><span className="value">{formatExpiry(expiresAt)}</span></div>
        <div className="ticket-row"><span className="label">Статус</span><span className="value">{redeemed ? 'Погашено' : 'Активен'}</span></div>
      </div>

      <p className="reward-hint">Покажи этот экран администратору, чтобы забрать подарок</p>
      <button className="cta" onClick={onClose}>Готово</button>
    </motion.div>
  )
}
