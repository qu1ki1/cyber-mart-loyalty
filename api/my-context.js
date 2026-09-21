// api/my-context.js
//
// GET /api/my-context?init_data=...&slug=... (slug необязателен)
//
// Возвращает:
//  - business: данные бизнеса (если slug передан и найден)
//  - role: роль этого telegram_id в этом бизнесе
//  - my_businesses: все бизнесы, где этот telegram_id — админ

import { createClient } from '@supabase/supabase-js'
import { getVerifiedUser } from '../lib/verifyTelegram.js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const PUBLIC_FIELDS = 'id, slug, name, logo_url, primary_color, text_color, design_theme, description'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Метод не поддерживается' })

  const verified = getVerifiedUser(req)
  if (!verified) return res.status(401).json({ error: 'Не удалось подтвердить, что это ты. Перезапусти приложение.' })
  const telegramId = verified.id
  const slug = req.query.slug || null

  try {
    let business = null
    if (slug) {
      const { data } = await supabase.from('businesses').select(PUBLIC_FIELDS).ilike('slug', slug).maybeSingle()
      business = data
    }

    // Без embed-join — надёжнее, если FK нет в schema cache
    const { data: myLinks, error: linksError } = await supabase
      .from('admins')
      .select('role, business_id')
      .eq('telegram_id', telegramId)

    if (linksError) throw linksError

    let myBusinesses = []
    if (myLinks && myLinks.length > 0) {
      const ids = myLinks.map((l) => l.business_id).filter(Boolean)
      const { data: bizRows } = await supabase
        .from('businesses')
        .select(PUBLIC_FIELDS)
        .in('id', ids.length ? ids : [0])

      const bizMap = new Map((bizRows || []).map((b) => [b.id, b]))
      myBusinesses = myLinks
        .map((l) => {
          const b = bizMap.get(l.business_id)
          if (!b) return null
          return { ...b, role: l.role }
        })
        .filter(Boolean)
    }

    let role = null
    if (business) {
      const match = myBusinesses.find((b) => b.id === business.id)
      role = match ? match.role : null
    }

    return res.status(200).json({ business, role, my_businesses: myBusinesses })
  } catch (err) {
    console.error('MY-CONTEXT ERROR:', err)
    return res.status(500).json({ error: 'Не удалось загрузить приложение. Попробуй ещё раз.' })
  }
}