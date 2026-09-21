// api/business-settings.js
// GET /api/business-settings?slug=X (публично, для отрисовки бренда клиенту)
// PUT /api/business-settings { telegram_id, slug, name?, logo_url?, primary_color?, design_theme?, description?, custom_domain? }
//     owner и manager могут менять.

import { createClient } from '@supabase/supabase-js'
import { resolveActor } from '../lib/verifyTelegram.js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const PUBLIC_FIELDS = 'id, slug, name, logo_url, primary_color, text_color, design_theme, description, reminder_text, code_lifetime_days'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const slug = req.query.slug
    const domain = req.query.domain
    let query = supabase.from('businesses').select(PUBLIC_FIELDS)
    if (slug) query = query.ilike('slug', slug)
    else if (domain) query = query.ilike('custom_domain', domain)
    else return res.status(400).json({ error: 'Не указан бизнес' })

    const { data, error } = await query.maybeSingle()
    if (error) return res.status(500).json({ error: 'Не удалось загрузить настройки бренда.' })
    if (!data) return res.status(404).json({ error: 'Бизнес не найден' })
    return res.status(200).json(data)
  }

  if (req.method !== 'PUT') return res.status(405).json({ error: 'Метод не поддерживается' })

  const {
    slug,
    name,
    logo_url,
    primary_color,
    text_color,
    design_theme,
    description,
    custom_domain,
    reminder_text,
    code_lifetime_days,
    owner_password,
  } = req.body || {}
  if (!slug) return res.status(400).json({ error: 'Не хватает данных' })

  const { data: business } = await supabase.from('businesses').select('id, owner_password').ilike('slug', slug).maybeSingle()
  if (!business) return res.status(404).json({ error: 'Бизнес не найден' })

  const actor = await resolveActor(req, supabase, business)
  if (!actor || actor.role === 'staff') return res.status(403).json({ error: 'Настройки бренда может менять только владелец или управляющий' })

  const updates = {}
  if (name !== undefined) updates.name = name
  if (logo_url !== undefined) updates.logo_url = logo_url
  if (primary_color !== undefined) updates.primary_color = primary_color
  if (text_color !== undefined) updates.text_color = text_color
  if (design_theme !== undefined) updates.design_theme = design_theme
  if (description !== undefined) updates.description = description
  if (custom_domain !== undefined) updates.custom_domain = custom_domain || null
  if (reminder_text !== undefined) updates.reminder_text = reminder_text || null
  if (code_lifetime_days !== undefined) updates.code_lifetime_days = Math.max(1, Number(code_lifetime_days) || 14)
  // Пароль меняет только владелец (не управляющий) и только когда реально прислано новое значение.
  if (owner_password && actor.role === 'owner') updates.owner_password = owner_password

  const { data, error } = await supabase.from('businesses').update(updates).eq('id', business.id).select(PUBLIC_FIELDS).single()
  if (error) return res.status(500).json({ error: 'Не удалось загрузить настройки бренда.' })
  return res.status(200).json(data)
}
