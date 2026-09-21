// api/my-codes.js
// GET /api/my-codes?telegram_id=X&slug=Y
// Вся история кодов гостя в этом бизнесе — активные и уже погашенные.

import { createClient } from '@supabase/supabase-js'
import { getVerifiedUser } from '../lib/verifyTelegram.js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Метод не поддерживается' })

  const verified = getVerifiedUser(req)
  if (!verified) return res.status(401).json({ error: 'Не удалось подтвердить, что это ты. Перезапусти приложение.' })
  const telegramId = verified.id
  const slug = req.query.slug
  if (!slug) return res.status(400).json({ error: 'Не хватает данных' })

  try {
    const { data: business } = await supabase.from('businesses').select('id').ilike('slug', slug).maybeSingle()
    if (!business) return res.status(404).json({ error: 'Бизнес не найден' })

    const { data: winners, error } = await supabase
      .from('winners')
      .select('id, gift_name, code, redeemed, expires_at, created_at')
      .eq('business_id', business.id)
      .eq('telegram_id', telegramId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return res.status(200).json(winners || [])
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Не удалось загрузить твои коды.' })
  }
}
