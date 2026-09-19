import { useEffect, useRef, useState } from 'react'
import { Icon, type IconKey } from './Icon'

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export type ReelPrize = {
  name: string
  rarity: Rarity
  icon: IconKey
}

// Only used to fill out the strip visually — the real prize (passed in as
// `winner`) is what the reel actually lands on.
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
  return Array.from({ length: TRACK_LENGTH }, (_, i) => (i === TARGET_INDEX ? winner : FILLERS[Math.floor(Math.random() * FILLERS.length)]))
}

export default function Reel({ winner, onDone }: { winner: ReelPrize; onDone: () => void }) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [items] = useState(() => buildTrack(winner))
  const [x, setX] = useState(0)

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const width = viewport.clientWidth
    const itemCenter = TARGET_INDEX * STEP + ITEM_WIDTH / 2 + TRACK_PADDING
    const jitter = (Math.random() - 0.5) * (ITEM_WIDTH * 0.5)
    const target = -(itemCenter - width / 2) + jitter

    const raf = requestAnimationFrame(() => setX(target))
    const timeout = setTimeout(onDone, 3700)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(timeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="reel-viewport" ref={viewportRef}>
      <div className="reel-marker" />
      <div className="reel-track" style={{ transform: `translateX(${x}px)` }}>
        {items.map((item, i) => (
          <div
            key={i}
            className={`reel-item ${i === TARGET_INDEX ? 'won' : ''}`}
            style={{ '--tier-color': `var(--r-${item.rarity})` } as React.CSSProperties}
          >
            <Icon icon={item.icon} />
          </div>
        ))}
      </div>
    </div>
  )
}
