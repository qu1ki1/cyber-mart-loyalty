import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import CaseBox from './components/CaseBox'
import Reel, { type Rarity } from './components/Reel'
import RewardResult from './components/RewardResult'

import './App.css'

type Screen = 'open' | 'roll' | 'result'

type SpinResult = {
  already_spun: boolean
  gift_name?: string
  rarity?: Rarity
  code?: string
  redeemed?: boolean
  error?: string
}

async function fetchStatus(telegramId: number): Promise<SpinResult> {
  const res = await fetch(`/api/spin?telegram_id=${telegramId}`)
  return res.json()
}

async function requestSpin(telegramId: number, firstName?: string, username?: string): Promise<SpinResult> {
  const res = await fetch('/api/spin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ telegram_id: telegramId, first_name: firstName, username }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Не удалось открыть кейс')
  return data
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('open')
  const [result, setResult] = useState<SpinResult | null>(null)
  const [telegramUser, setTelegramUser] = useState<{ id: number; first_name?: string; username?: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const busy = useRef(false)

  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (!tg) return

    tg.ready()
    tg.expand()

    const user = tg.initDataUnsafe?.user
    if (user) {
      setTelegramUser({ id: user.id, first_name: user.first_name, username: user.username })
    }
  }, [])

  useEffect(() => {
    if (!telegramUser) return
    fetchStatus(telegramUser.id)
      .then((status) => {
        if (status.already_spun) setResult(status)
      })
      .catch(() => {
        // Offline or the function isn't deployed yet — let the user still try to spin.
      })
  }, [telegramUser])

  const alreadySpun = !!result?.already_spun

  async function openCase() {
    if (busy.current || alreadySpun || !telegramUser) return
    busy.current = true
    setError(null)
    setScreen('roll')

    try {
      const spin = await requestSpin(telegramUser.id, telegramUser.first_name, telegramUser.username)
      // Reel component calls onDone() once the landing animation finishes;
      // the actual screen transition happens there so the reveal feels earned.
      setResult(spin)
    } catch (err) {
      setScreen('open')
      setError(err instanceof Error ? err.message : 'Не удалось открыть кейс')
    } finally {
      busy.current = false
    }
  }

  return (
    <div className="app">
      <div className="bg-grid" />
      <div className="bg-glow" />

      <header>
        <div>
          <div className="wordmark">
            CYBER<span>MART</span>
          </div>
          {telegramUser?.first_name && <div className="greeting">Привет, {telegramUser.first_name}</div>}
        </div>
        <div className="biz-pill">LOYALTY</div>
      </header>

      <main>
        <AnimatePresence mode="wait">
          {screen === 'open' && (
            <motion.div key="open" className="cyber-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <CaseBox opening={false} />
              <h1>Твой подарок за визит</h1>

              {alreadySpun ? (
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
                  <button className="cta" onClick={openCase} disabled={!telegramUser}>
                    Открыть кейс
                  </button>
                  {error && <div className="status-pill error">{error}</div>}
                </>
              )}
            </motion.div>
          )}

          {screen === 'roll' && result && (
            <motion.div key="roll" className="cyber-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h1>Открываем…</h1>
              <CaseBox opening={true} />
              <Reel winner={{ name: result.gift_name!, rarity: result.rarity! }} onDone={() => setScreen('result')} />
            </motion.div>
          )}

          {screen === 'result' && result && (
            <RewardResult
              key="result"
              gift={result.gift_name!}
              code={result.code!}
              rarity={result.rarity!}
              redeemed={result.redeemed}
              onClose={() => setScreen('open')}
            />
          )}
        </AnimatePresence>
      </main>

      <footer>CYBER MART LOYALTY</footer>
    </div>
  )
}
