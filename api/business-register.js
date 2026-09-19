// api/business-register.js
// POST /api/business-register  { name, telegram_id }

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

function slugify(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яё\s-]/gi, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

const DEFAULT_GIFTS = [
  { name: '+30 минут', chance: 40, icon: 'clock', rarity: 'common', active: true },
  { name: '+1 час', chance: 20, icon: 'clockBig', rarity: 'uncommon', active: true },
  { name: 'Подарок', chance: 20, icon: 'cup', rarity: 'rare', active: true },
  { name: 'Скидка 10%', chance: 15, icon: 'percent', rarity: 'epic', active: true },
  { name: 'Джекпот', chance: 5, icon: 'star', rarity: 'legendary', active: true },
]

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Метод не поддерживается' })

  const { name, telegram_id } = req.body || {}
  const telegramId = Number(telegram_id)
  if (!name || !telegramId) return res.status(400).json({ error: 'Укажи название бизнеса' })

  try {
    let slug = slugify(name)
    const { data: taken } = await supabase.from('businesses').select('id').ilike('slug', slug).maybeSingle()
    if (taken) slug = `${slug}-${Math.floor(Math.random() * 900 + 100)}`

    const { data: business, error } = await supabase.from('businesses').insert({ name, slug }).select().single()
    if (error) throw error

    await supabase.from('gifts').insert(DEFAULT_GIFTS.map((g) => ({ ...g, business_id: business.id })))
    await supabase.from('admins').insert({ business_id: business.id, telegram_id: telegramId, role: 'owner' })

    return res.status(200).json({ id: business.id, slug: business.slug, name: business.name })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message || 'Внутренняя ошибка' })
  }
}
