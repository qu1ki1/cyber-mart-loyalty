import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import CaseBox from './components/CaseBox'
import Reel, { type Rarity } from './components/Reel'
import RewardResult from './components/RewardResult'
import type { IconKey } from './components/Icon'
import { applyTheme } from './themes'
import AdminPanel from './adminpanel/AdminPanel'
import RegisterInApp from './adminpanel/RegisterInApp'

import './App.css'

type Screen = 'open' | 'roll' | 'result'
type Role = 'owner' | 'manager' | 'staff'
type Mode = 'game' | 'panel' | 'register'

type Business = {
  id: number
  slug: string
  name: string
  logo_url?: string | null
  primary_color?: string | null
  design_theme?: string | null
  description?: string | null
}

type MyContext = {
  business: Business | null
  role: Role | null
  my_businesses: (Business & { role: Role })[]
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

const BOT_USERNAME = import.meta.env.VITE_BOT_USERNAME || ''

function getBusinessSlug(): string | null {
  return new URLSearchParams(window.location.search).get('biz')
}

async function fetchContext(telegramId: number, slug: string | null): Promise<MyContext | null> {
  const params = new URLSearchParams({ telegram_id: String(telegramId) })
  if (slug) params.set('slug', slug)
  const res = await fetch(`/api/my-context?${params.toString()}`)
  if (!res.ok) return null
  return res.json()
}

async function fetchStatus(telegramId: number, slug: string): Promise<SpinResult> {
  const res = await fetch(`/api/spin?telegram_id=${telegramId}&slug=${encodeURIComponent(slug)}`)
  return res.json()
}

async function requestSpin(telegramId: number, slug: string, firstName?: string, username?: string, ref?: string | null): Promise<SpinResult> {
  const res = await fetch('/api/spin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ telegram_id: telegramId, slug, first_name: firstName, username, ref }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Не удалось открыть кейс')
  return data
}

function shareReferral(telegramId: number, slug: string) {
  if (!BOT_USERNAME) return
  const deepLink = `https://t.me/${BOT_USERNAME}?start=${slug}-ref-${telegramId}`
  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(deepLink)}&text=${encodeURIComponent('Забери свой подарок 🎁')}`
  const tg = window.Telegram?.WebApp
  if (tg && (tg as unknown as { openTelegramLink?: (url: string) => void }).openTelegramLink) {
    ;(tg as unknown as { openTelegramLink: (url: string) => void }).openTelegramLink(shareUrl)
  } else {
    window.open(shareUrl, '_blank')
  }
}

export default function App() {
  const [telegramUser, setTelegramUser] = useState<{ id: number; first_name?: string; username?: string } | null>(null)
  const [context, setContext] = useState<MyContext | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [mode, setMode] = useState<Mode>('game')
  const [screen, setScreen] = useState<Screen>('open')
  const [result, setResult] = useState<SpinResult | null>(null)
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
  }, [])

  useEffect(() => {
    if (!telegramUser) return
    const slug = getBusinessSlug()
    fetchContext(telegramUser.id, slug).then((ctx) => {
      if (!ctx) {
        setLoadError('Не удалось загрузить приложение. Проверь соединение и попробуй ещё раз.')
        return
      }
      setContext(ctx)

      const resolved = ctx.business || ctx.my_businesses[0] || null
      if (resolved) applyTheme(resolved.design_theme, resolved.primary_color)

      // Если ссылка привела к конкретному бизнесу — по умолчанию игра.
      // Если открыли бота "просто так" и это владелец/сотрудник — сразу панель.
      if (!ctx.business && ctx.my_businesses.length > 0) setMode('panel')
    })
  }, [telegramUser])

  const activeBusiness: (Business & { role?: Role | null }) | null =
    context?.business || context?.my_businesses[0] || null
  const activeRole: Role | null = context?.business ? context.role : context?.my_businesses[0]?.role || null

  useEffect(() => {
    if (!telegramUser || !activeBusiness) return
    fetchStatus(telegramUser.id, activeBusiness.slug)
      .then((status) => {
        if (status.already_spun) setResult(status)
      })
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [telegramUser, activeBusiness?.slug])

  const alreadySpun = !!result?.already_spun

  async function openCase() {
    if (busy.current || alreadySpun || !telegramUser || !activeBusiness) return
    busy.current = true
    setError(null)
    setScreen('roll')

    try {
      const ref = new URLSearchParams(window.location.search).get('ref')
      const spin = await requestSpin(telegramUser.id, activeBusiness.slug, telegramUser.first_name, telegramUser.username, ref)
      setResult(spin)
    } catch (err) {
      setScreen('open')
      setError(err instanceof Error ? err.message : 'Не удалось открыть кейс')
    } finally {
      busy.current = false
    }
  }

  function handleBusinessCreated(slug: string) {
    if (!telegramUser) return
    fetchContext(telegramUser.id, slug).then((ctx) => {
      if (ctx) {
        setContext(ctx)
        setMode('panel')
      }
    })
  }

  // ---------- экраны загрузки/ошибок ----------
  if (loadError) {
    return (
      <div className="app">
        <div className="bg-grid" />
        <div className="bg-glow" />
        <div className="cyber-card">
          <h1>Хм…</h1>
          <div className="status-pill error">{loadError}</div>
        </div>
      </div>
    )
  }

  if (!telegramUser || !context) {
    return (
      <div className="app">
        <div className="bg-grid" />
        <div className="bg-glow" />
      </div>
    )
  }

  // ---------- нет бизнеса вообще — предлагаем создать прямо тут ----------
  if (!activeBusiness) {
    return (
      <div className="app">
        <div className="bg-grid" />
        <div className="bg-glow" />
        <RegisterInApp telegramId={telegramUser.id} onCreated={handleBusinessCreated} />
      </div>
    )
  }

  const isAdmin = !!activeRole

  return (
    <div className="app">
      <div className="bg-grid" />
      <div className="bg-glow" />

      <header>
        <div>
          <div className="wordmark">
            LOYAL<span>TY</span>
          </div>
          {telegramUser.first_name && <div className="greeting">Привет, {telegramUser.first_name}</div>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="biz-pill">{activeBusiness.name}</div>
          <button className="gear-btn" onClick={() => setMode('register')} aria-label="Зарегистрировать бизнес" title="Зарегистрировать новый бизнес">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          {isAdmin && (
            <button className="gear-btn" onClick={() => setMode(mode === 'game' ? 'panel' : 'game')} aria-label="Переключить режим">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <path
                  d="M19.4 13a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V19a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H4a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H10a1.65 1.65 0 001-1.51V4a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V10a1.65 1.65 0 001.51 1H20a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
              </svg>
            </button>
          )}
        </div>
      </header>

      {mode === 'register' ? (
        <RegisterInApp
          telegramId={telegramUser.id}
          onCreated={(slug) => {
            handleBusinessCreated(slug)
          }}
        />
      ) : mode === 'panel' && isAdmin ? (
        <AdminPanel telegramId={telegramUser.id} slug={activeBusiness.slug} role={activeRole!} botUsername={BOT_USERNAME} />
      ) : (
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
                    <button className="cta" onClick={openCase}>
                      Открыть кейс
                    </button>
                    {error && <div className="status-pill error">{error}</div>}
                    {BOT_USERNAME && (
                      <button className="ghost" onClick={() => shareReferral(telegramUser.id, activeBusiness.slug)}>
                        Пригласить друга (+1 попытка тебе)
                      </button>
                    )}
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
      )}

      <footer>{activeBusiness.name.toUpperCase()} · LOYALTY</footer>
    </div>
  )
}
