// api/reports.js
// Объединённый эндпоинт: статистика и история (были в отдельных файлах —
// объединил, чтобы уложиться в лимит 12 serverless-функций на бесплатном
// плане Vercel).
//
// GET /api/reports?type=stats&init_data=...&slug=Y&period=day|week|month
// GET /api/reports?type=history&init_data=...&slug=Y

import { createClient } from '@supabase/supabase-js'
import { resolveActor } from '../lib/verifyTelegram.js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

function periodStart(period) {
  const now = new Date()
  if (period === 'week') return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  if (period === 'month') return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const start = new Date()
  start.setUTCHours(0, 0, 0, 0)
  return start
}

async function handleStats(req, res, business) {
  const period = ['day', 'week', 'month'].includes(req.query.period) ? req.query.period : 'day'
  const since = periodStart(period).toISOString()

  const { data: winners } = await supabase
    .from('winners')
    .select('redeemed, telegram_id, gift_name')
    .eq('business_id', business.id)
    .gte('created_at', since)

  const list = winners || []
  const total = list.length
  const redeemed = list.filter((w) => w.redeemed).length
  const uniqueGuests = new Set(list.map((w) => w.telegram_id)).size
  const rate = total > 0 ? Math.round((redeemed / total) * 100) : 0

  const breakdown = {}
  for (const w of list) {
    breakdown[w.gift_name] = (breakdown[w.gift_name] || 0) + 1
  }
  const breakdownList = Object.entries(breakdown)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  // Список пользователей с @username и количеством попыток (bonus_attempts)
  const { data: users } = await supabase
    .from('users')
    .select('telegram_id, username, first_name, bonus_attempts')
    .eq('business_id', business.id)
    .order('bonus_attempts', { ascending: false })
    .limit(100)

  const usersList = (users || []).map((u) => ({
    username: u.username ? `@${u.username}` : (u.first_name || `id${u.telegram_id}`),
    attempts: u.bonus_attempts ?? 0,
  }))

  return res.status(200).json({
    period,
    total_spins: total,
    redeemed,
    unique_guests: uniqueGuests,
    redeem_rate: rate,
    breakdown: breakdownList,
    users: usersList,
  })
}

async function handleHistory(req, res, business) {
  const { data: winners, error } = await supabase
    .from('winners')
    .select('id, telegram_id, gift_name, code, redeemed, redeemed_at, expires_at, created_at')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) throw error

  const telegramIds = [...new Set((winners || []).map((w) => w.telegram_id))]
  const { data: users } = await supabase
    .from('users')
    .select('telegram_id, first_name, username')
    .eq('business_id', business.id)
    .in('telegram_id', telegramIds.length ? telegramIds : [0])

  const userMap = new Map((users || []).map((u) => [u.telegram_id, u]))
  const result = (winners || []).map((w) => {
    const u = userMap.get(w.telegram_id)
    return { ...w, guest_name: u?.first_name || (u?.username ? '@' + u.username : 'Гость') }
  })

  return res.status(200).json(result)
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Метод не поддерживается' })

  const type = req.query.type === 'history' ? 'history' : 'stats'
  const slug = req.query.slug
  if (!slug) return res.status(400).json({ error: 'Не хватает данных' })

  try {
    const { data: business } = await supabase.from('businesses').select('id, owner_password').ilike('slug', slug).maybeSingle()
    if (!business) return res.status(404).json({ error: 'Бизнес не найден' })

    const actor = await resolveActor(req, supabase, business)
    if (!actor) return res.status(403).json({ error: 'Нет доступа' })
    if (type === 'history' && actor.role === 'staff') return res.status(403).json({ error: 'Нет доступа' })

    if (type === 'history') return await handleHistory(req, res, business)
    return await handleStats(req, res, business)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Не удалось загрузить данные.' })
  }
}
