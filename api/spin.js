// api/spin.js
//
// Runs on Vercel with the Supabase SERVICE ROLE key — never exposed to the
// browser. This is the ONLY place allowed to decide/record a win.
//
// Required env vars in Vercel (Project Settings -> Environment Variables):
//   SUPABASE_URL               (same value as VITE_SUPABASE_URL)
//   SUPABASE_SERVICE_ROLE_KEY  (Supabase dashboard -> Settings -> API -> service_role)
//
// GET  /api/spin?telegram_id=123        -> checks today's status, no side effects
// POST /api/spin  {telegram_id, first_name, username}  -> performs a spin
//
// Requires these columns to exist (see the SQL snippet in the chat message):
//   gifts.rarity   text
//   gifts.icon     text
//   winners.code       text
//   winners.redeemed   boolean

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

function startOfTodayISO() {
  const now = new Date()
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  return start.toISOString()
}

function generateCode(prefix = 'CM') {
  return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`
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

function pickWeighted(gifts) {
  const total = gifts.reduce((sum, g) => sum + g.chance, 0)
  let roll = Math.random() * total
  for (const gift of gifts) {
    roll -= gift.chance
    if (roll <= 0) return gift
  }
  return gifts[0]
}

export default async function handler(req, res) {
  const telegramId = Number(req.method === 'GET' ? req.query.telegram_id : req.body?.telegram_id)

  if (!telegramId) {
    return res.status(400).json({ error: 'telegram_id is required' })
  }

  try {
    const existing = await findTodayWin(telegramId)

    if (existing) {
      return res.status(200).json({
        already_spun: true,
        gift_name: existing.gift_name,
        rarity: existing.gifts?.rarity ?? 'rare',
        icon: existing.gifts?.icon ?? 'gift',
        code: existing.code,
        redeemed: existing.redeemed,
      })
    }

    if (req.method !== 'POST') {
      return res.status(200).json({ already_spun: false })
    }

    const { first_name, username } = req.body || {}

    await supabase
      .from('users')
      .upsert({ telegram_id: telegramId, first_name: first_name || '', username: username || '' }, { onConflict: 'telegram_id' })

    const { data: gifts, error: giftsError } = await supabase.from('gifts').select('*').eq('active', true).gt('quantity', 0)

    if (giftsError) throw giftsError
    if (!gifts || gifts.length === 0) {
      return res.status(500).json({ error: 'Для бизнеса не настроены активные призы' })
    }

    const winner = pickWeighted(gifts)
    const code = generateCode()

    // Guarded decrement: only succeeds if quantity is still > 0 at write time,
    // so two simultaneous spins can't both take the last unit.
    const { data: decremented, error: decrementError } = await supabase
      .from('gifts')
      .update({ quantity: winner.quantity - 1 })
      .eq('id', winner.id)
      .gt('quantity', 0)
      .select()
      .maybeSingle()

    if (decrementError) throw decrementError
    if (!decremented) {
      return res.status(409).json({ error: 'Приз только что закончился, попробуй ещё раз' })
    }

    const { error: insertError } = await supabase.from('winners').insert({
      telegram_id: telegramId,
      gift_id: winner.id,
      gift_name: winner.name,
      code,
      redeemed: false,
    })

    if (insertError) throw insertError

    return res.status(200).json({
      already_spun: false,
      gift_name: winner.name,
      rarity: winner.rarity || 'rare',
      icon: winner.icon || 'gift',
      code,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message || 'Internal error' })
  }
}
