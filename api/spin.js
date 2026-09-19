// api/spin.js
//
// Призы теперь БЕЗ ограничения по количеству — крутится только по весам (chance).
// Код бонуса действует 14 дней (не 24 часа) — чтобы гость успел вернуться.
// Учитывает бонусные попытки, выданные администратором вручную (users.bonus_attempts).
//
// Нужные переменные окружения в Vercel:
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//
// GET  /api/spin?telegram_id=123        -> проверка статуса, без побочных эффектов
// POST /api/spin  {telegram_id, first_name, username}  -> сам спин

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const CODE_LIFETIME_DAYS = 14

function startOfTodayISO() {
  const now = new Date()
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  return start.toISOString()
}

function expiresAtISO() {
  const d = new Date()
  d.setDate(d.getDate() + CODE_LIFETIME_DAYS)
  return d.toISOString()
}

function generateCode(prefix = 'CM') {
  return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`
}

function pickWeighted(gifts) {
  const total = gifts.reduce((sum, g) => sum + g.chance, 0)
  let roll = Math.random() * total
  for (const gift of gifts) {
    roll -= gift.chance
    if (roll <= 0) return gift
  }
  return gifts[0]
}

async function findTodayWin(telegramId) {
  const { data, error } = await supabase
    .from('winners')
    .select('*, gifts(name, rarity, icon)')
    .eq('telegram_id', telegramId)
    .gte('created_at', startOfTodayISO())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}

export default async function handler(req, res) {
  const telegramId = Number(req.method === 'GET' ? req.query.telegram_id : req.body?.telegram_id)

  if (!telegramId) {
    return res.status(400).json({ error: 'telegram_id обязателен' })
  }

  try {
    // Всегда обновляем username/имя — это единственный способ потом найти
    // гостя в админке по username, а не по telegram_id.
    if (req.method === 'POST') {
      const { first_name, username } = req.body || {}
      await supabase
        .from('users')
        .upsert(
          { telegram_id: telegramId, first_name: first_name || '', username: username || null },
          { onConflict: 'telegram_id' }
        )
    }

    const { data: userRow } = await supabase.from('users').select('bonus_attempts').eq('telegram_id', telegramId).maybeSingle()
    const bonusAttempts = userRow?.bonus_attempts || 0

    const existing = await findTodayWin(telegramId)

    if (existing && bonusAttempts <= 0) {
      return res.status(200).json({
        already_spun: true,
        gift_name: existing.gift_name,
        rarity: existing.gifts?.rarity ?? 'rare',
        icon: existing.gifts?.icon ?? 'gift',
        code: existing.code,
        redeemed: existing.redeemed,
        expires_at: existing.expires_at,
      })
    }

    if (req.method !== 'POST') {
      return res.status(200).json({ already_spun: !!existing, bonus_attempts: bonusAttempts })
    }

    const { data: gifts, error: giftsError } = await supabase.from('gifts').select('*').eq('active', true)

    if (giftsError) throw giftsError
    if (!gifts || gifts.length === 0) {
      return res.status(500).json({ error: 'Для бизнеса не настроены активные призы' })
    }

    const winner = pickWeighted(gifts)
    const code = generateCode()
    const expiresAt = expiresAtISO()

    const { error: insertError } = await supabase.from('winners').insert({
      telegram_id: telegramId,
      gift_id: winner.id,
      gift_name: winner.name,
      code,
      redeemed: false,
      expires_at: expiresAt,
    })

    if (insertError) throw insertError

    // Если это был бонусный спин — списываем одну бонусную попытку.
    if (existing && bonusAttempts > 0) {
      await supabase
        .from('users')
        .update({ bonus_attempts: bonusAttempts - 1 })
        .eq('telegram_id', telegramId)
    }

    return res.status(200).json({
      already_spun: false,
      gift_name: winner.name,
      rarity: winner.rarity || 'rare',
      icon: winner.icon || 'gift',
      code,
      expires_at: expiresAt,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message || 'Внутренняя ошибка' })
  }
}
