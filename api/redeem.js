// api/redeem.js
// POST /api/redeem  { code, slug, telegram_id }
// Любая роль (owner/manager/staff) может гасить коды.

import { createClient } from '@supabase/supabase-js'
import { resolveActor } from '../lib/verifyTelegram.js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Метод не поддерживается' })

  const { code, slug } = req.body || {}
  if (!slug) return res.status(400).json({ error: 'Не хватает данных' })
  if (!code) return res.status(400).json({ error: 'Не указан код' })

  try {
    const { data: business } = await supabase.from('businesses').select('id, owner_password').ilike('slug', slug).maybeSingle()
    if (!business) return res.status(404).json({ error: 'Бизнес не найден' })

    const actor = await resolveActor(req, supabase, business)
    if (!actor) return res.status(403).json({ error: 'Нет доступа' })

    const { data: win, error } = await supabase
      .from('winners')
      .select('*')
      .eq('business_id', business.id)
      .eq('code', code.trim().toUpperCase())
      .maybeSingle()

    if (error) throw error
    if (!win) return res.status(404).json({ error: 'Код не найден' })
    if (win.redeemed) return res.status(409).json({ error: 'Этот код уже был погашен ранее' })
    if (win.expires_at && new Date(win.expires_at) < new Date()) {
      return res.status(410).json({ error: 'Срок действия кода истёк' })
    }

    const { data: guest } = await supabase
      .from('users')
      .select('username, first_name')
      .eq('telegram_id', win.telegram_id)
      .eq('business_id', business.id)
      .maybeSingle()

    await supabase.from('winners').update({ redeemed: true, redeemed_at: new Date().toISOString() }).eq('id', win.id)

    return res.status(200).json({
      gift_name: win.gift_name,
      guest_name: guest?.first_name || (guest?.username ? '@' + guest.username : 'Гость'),
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Не удалось погасить код. Попробуй ещё раз.' })
  }
}
