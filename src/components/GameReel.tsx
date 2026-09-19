import { useLayoutEffect, useRef, useState } from 'react'
import { Icon, type IconKey } from './Icon'

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export type ReelPrize = {
  name: string
  rarity: Rarity
  icon: IconKey
}

const FILLERS: ReelPrize[] = [
  { name: '+30 минут игры', rarity: 'common', icon: 'clock' },
  { name: '+1 час игры', rarity: 'uncommon', icon: 'clockBig' },
  { name: 'Бесплатный напиток', rarity: 'rare', icon: 'cup' },
  { name: 'Скидка 10%', rarity: 'epic', icon: 'percent' },
  { name: 'Джекпот', rarity: 'legendary', icon: 'star' },
]

const ITEM_WIDTH = 88
const GAP = 12
const STEP = ITEM_WIDTH + GAP
const TRACK_LENGTH = 40
const TARGET_INDEX = 32
const TRACK_PADDING = 12

function buildTrack(winner: ReelPrize): ReelPrize[] {
  return Array.from({ length: TRACK_LENGTH }, (_, index) => (
    index === TARGET_INDEX ? winner : FILLERS[Math.floor(Math.random() * FILLERS.length)]
  ))
}

export default function GameReel({ winner, onDone }: { winner: ReelPrize; onDone: () => void }) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [items] = useState(() => buildTrack(winner))
  const [x, setX] = useState(0)
  const [finished, setFinished] = useState(false)

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const itemCenter = TARGET_INDEX * STEP + ITEM_WIDTH / 2 + TRACK_PADDING
    const jitter = (Math.random() - 0.5) * (ITEM_WIDTH * 0.32)
    const target = -(itemCenter - viewport.clientWidth / 2) + jitter
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const duration = reduceMotion ? 250 : 3650

    let secondFrame = 0
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => setX(target))
    })

    const finishTimeout = window.setTimeout(() => {
      setFinished(true)
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success')
    }, duration)
    const doneTimeout = window.setTimeout(onDone, duration + 650)

    return () => {
      cancelAnimationFrame(firstFrame)
      cancelAnimationFrame(secondFrame)
      window.clearTimeout(finishTimeout)
      window.clearTimeout(doneTimeout)
    }
    // The reel is remounted with the prize code as its key for each attempt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="reel-viewport" ref={viewportRef}>
      <div className="reel-marker" />
      <div className="reel-track game-reel-track" style={{ transform: `translateX(${x}px)` }}>
        {items.map((item, index) => (
          <div
            key={index}
            className={`reel-item ${index === TARGET_INDEX && finished ? 'won' : ''}`}
            style={{ '--tier-color': `var(--r-${item.rarity})` } as React.CSSProperties}
            aria-label={index === TARGET_INDEX ? item.name : undefined}
          >
            <Icon icon={item.icon} />
          </div>
        ))}
      </div>
    </div>
  )
}
