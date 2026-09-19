import { useEffect, useState } from 'react'

import AdminPanel from './adminpanel/AdminPanel'
import RegisterInApp from './adminpanel/RegisterInApp'
import GameExperience from './components/GameExperience'
import { applyTheme } from './themes'

import './App.css'

type Role = 'owner' | 'manager' | 'staff'
type Mode = 'game' | 'panel' | 'register'

export type TelegramUser = {
  id: number
  first_name?: string
  username?: string
}

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

type LaunchParams = {
  slug: string | null
  ref: string | null
}

const BOT_USERNAME = import.meta.env.VITE_BOT_USERNAME || ''

function getLaunchParams(): LaunchParams {
  const query = new URLSearchParams(window.location.search)
  const querySlug = query.get('biz') || query.get('slug')
  const queryRef = query.get('ref')
  const startParam = query.get('tgWebAppStartParam') || window.Telegram?.WebApp?.initDataUnsafe?.start_param || ''

  if (querySlug) return { slug: querySlug, ref: queryRef }

  const referral = startParam.match(/^(.+)-ref-(\d+)$/)
  if (referral) return { slug: referral[1], ref: referral[2] }
  if (startParam && !startParam.startsWith('join-')) return { slug: startParam, ref: null }

  return { slug: null, ref: null }
}

async function fetchContext(telegramId: number, slug: string | null): Promise<MyContext> {
  const params = new URLSearchParams({ telegram_id: String(telegramId) })
  if (slug) params.set('slug', slug)

  const response = await fetch(`/api/my-context?${params.toString()}`)
  const data = await response.json().catch(() => null)

  if (!response.ok || !data) throw new Error(data?.error || 'Не удалось загрузить приложение')
  return data
}

export default function App() {
  const [telegramUser] = useState<TelegramUser | null>(() => {
    const user = window.Telegram?.WebApp?.initDataUnsafe?.user
    return user ? { id: user.id, first_name: user.first_name, username: user.username } : null
  })
  const [launchParams, setLaunchParams] = useState<LaunchParams>(() => getLaunchParams())
  const [context, setContext] = useState<MyContext | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [mode, setMode] = useState<Mode>('game')

  useEffect(() => {
    const tg = window.Telegram?.WebApp

    if (tg) {
      tg.ready()
      tg.expand()
      tg.setBackgroundColor('#050607')
      tg.setHeaderColor('#050607')

    }
  }, [])

  useEffect(() => {
    if (!telegramUser) return

    let cancelled = false
    fetchContext(telegramUser.id, launchParams.slug)
      .then((nextContext) => {
        if (cancelled) return

        setContext(nextContext)
        const resolved = nextContext.business || nextContext.my_businesses[0] || null
        if (resolved) applyTheme(resolved.design_theme, resolved.primary_color)
        setMode(!nextContext.business && nextContext.my_businesses.length > 0 ? 'panel' : 'game')
      })
      .catch((error) => {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : 'Не удалось загрузить приложение')
      })

    return () => {
      cancelled = true
    }
  }, [launchParams.slug, telegramUser])

  const activeBusiness: (Business & { role?: Role | null }) | null =
    context?.business || context?.my_businesses[0] || null
  const activeRole: Role | null = context?.business ? context.role : context?.my_businesses[0]?.role || null
  const isAdmin = Boolean(activeRole)

  function handleBusinessCreated(slug: string) {
    if (!telegramUser) return

    fetchContext(telegramUser.id, slug)
      .then((nextContext) => {
        setContext(nextContext)
        setLaunchParams({ slug, ref: null })
        const resolved = nextContext.business || nextContext.my_businesses[0] || null
        if (resolved) applyTheme(resolved.design_theme, resolved.primary_color)
        setMode('panel')
      })
      .catch((error) => setLoadError(error instanceof Error ? error.message : 'Не удалось загрузить бизнес'))
  }

  if (telegramUser && !context && !loadError) {
    return <AppShell><div className="app-loader" aria-label="Загрузка"><span /><p>Загружаем LOYALTY</p></div></AppShell>
  }

  if (!telegramUser) {
    return (
      <AppShell>
        <div className="cyber-card message-card">
          <div className="message-icon">TG</div>
          <h1>Открой приложение в Telegram</h1>
          <p>Игровой профиль доступен только внутри бота.</p>
        </div>
      </AppShell>
    )
  }

  if (loadError) {
    return (
      <AppShell>
        <div className="cyber-card message-card">
          <div className="message-icon error">!</div>
          <h1>Не удалось загрузить</h1>
          <div className="status-pill error">{loadError}</div>
          <button className="cta" onClick={() => window.location.reload()}>Попробовать снова</button>
        </div>
      </AppShell>
    )
  }

  if (!activeBusiness) {
    return <AppShell><RegisterInApp telegramId={telegramUser.id} onCreated={handleBusinessCreated} /></AppShell>
  }

  return (
    <AppShell>
      <header>
        <div>
          <div className="wordmark">LOYAL<span>TY</span></div>
          {telegramUser.first_name && <div className="greeting">Привет, {telegramUser.first_name}</div>}
        </div>

        <div className="header-actions">
          <div className="biz-pill">{activeBusiness.name}</div>

          {isAdmin && (
            <button
              className="gear-btn"
              onClick={() => setMode(mode === 'register' ? 'game' : 'register')}
              aria-label={mode === 'register' ? 'Вернуться в игру' : 'Зарегистрировать бизнес'}
              title={mode === 'register' ? 'Вернуться' : 'Новый бизнес'}
            >
              {mode === 'register' ? (
                <svg viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
              )}
            </button>
          )}

          {isAdmin && mode !== 'register' && (
            <button
              className="gear-btn"
              onClick={() => setMode(mode === 'game' ? 'panel' : 'game')}
              aria-label={mode === 'game' ? 'Открыть панель управления' : 'Вернуться в игру'}
            >
              {mode === 'game' ? (
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M19.4 13a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V19a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H4a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H10a1.65 1.65 0 001-1.51V4a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V10a1.65 1.65 0 001.51 1H20a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              )}
            </button>
          )}
        </div>
      </header>

      {mode === 'register' ? (
        <RegisterInApp telegramId={telegramUser.id} onCreated={handleBusinessCreated} />
      ) : mode === 'panel' && activeRole ? (
        <AdminPanel telegramId={telegramUser.id} slug={activeBusiness.slug} role={activeRole} botUsername={BOT_USERNAME} />
      ) : (
        <GameExperience key={activeBusiness.slug} telegramUser={telegramUser} business={activeBusiness} referralId={launchParams.ref} botUsername={BOT_USERNAME} />
      )}

      <footer>{activeBusiness.name.toUpperCase()} · LOYALTY</footer>
    </AppShell>
  )
}

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app">
      <div className="bg-grid" />
      <div className="bg-glow" />
      {children}
    </div>
  )
}
