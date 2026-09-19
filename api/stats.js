// api/stats.js
// GET /api/stats?telegram_id=X&slug=Y

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Метод не поддерживается' })

  const telegramId = Number(req.query.telegram_id)
  const slug = req.query.slug
  if (!telegramId || !slug) return res.status(400).json({ error: 'Не хватает данных' })

  const { data: business } = await supabase.from('businesses').select('id').ilike('slug', slug).maybeSingle()
  if (!business) return res.status(404).json({ error: 'Бизнес не найден' })

  const { data: admin } = await supabase.from('admins').select('role').eq('business_id', business.id).eq('telegram_id', telegramId).maybeSingle()
  if (!admin) return res.status(403).json({ error: 'Нет доступа' })

  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)

  const { data: winners } = await supabase
    .from('winners')
    .select('redeemed')
    .eq('business_id', business.id)
    .gte('created_at', todayStart.toISOString())

  return res.status(200).json({
    total_spins_today: winners?.length || 0,
    redeemed_today: winners?.filter((w) => w.redeemed).length || 0,
  })
}
