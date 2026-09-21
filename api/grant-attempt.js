// api/grant-attempt.js
// POST /api/grant-attempt  { username, count, slug, telegram_id }
// Только owner и manager.

import { createClient } from '@supabase/supabase-js'
import { resolveActor } from '../lib/verifyTelegram.js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Метод не поддерживается' })

  const { username, count, slug } = req.body || {}
  if (!slug) return res.status(400).json({ error: 'Не хватает данных' })

  const cleanUsername = (username || '').trim().replace(/^@/, '')
  const grantCount = Math.max(1, Number(count) || 1)
  if (!cleanUsername) return res.status(400).json({ error: 'Укажи username гостя' })

  try {
    const { data: business } = await supabase.from('businesses').select('id, owner_password').ilike('slug', slug).maybeSingle()
    if (!business) return res.status(404).json({ error: 'Бизнес не найден' })

    const actor = await resolveActor(req, supabase, business)
    if (!actor || actor.role === 'staff') return res.status(403).json({ error: 'Только владелец или управляющий может выдавать попытки' })

    const { data: guest, error } = await supabase
      .from('users')
      .select('telegram_id, username, first_name, bonus_attempts')
      .eq('business_id', business.id)
      .ilike('username', cleanUsername)
      .maybeSingle()

    if (error) throw error
    if (!guest) {
      return res.status(404).json({ error: `Гость @${cleanUsername} не найден среди тех, кто уже открывал мини-апп.` })
    }

    const newTotal = (guest.bonus_attempts || 0) + grantCount
    await supabase.from('users').update({ bonus_attempts: newTotal }).eq('telegram_id', guest.telegram_id).eq('business_id', business.id)

    return res.status(200).json({
      guest_name: guest.first_name || `@${guest.username}`,
      granted: grantCount,
      total_bonus_attempts: newTotal,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Не удалось выдать попытку. Попробуй ещё раз.' })
  }
}
