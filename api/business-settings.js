// api/business-settings.js
//
// GET  /api/business-settings?slug=cyber-mart
//   -> публичные бренд-настройки (название, лого, цвет, тема) — их читает
//      клиентский мини-апп, чтобы отрисоваться под нужный бизнес.
//
// POST /api/business-settings  { slug, password }
//   -> вход владельца: проверяет пароль, возвращает все настройки для редактирования.
//
// PUT  /api/business-settings  { slug, password, name, logo_url, primary_color, design_theme, description }
//   -> сохраняет изменения (требует пароль владельца).

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const PUBLIC_FIELDS = 'id, slug, name, logo_url, primary_color, design_theme, description'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const slug = req.query.slug
    const domain = req.query.domain

    let query = supabase.from('businesses').select(PUBLIC_FIELDS)
    if (slug) query = query.ilike('slug', slug)
    else if (domain) query = query.ilike('custom_domain', domain)
    else return res.status(400).json({ error: 'Не указан бизнес' })

    const { data, error } = await query.maybeSingle()
    if (error) return res.status(500).json({ error: error.message })
    if (!data) return res.status(404).json({ error: 'Бизнес не найден' })
    return res.status(200).json(data)
  }

  const { slug, password } = req.body || {}
  if (!slug || !password) {
    return res.status(400).json({ error: 'Укажи ссылку бизнеса и пароль' })
  }

  const { data: business, error } = await supabase.from('businesses').select('*').ilike('slug', slug).maybeSingle()
  if (error) return res.status(500).json({ error: error.message })
  if (!business || business.owner_password !== password) {
    return res.status(401).json({ error: 'Неверный пароль владельца' })
  }

  if (req.method === 'POST') {
    const { owner_password, ...safe } = business
    return res.status(200).json(safe)
  }

  if (req.method === 'PUT') {
    const { name, logo_url, primary_color, design_theme, description, staff_password, manager_password, custom_domain } = req.body || {}
    const updates = {}
    if (name !== undefined) updates.name = name
    if (logo_url !== undefined) updates.logo_url = logo_url
    if (primary_color !== undefined) updates.primary_color = primary_color
    if (design_theme !== undefined) updates.design_theme = design_theme
    if (description !== undefined) updates.description = description
    if (staff_password !== undefined) updates.staff_password = staff_password
    if (manager_password !== undefined) updates.manager_password = manager_password
    if (custom_domain !== undefined) updates.custom_domain = custom_domain || null

    const { data, error: updateError } = await supabase
      .from('businesses')
      .update(updates)
      .eq('id', business.id)
      .select(PUBLIC_FIELDS)
      .single()

    if (updateError) return res.status(500).json({ error: updateError.message })
    return res.status(200).json(data)
  }

  return res.status(405).json({ error: 'Метод не поддерживается' })
}
