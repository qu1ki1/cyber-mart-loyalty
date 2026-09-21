// api/spin.js
//
// Теперь работает для ЛЮБОГО бизнеса — какой именно, определяется
// параметром slug (приходит из start_param мини-аппа, см. src/App.tsx).
//
// GET  /api/spin?telegram_id=123&slug=cyber-mart
// POST /api/spin  {telegram_id, first_name, username, slug}

import { createClient } from '@supabase/supabase-js'
import { getVerifiedUser } from '../lib/verifyTelegram.js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

function startOfTodayISO() {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString()
}

function expiresAtISO(lifetimeDays) {
  const d = new Date()
  d.setDate(d.getDate() + (lifetimeDays || 14))
  return d.toISOString()
}

function generateCode(prefix = 'CM') {
  return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`
}

function pickWeighted(gifts) {
  const total = gifts.reduce((sum, g) => sum + (g.chance || g.weight || 1), 0)
  let roll = Math.random() * total
  for (const gift of gifts) {
    roll -= gift.chance || gift.weight || 1
    if (roll <= 0) return gift
  }
  return gifts[0]
}

async function getBusiness(slug) {
  const { data, error } = await supabase.from('businesses').select('id, name, code_lifetime_days').ilike('slug', slug).maybeSingle()
  if (error) throw error
  return data
}

async function findTodayWin(businessId, telegramId) {
  const { data, error } = await supabase
    .from('winners')
    .select('*, gifts(name, rarity, icon)')
    .eq('business_id', businessId)
    .eq('telegram_id', telegramId)
    .gte('created_at', startOfTodayISO())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}

export default async function handler(req, res) {
  const verified = getVerifiedUser(req)
  if (!verified) return res.status(401).json({ error: 'Не удалось подтвердить, что это ты. Перезапусти приложение.' })
  const telegramId = verified.id

  const slug = req.method === 'GET' ? req.query.slug : req.body?.slug
  if (!slug) return res.status(400).json({ error: 'Не указан бизнес (slug)' })

  try {
    const business = await getBusiness(slug)
    if (!business) return res.status(404).json({ error: 'Бизнес не найден — проверь ссылку' })

    if (req.method === 'POST') {
      const first_name = verified.first_name
      const username = verified.username

      await supabase
        .from('users')
        .upsert(
          { telegram_id: telegramId, business_id: business.id, first_name: first_name || '', username: username || null },
          { onConflict: 'telegram_id,business_id' }
        )
    }

    await supabase
      .from('users')
      .update({ last_spin_at: new Date().toISOString() })
      .eq('telegram_id', telegramId)
      .eq('business_id', business.id)

    const { data: userRow } = await supabase
      .from('users')
      .select('bonus_attempts')
      .eq('telegram_id', telegramId)
      .eq('business_id', business.id)
      .maybeSingle()
    const bonusAttempts = userRow?.bonus_attempts || 0

    const existing = await findTodayWin(business.id, telegramId)

    if (existing && bonusAttempts <= 0) {
      return res.status(200).json({
        already_spun: true,
        gift_name: existing.gift_name,
        rarity: existing.gifts?.rarity ?? 'rare',
        icon: existing.gifts?.icon ?? 'star',
        code: existing.code,
        redeemed: existing.redeemed,
        expires_at: existing.expires_at,
      })
    }

    if (req.method !== 'POST') {
      return res.status(200).json({ already_spun: !!existing, bonus_attempts: bonusAttempts })
    }

    const { data: gifts, error: giftsError } = await supabase.from('gifts').select('*').eq('business_id', business.id).eq('active', true)

    if (giftsError) throw giftsError
    if (!gifts || gifts.length === 0) {
      return res.status(500).json({ error: 'Для этого бизнеса не настроены активные призы' })
    }

    const winner = pickWeighted(gifts)
    const code = generateCode(winner.prefix || 'CM')
    const expiresAt = expiresAtISO(business.code_lifetime_days)

    const { error: insertError } = await supabase.from('winners').insert({
      business_id: business.id,
      telegram_id: telegramId,
      gift_id: winner.id,
      gift_name: winner.name,
      code,
      redeemed: false,
      expires_at: expiresAt,
    })
    if (insertError) throw insertError

    if (existing && bonusAttempts > 0) {
      await supabase
        .from('users')
        .update({ bonus_attempts: bonusAttempts - 1 })
        .eq('telegram_id', telegramId)
        .eq('business_id', business.id)
    }

    return res.status(200).json({
      already_spun: false,
      gift_name: winner.name,
      rarity: winner.rarity || 'rare',
      icon: winner.icon || 'star',
      code,
      expires_at: expiresAt,
    })
  } catch (err) {
    console.error('SPIN ERROR:', err)
    return res.status(500).json({ 
      error: err?.message || String(err) || 'Неизвестная ошибка'
    })
  }
}