import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import CaseBox from './components/CaseBox'
import Reel, { type Rarity } from './components/Reel'
import RewardResult from './components/RewardResult'
import type { IconKey } from './components/Icon'
import { applyTheme } from './themes'
import { getInitData } from './telegramAuth'
import AdminPanel from './adminpanel/AdminPanel'
import RegisterInApp from './adminpanel/RegisterInApp'
import OnboardingChecklist from './adminpanel/OnboardingChecklist'
import MyCodes from './components/MyCodes'
import BusinessLogin from './pages/BusinessLogin'

import './App.css'

type Screen = 'open' | 'roll' | 'result' | 'codes'
type Role = 'owner' | 'manager' | 'staff'
type Mode = 'game' | 'panel' | 'register' | 'onboarding'

type Business = {
  id: number
  slug: string
  name: string
  primary_color?: string | null
  text_color?: string | null
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

async function fetchContext(slug: string | null): Promise<MyContext | null> {
  const params = new URLSearchParams({ init_data: getInitData() })
  if (slug) params.set('slug', slug)
  const res = await fetch(`/api/my-context?${params.toString()}`)
  if (!res.ok) return null
  return res.json()
}

async function fetchStatus(slug: string): Promise<SpinResult> {
  const res = await fetch(`/api/spin?init_data=${encodeURIComponent(getInitData())}&slug=${encodeURIComponent(slug)}`)
  return res.json()
}

async function requestSpin(slug: string): Promise<SpinResult> {
  const res = await fetch('/api/spin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ init_data: getInitData(), slug }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Не удалось открыть кейс')
  return data
}

export default function App() {
  const [telegramUser, setTelegramUser] = useState<{ id: number; first_name?: string; username?: string } | null>(null)
  const [context, setContext] = useState<MyContext | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
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
    fetchContext(slug).then((ctx) => {
      if (!ctx) {
        setLoadError('Не удалось загрузить приложение. Проверь соединение и попробуй ещё раз.')
        return
      }
      setContext(ctx)

      const resolved = ctx.business || ctx.my_businesses[0] || null
      if (resolved) applyTheme(resolved.design_theme, resolved.primary_color, resolved.text_color)

      // Если ссылка привела к конкретному бизнесу — по умолчанию игра.
      // Если открыли бота "просто так" и это владелец/сотрудник — сразу панель.
      if (!ctx.business && ctx.my_businesses.length > 0) setMode('panel')
    })
  }, [telegramUser])

  const myBusinesses = context?.my_businesses || []
  const selectedFromList = myBusinesses.find((b) => b.slug === selectedSlug) || myBusinesses[0] || null
  const activeBusiness: (Business & { role?: Role | null }) | null = context?.business || selectedFromList || null
  const activeRole: Role | null = context?.business ? context.role : selectedFromList?.role || null

  useEffect(() => {
    if (!telegramUser || !activeBusiness) return
    fetchStatus(activeBusiness.slug)
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
      const spin = await requestSpin(activeBusiness.slug)
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
    fetchContext(slug).then((ctx) => {
      if (ctx) {
        setContext(ctx)
        setMode('onboarding')
      }
    })
  }

  // Если открыто не внутри Telegram (например, просто в браузере на
  // компьютере) — initData будет пустой строкой. В этом случае вместо
  // игры показываем вход по паролю для владельца (src/pages/BusinessLogin.tsx).
  const openedInTelegram = !!window.Telegram?.WebApp?.initData
  if (!openedInTelegram) {
    return <BusinessLogin />
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
        <div className="cyber-card">
          <CaseBox opening={false} />
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>Загрузка…</p>
        </div>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: 'var(--panel)',
              border: '1px solid var(--line-dim)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--neon)',
              flexShrink: 0,
            }}
          >
            {activeBusiness.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="wordmark">
              LOYAL<span>TY</span>
            </div>
            {telegramUser.first_name && <div className="greeting">Привет, {telegramUser.first_name}</div>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isAdmin ? (
            <div className="mode-switch">
              <button className={mode !== 'panel' && mode !== 'register' && mode !== 'onboarding' ? 'active' : ''} onClick={() => setMode('game')}>
                Игра
              </button>
              <button className={mode === 'panel' ? 'active' : ''} onClick={() => setMode('panel')}>
                {activeRole === 'owner' ? 'Панель владельца' : 'Админ'}
              </button>
            </div>
          ) : (
            <div className="biz-pill">{activeBusiness.name}</div>
          )}
        </div>
      </header>

      {!context?.business && myBusinesses.length > 1 && (
        <div style={{ width: '100%', maxWidth: 420, marginBottom: 16 }}>
          <select
            className="panel-input"
            value={activeBusiness.slug}
            onChange={(e) => setSelectedSlug(e.target.value)}
            style={{ textAlign: 'center' }}
          >
            {myBusinesses.map((b) => (
              <option key={b.slug} value={b.slug}>
                {b.name} — {b.role === 'owner' ? 'владелец' : b.role === 'manager' ? 'управляющий' : 'сотрудник'}
              </option>
            ))}
          </select>
        </div>
      )}

      {mode === 'onboarding' ? (
        <OnboardingChecklist businessName={activeBusiness.name} onContinue={() => setMode('panel')} />
      ) : mode === 'register' ? (
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
                    <button className="ghost" onClick={() => setScreen('codes')}>
                      Мои коды
                    </button>
                  </>
                ) : (
                  <>
                    <div className="status-pill ready">Попытка на сегодня доступна</div>
                    <button className="cta" onClick={openCase}>
                      Открыть кейс
                    </button>
                    {error && <div className="status-pill error">{error}</div>}
                    <button className="ghost" onClick={() => setScreen('codes')}>
                      Мои коды
                    </button>
                    <button className="cta-outline" onClick={() => setMode('register')}>
                      Зарегистрировать свой бизнес
                    </button>

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

            {screen === 'codes' && (
              <MyCodes key="codes" telegramId={telegramUser.id} slug={activeBusiness.slug} onBack={() => setScreen('open')} />
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
