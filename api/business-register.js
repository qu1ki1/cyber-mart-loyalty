// api/business-register.js
//
// Регистрация нового бизнеса на платформе.
// POST /api/business-register  { name, slug, password }

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
  { key: 'r30', name: '+30 минут', weight: 40, icon: 'clock', prefix: 'G1', rarity: 'common', chance: 40, active: true },
  { key: 'r60', name: '+1 час', weight: 20, icon: 'clockBig', prefix: 'G2', rarity: 'uncommon', chance: 20, active: true },
  { key: 'drink', name: 'Подарок', weight: 20, icon: 'cup', prefix: 'G3', rarity: 'rare', chance: 20, active: true },
  { key: 'discount', name: 'Скидка 10%', weight: 15, icon: 'percent', prefix: 'G4', rarity: 'epic', chance: 15, active: true },
  { key: 'jackpot', name: 'Джекпот', weight: 5, icon: 'star', prefix: 'G5', rarity: 'legendary', chance: 5, active: true },
]

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не поддерживается' })
  }

  const { name, slug: rawSlug, password } = req.body || {}

  if (!name || !password) {
    return res.status(400).json({ error: 'Укажи название бизнеса и пароль' })
  }
  if (password.length < 4) {
    return res.status(400).json({ error: 'Пароль слишком короткий (минимум 4 символа)' })
  }

  const slug = slugify(rawSlug || name)
  if (!slug) {
    return res.status(400).json({ error: 'Не удалось составить ссылку из названия, попробуй другое' })
  }

  try {
    const { data: existing } = await supabase.from('businesses').select('id').ilike('slug', slug).maybeSingle()
    if (existing) {
      return res.status(409).json({ error: `Ссылка "${slug}" уже занята, придумай другую` })
    }

    const { data: business, error } = await supabase
      .from('businesses')
      .insert({ name, slug, owner_password: password })
      .select()
      .single()

    if (error) throw error

    await supabase.from('gifts').insert(DEFAULT_GIFTS.map((g) => ({ ...g, business_id: business.id })))

    return res.status(200).json({
      id: business.id,
      slug: business.slug,
      name: business.name,
      deep_link_hint: `t.me/<твой_бот>?start=${business.slug}`,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message || 'Внутренняя ошибка' })
  }
}
