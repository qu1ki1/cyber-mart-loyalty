import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import CaseBox from './components/CaseBox'
import Reel, { type Rarity } from './components/Reel'
import RewardResult from './components/RewardResult'
import type { IconKey } from './components/Icon'

import './App.css'

type Screen = 'open' | 'roll' | 'result'

type Business = {
  slug: string
  name: string
  logo_url?: string | null
  primary_color?: string | null
  description?: string | null
}

type SpinResult = {
  already_spun: boolean
  gift_name?: string
  rarity?: Rarity
  icon?: IconKey
  code?: string
  expires_at?: string
  redeemed?: boolean
  error?: string
}

function getBusinessSlug(): string | null {
  const fromQuery = new URLSearchParams(window.location.search).get('biz')
  if (fromQuery) return fromQuery
  // запасной вариант, если мини-апп открыли напрямую по startapp-ссылке
  const startParam = window.Telegram?.WebApp?.initDataUnsafe?.start_param
  return startParam || null
}

async function fetchBusiness(slug: string): Promise<Business | null> {
  const res = await fetch(`/api/business-settings?slug=${encodeURIComponent(slug)}`)
  if (!res.ok) return null
  return res.json()
}

async function fetchStatus(telegramId: number, slug: string): Promise<SpinResult> {
  const res = await fetch(`/api/spin?telegram_id=${telegramId}&slug=${encodeURIComponent(slug)}`)
  return res.json()
}

async function requestSpin(telegramId: number, slug: string, firstName?: string, username?: string): Promise<SpinResult> {
  const res = await fetch('/api/spin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ telegram_id: telegramId, slug, first_name: firstName, username }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Не удалось открыть кейс')
  return data
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('open')
  const [result, setResult] = useState<SpinResult | null>(null)
  const [business, setBusiness] = useState<Business | null>(null)
  const [businessError, setBusinessError] = useState<string | null>(null)
  const [telegramUser, setTelegramUser] = useState<{ id: number; first_name?: string; username?: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const busy = useRef(false)

  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (tg) {
      tg.ready()
      tg.expand()
      const user = tg.initDataUnsafe?.user
      if (user) setTelegramUser({ id: user.id, first_name: user.first_name, username: user.username })
    }

    const slug = getBusinessSlug()
    if (!slug) {
      setBusinessError('Открой это приложение по QR-коду в заведении — так мы поймём, какой бизнес тебе показать.')
      return
    }
    fetchBusiness(slug).then((b) => {
      if (!b) {
        setBusinessError('Бизнес не найден — возможно, ссылка устарела.')
      } else {
        setBusiness(b)
        if (b.primary_color) document.documentElement.style.setProperty('--neon', b.primary_color)
      }
    })
  }, [])

  useEffect(() => {
    if (!telegramUser || !business) return
    fetchStatus(telegramUser.id, business.slug)
      .then((status) => {
        if (status.already_spun) setResult(status)
      })
      .catch(() => {})
  }, [telegramUser, business])

  const alreadySpun = !!result?.already_spun

  async function openCase() {
    if (busy.current || alreadySpun || !telegramUser || !business) return
    busy.current = true
    setError(null)
    setScreen('roll')

    try {
      const spin = await requestSpin(telegramUser.id, business.slug, telegramUser.first_name, telegramUser.username)
      setResult(spin)
    } catch (err) {
      setScreen('open')
      setError(err instanceof Error ? err.message : 'Не удалось открыть кейс')
    } finally {
      busy.current = false
    }
  }

  if (businessError) {
    return (
      <div className="app">
        <div className="bg-grid" />
        <div className="bg-glow" />
        <div className="cyber-card">
          <h1>Хм…</h1>
          <div className="status-pill error">{businessError}</div>
        </div>
      </div>
    )
  }

  if (!business) {
    return (
      <div className="app">
        <div className="bg-grid" />
        <div className="bg-glow" />
      </div>
    )
  }

  return (
    <div className="app">
      <div className="bg-grid" />
      <div className="bg-glow" />

      <header>
        <div>
          <div className="wordmark">
            LOYAL<span>TY</span>
          </div>
          {telegramUser?.first_name && <div className="greeting">Привет, {telegramUser.first_name}</div>}
        </div>
        <div className="biz-pill">{business.name}</div>
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
              <div className="reel-title">ОТКРЫВАЕМ КЕЙС…</div>
              <Reel winner={{ name: result.gift_name!, rarity: result.rarity!, icon: result.icon! }} onDone={() => setScreen('result')} />
            </motion.div>
          )}

          {screen === 'result' && result && (
            <RewardResult
              key="result"
              gift={result.gift_name!}
              code={result.code!}
              rarity={result.rarity!}
              icon={result.icon!}
              expiresAt={result.expires_at}
              redeemed={result.redeemed}
              onClose={() => setScreen('open')}
            />
          )}
        </AnimatePresence>
      </main>

      <footer>{business.name.toUpperCase()} · LOYALTY</footer>
    </div>
  )
}
