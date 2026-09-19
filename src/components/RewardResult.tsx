import { useEffect } from 'react'
import { motion } from 'framer-motion'
import type { Rarity } from './Reel'

const TIER_LABEL: Record<Rarity, string> = {
  common: 'Обычный',
  uncommon: 'Необычный',
  rare: 'Редкий',
  epic: 'Эпический',
  legendary: 'Легендарный',
}

type Props = {
  gift: string
  code: string
  rarity: Rarity
  redeemed?: boolean
  onClose: () => void
}

export default function RewardResult({ gift, code, rarity, redeemed, onClose }: Props) {
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
      <div className="reward-badge">🎁</div>
      <div className="reward-name">{gift}</div>
      <div className="reward-tier">{TIER_LABEL[rarity]}</div>

      <div className="ticket">
        <div className="ticket-row">
          <span className="label">Код бонуса</span>
          <span className="value">{code}</span>
        </div>
        <div className="ticket-row">
          <span className="label">Статус</span>
          <span className="value">{redeemed ? 'Погашено' : 'Активен'}</span>
        </div>
      </div>

      <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 20 }}>Покажи этот экран администратору</p>

      <button className="cta" onClick={onClose}>
        На главную
      </button>
    </motion.div>
  )
}
