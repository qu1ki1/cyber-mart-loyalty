import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

import type { TelegramUser } from '../App'
import CaseBox from './CaseBox'
import type { IconKey } from './Icon'
import Reel, { type Rarity } from './GameReel'
import RewardResult from './GameRewardResult'

import './GameExperience.css'

type GameScreen = 'checking' | 'welcome' | 'ready' | 'opening' | 'rolling' | 'result' | 'used' | 'error'

type Business = {
  slug: string
  name: string
  description?: string | null
}

type SpinResult = {
  already_spun: boolean
  can_spin?: boolean
  bonus_attempts?: number
  attempts_available?: number
  gift_name?: string
  rarity?: Rarity
  icon?: IconKey
  code?: string
  expires_at?: string
  redeemed?: boolean
  error?: string
}

type Prize = Required<Pick<SpinResult, 'gift_name' | 'rarity' | 'icon' | 'code'>> &
  Pick<SpinResult, 'expires_at' | 'redeemed'>

type Props = {
  telegramUser: TelegramUser
  business: Business
  referralId: string | null
  botUsername: string
}

const RARITIES: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary']
const ICONS: IconKey[] = ['clock', 'clockBig', 'cup', 'percent', 'star']

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function toPrize(result: SpinResult): Prize | null {
  if (!result.gift_name || !result.code) return null

  return {
    gift_name: result.gift_name,
    code: result.code,
    rarity: RARITIES.includes(result.rarity as Rarity) ? (result.rarity as Rarity) : 'rare',
    icon: ICONS.includes(result.icon as IconKey) ? (result.icon as IconKey) : 'star',
    expires_at: result.expires_at,
    redeemed: result.redeemed,
  }
}

async function readJson(response: Response): Promise<SpinResult> {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Не удалось открыть кейс')
  return data
}

async function fetchStatus(telegramId: number, slug: string): Promise<SpinResult> {
  const params = new URLSearchParams({ telegram_id: String(telegramId), slug })
  return readJson(await fetch(`/api/spin-v2?${params.toString()}`))
}

async function requestSpin(user: TelegramUser, slug: string, ref: string | null): Promise<SpinResult> {
  return readJson(await fetch('/api/spin-v2', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      telegram_id: user.id,
      slug,
      first_name: user.first_name,
      username: user.username,
      ref,
    }),
  }))
}

function shareReferral(telegramId: number, slug: string, botUsername: string) {
  if (!botUsername) return

  const deepLink = `https://t.me/${botUsername}?start=${slug}-ref-${telegramId}`
  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(deepLink)}&text=${encodeURIComponent('Забери свой подарок 🎁')}`
  const telegram = window.Telegram?.WebApp as (typeof window.Telegram.WebApp & {
    openTelegramLink?: (url: string) => void
  }) | undefined

  if (telegram?.openTelegramLink) telegram.openTelegramLink(shareUrl)
  else window.open(shareUrl, '_blank', 'noopener,noreferrer')
}

export default function GameExperience({ telegramUser, business, referralId, botUsername }: Props) {
  const [screen, setScreen] = useState<GameScreen>('checking')
  const [prize, setPrize] = useState<Prize | null>(null)
  const [attemptsAvailable, setAttemptsAvailable] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const busy = useRef(false)
  const openingTimer = useRef<number | null>(null)

  useEffect(() => {
    let cancelled = false
    busy.current = false

    fetchStatus(telegramUser.id, business.slug)
      .then((status) => {
        if (cancelled) return

        const available = Math.max(0, Number(status.attempts_available ?? (status.can_spin ? 1 : 0)))
        const existingPrize = toPrize(status)
        setAttemptsAvailable(available)

        if (status.can_spin ?? !status.already_spun) {
          setScreen('welcome')
          return
        }

        setPrize(existingPrize)
        setScreen('used')
      })
      .catch((caught) => {
        if (cancelled) return
        setError(caught instanceof Error ? caught.message : 'Не удалось проверить попытку')
        setScreen('error')
      })

    return () => {
      cancelled = true
      if (openingTimer.current) window.clearTimeout(openingTimer.current)
    }
  }, [business.slug, telegramUser.id])

  async function startGame() {
    if (busy.current) return
    busy.current = true
    setError(null)
    setScreen('checking')
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light')

    try {
      const [spin] = await Promise.all([requestSpin(telegramUser, business.slug, referralId), delay(650)])
      const receivedPrize = toPrize(spin)

      if (spin.already_spun && spin.can_spin === false) {
        setPrize(receivedPrize)
        setAttemptsAvailable(0)
        setScreen('used')
        return
      }

      if (!receivedPrize) throw new Error('Сервер не вернул подарок. Попробуй ещё раз.')

      setPrize(receivedPrize)
      setAttemptsAvailable(Math.max(0, Number(spin.attempts_available || 0)))
      setScreen('ready')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Не удалось открыть кейс')
      setScreen('error')
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error')
    } finally {
      busy.current = false
    }
  }

  function openPreparedCase() {
    if (!prize || openingTimer.current) return

    setScreen('opening')
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('heavy')
    openingTimer.current = window.setTimeout(() => {
      openingTimer.current = null
      setScreen('rolling')
    }, 900)
  }

  function leaveResult() {
    if (attemptsAvailable > 0) {
      setPrize(null)
      setScreen('welcome')
    } else {
      setScreen('used')
    }
  }

  const attemptText = attemptsAvailable > 1
    ? `Доступно попыток: ${attemptsAvailable}`
    : 'Попытка на сегодня доступна'

  return (
    <main>
      <AnimatePresence mode="wait">
        {screen === 'checking' && (
          <motion.div key="checking" className="cyber-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CaseBox opening />
            <h1>Проверяем твою попытку</h1>
            <div className="checking-bar"><span /></div>
            <p className="screen-copy">Секунду — готовим подарки</p>
          </motion.div>
        )}

        {screen === 'welcome' && (
          <motion.div key="welcome" className="cyber-card" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="eyebrow">ПОДАРОК ЗА ВИЗИТ</div>
            <CaseBox opening={false} />
            <h1>{business.description || 'Открой кейс и забери подарок'}</h1>
            <div className="status-pill ready">{attemptText}</div>
            <button className="cta" onClick={startGame}>Начать игру</button>
            {botUsername && (
              <button className="ghost" onClick={() => shareReferral(telegramUser.id, business.slug, botUsername)}>
                Пригласить друга · +1 попытка
              </button>
            )}
          </motion.div>
        )}

        {screen === 'ready' && prize && (
          <motion.div key="ready" className="cyber-card" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.04 }}>
            <div className="eyebrow">ПОДАРОК УЖЕ ВНУТРИ</div>
            <button className="case-tap" onClick={openPreparedCase} aria-label="Открыть кейс">
              <CaseBox opening={false} />
              <span className="tap-ring" />
            </button>
            <h1>Нажми на кейс</h1>
            <p className="screen-copy">Узнай, какой подарок тебе выпал</p>
            <button className="cta" onClick={openPreparedCase}>Открыть</button>
          </motion.div>
        )}

        {screen === 'opening' && (
          <motion.div key="opening" className="cyber-card opening-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="opening-flash" />
            <CaseBox opening />
            <h1>Открываем…</h1>
          </motion.div>
        )}

        {screen === 'rolling' && prize && (
          <motion.div key="rolling" className="cyber-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="reel-title">ТВОЙ ПОДАРОК ОПРЕДЕЛЯЕТСЯ</div>
            <Reel key={prize.code} winner={{ name: prize.gift_name, rarity: prize.rarity, icon: prize.icon }} onDone={() => setScreen('result')} />
            <p className="screen-copy reel-copy">Лови удачу</p>
          </motion.div>
        )}

        {screen === 'result' && prize && (
          <RewardResult
            key="result"
            gift={prize.gift_name}
            code={prize.code}
            rarity={prize.rarity}
            icon={prize.icon}
            expiresAt={prize.expires_at}
            redeemed={prize.redeemed}
            onClose={leaveResult}
          />
        )}

        {screen === 'used' && (
          <motion.div key="used" className="cyber-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <CaseBox opening={false} />
            <h1>Попытка уже использована</h1>
            <div className="status-pill">Новая попытка появится завтра</div>
            {prize && <button className="cta done" onClick={() => setScreen('result')}>Посмотреть подарок</button>}
            {botUsername && (
              <button className="ghost" onClick={() => shareReferral(telegramUser.id, business.slug, botUsername)}>
                Получить ещё попытку за друга
              </button>
            )}
          </motion.div>
        )}

        {screen === 'error' && (
          <motion.div key="error" className="cyber-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="message-icon error">!</div>
            <h1>Игра не запустилась</h1>
            <div className="status-pill error">{error || 'Проверь соединение и попробуй ещё раз'}</div>
            <button className="cta" onClick={startGame}>Попробовать снова</button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
