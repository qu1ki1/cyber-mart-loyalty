// api/my-context.js
//
// GET /api/my-context?telegram_id=123&slug=cyber-mart (slug необязателен)
//
// Возвращает:
//  - business: данные бизнеса (если slug передан и найден)
//  - role: роль этого telegram_id в этом бизнесе (owner/manager/staff/null)
//  - my_businesses: все бизнесы, где этот telegram_id — админ (для регистрации/переключения)

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const PUBLIC_FIELDS = 'id, slug, name, logo_url, primary_color, design_theme, description'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Метод не поддерживается' })

  const telegramId = Number(req.query.telegram_id)
  const slug = req.query.slug || null
  if (!telegramId) return res.status(400).json({ error: 'telegram_id обязателен' })

  try {
    let business = null
    if (slug) {
      const { data } = await supabase.from('businesses').select(PUBLIC_FIELDS).ilike('slug', slug).maybeSingle()
      business = data
    }

    const { data: myLinks } = await supabase
      .from('admins')
      .select(`role, businesses(${PUBLIC_FIELDS})`)
      .eq('telegram_id', telegramId)

    const myBusinesses = (myLinks || []).map((l) => ({ ...l.businesses, role: l.role }))

    let role = null
    if (business) {
      const match = myBusinesses.find((b) => b.id === business.id)
      role = match ? match.role : null
    }

    return res.status(200).json({ business, role, my_businesses: myBusinesses })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Не удалось загрузить приложение. Попробуй ещё раз.' })
  }
}
