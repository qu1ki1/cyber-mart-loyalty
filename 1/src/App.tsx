import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import './App.css'

type IconKey = 'clock' | 'clockBig' | 'cup' | 'percent' | 'star'

type Reward = {
  id: string
  name: string
  weight: number
  icon: IconKey
  prefix: string
}

const REWARDS: Reward[] = [
  { id: 'r30', name: '+30 минут игры', weight: 40, icon: 'clock', prefix: 'CM30' },
  { id: 'r60', name: '+1 час игры', weight: 20, icon: 'clockBig', prefix: 'CM60' },
  { id: 'drink', name: 'Бесплатный напиток', weight: 20, icon: 'cup', prefix: 'CMDR' },
  { id: 'discount', name: 'Скидка 10%', weight: 15, icon: 'percent', prefix: 'CMDS' },
  { id: 'jackpot', name: 'Джекпот: 3 часа игры', weight: 5, icon: 'star', prefix: 'CMJP' },
]

type WinEntry = {
  rewardId: string
  code: string
  shown: boolean
  ts: number
}

function pickReward(): Reward {
  const total = REWARDS.reduce((s, r) => s + r.weight, 0)
  let x = Math.random() * total
  for (const r of REWARDS) {
    if (x < r.weight) return r
    x -= r.weight
  }
  return REWARDS[0]
}

function genCode(prefix: string) {
  return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`
}

// NOTE: this is a client-side stand-in for the demo only.
// In production the "1 attempt per day" check must happen on the
// backend, keyed by telegram_id + server date, not localStorage.
function todayKey() {
  const d = new Date()
  return `loyaltyDemo_${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

function loadToday(): WinEntry | null {
  try {
    const raw = localStorage.getItem(todayKey())
    return raw ? (JSON.parse(raw) as WinEntry) : null
  } catch {
    return null
  }
}

function saveToday(entry: WinEntry) {
  try {
    localStorage.setItem(todayKey(), JSON.stringify(entry))
  } catch {
    /* ignore */
  }
}

function Icon({ icon, className }: { icon: IconKey; className?: string }) {
  switch (icon) {
    case 'clock':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M12 21a9 9 0 100-18 9 9 0 000 18z" stroke="currentColor" strokeWidth={1.6} />
          <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
        </svg>
      )
    case 'clockBig':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M12 21a9 9 0 100-18 9 9 0 000 18z" stroke="currentColor" strokeWidth={1.6} />
          <path d="M12 6.5v5.5l4 2.5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
        </svg>
      )
    case 'cup':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M7 4h10l-1.7 13.6a3 3 0 01-3 2.4h-.6a3 3 0 01-3-2.4L7 4z"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinejoin="round"
          />
          <path d="M8.5 9.5c1.2 1 2.3 1.4 3.5 1.4s2.3-.4 3.5-1.4" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" />
        </svg>
      )
    case 'percent':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="7.5" cy="7.5" r="2.2" stroke="currentColor" strokeWidth={1.6} />
          <circle cx="16.5" cy="16.5" r="2.2" stroke="currentColor" strokeWidth={1.6} />
          <path d="M17 6L6 18" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
        </svg>
      )
    case 'star':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M12 2.5l2.6 6.1 6.4.6-4.9 4.3 1.5 6.3L12 16.6 6.4 19.8l1.5-6.3-4.9-4.3 6.4-.6L12 2.5z"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
        </svg>
      )
  }
}

export default function App() {
  const [screen, setScreen] = useState<'idle' | 'result'>('idle')
  const [crateState, setCrateState] = useState<'idle' | 'shake' | 'open'>('idle')
  const [cycling, setCycling] = useState(false)
  const [entry, setEntry] = useState<WinEntry | null>(null)
  const [previewIcon, setPreviewIcon] = useState<IconKey>('clock')
  const [previewName, setPreviewName] = useState('')
  const busyRef = useRef(false)

  useEffect(() => {
    const existing = loadToday()
    if (existing) setEntry(existing)
  }, [])

  const alreadyUsed = !!entry
  const currentReward = entry ? REWARDS.find((r) => r.id === entry.rewardId) ?? REWARDS[0] : null

  function openCase() {
    if (alreadyUsed || busyRef.current) return
    busyRef.current = true
    setCrateState('shake')

    setTimeout(() => {
      setCrateState('open')

      setTimeout(() => {
        const reward = pickReward()
        const code = genCode(reward.prefix)
        const newEntry: WinEntry = { rewardId: reward.id, code, shown: false, ts: Date.now() }

        setScreen('result')
        setCycling(true)

        let ticks = 0
        const interval = setInterval(() => {
          const r = REWARDS[ticks % REWARDS.length]
          setPreviewIcon(r.icon)
          setPreviewName(r.name)
          ticks++
          if (ticks > 9) {
            clearInterval(interval)
            setCycling(false)
            setEntry(newEntry)
            saveToday(newEntry)
            busyRef.current = false
          }
        }, 90)
      }, 520)
    }, 420)
  }

  function markShown() {
    if (!entry || entry.shown) return
    const updated = { ...entry, shown: true }
    setEntry(updated)
    saveToday(updated)
  }

  function backToIdle() {
    setCrateState('idle')
    setScreen('idle')
  }

  return (
    <div className="app">
      <div className="bg-grid" />
      <div className="bg-glow" />

      <header>
        <div className="wordmark">
          LOYAL<span>TY</span>
        </div>
        <div className="biz-pill">CYBER MART</div>
      </header>

      <main>
        <AnimatePresence mode="wait">
          {screen === 'idle' && (
            <motion.section
              key="idle"
              className="screen"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <div className="crate-stage">
                <div className={`crate ${crateState}`}>
                  <div className="crate-burst" />
                  <div className="crate-lid" />
                  <div className="crate-body">
                    <svg className="crate-mark" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" />
                      <path d="M12 2V22M3 7L12 12L21 7" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>

              <h1>Твой подарок за визит</h1>

              {alreadyUsed ? (
                <>
                  <div className="status-pill">Попытка использована — приходи завтра</div>
                  <button className="cta" disabled>
                    Уже использовано
                  </button>
                  <button className="ghost" onClick={() => setScreen('result')}>
                    Посмотреть мой подарок
                  </button>
                </>
              ) : (
                <>
                  <div className="status-pill ready">Попытка на сегодня доступна</div>
                  <button className="cta" onClick={openCase}>
                    Открыть кейс
                  </button>
                </>
              )}
            </motion.section>
          )}

          {screen === 'result' && (
            <motion.section
              key="result"
              className="screen"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <div className={`reward-badge ${cycling ? 'cycling' : ''}`}>
                <Icon icon={entry && !cycling ? currentReward!.icon : previewIcon} />
              </div>
              <div className="reward-name">{entry && !cycling ? currentReward!.name : previewName}</div>
              <div className="reward-sub">Выпало из кейса</div>

              <div className="ticket">
                <div className="ticket-row">
                  <span className="label">Код бонуса</span>
                  <span className="value">{cycling ? '—' : entry?.code ?? '—'}</span>
                </div>
                <div className="ticket-row">
                  <span className="label">Действует</span>
                  <span className="value">24 часа</span>
                </div>
              </div>

              <button
                className={`cta ${entry?.shown ? 'done' : ''}`}
                onClick={markShown}
                disabled={!entry || entry.shown || cycling}
              >
                {entry?.shown ? 'Показано ✓' : 'Показать администратору'}
              </button>
              <button className="ghost" onClick={backToIdle}>
                На главную
              </button>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <footer>CYBER MART LOYALTY</footer>
    </div>
  )
}
