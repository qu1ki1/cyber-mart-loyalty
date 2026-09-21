// api/gifts.js
// GET  /api/gifts?telegram_id=X&slug=Y                      — список
// POST /api/gifts  {telegram_id, slug, name, chance}          — добавить
// PUT  /api/gifts  {telegram_id, slug, id, active?, chance?}   — изменить
// DELETE /api/gifts  {telegram_id, slug, id}                    — удалить
//
// owner и manager могут всё, staff — только смотреть.

import { createClient } from '@supabase/supabase-js'
import { resolveActor } from '../lib/verifyTelegram.js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function resolveAdmin(req, slug) {
  const { data: business } = await supabase.from('businesses').select('id, owner_password').ilike('slug', slug).maybeSingle()
  if (!business) return { error: 'Бизнес не найден' }

  const actor = await resolveActor(req, supabase, business)
  if (!actor) return { error: 'Нет доступа' }
  return { businessId: business.id, role: actor.role }
}

export default async function handler(req, res) {
  const slug = req.method === 'GET' ? req.query.slug : req.body?.slug
  if (!slug) return res.status(400).json({ error: 'Не хватает данных' })

  const resolved = await resolveAdmin(req, slug)
  if (resolved.error) return res.status(403).json({ error: resolved.error })

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('gifts').select('*').eq('business_id', resolved.businessId).order('id')
      if (error) throw error
      return res.status(200).json(data || [])
    }

    if (resolved.role === 'staff') {
      return res.status(403).json({ error: 'У персонала нет прав менять призы' })
    }

    if (req.method === 'POST') {
      const { name, chance, icon } = req.body || {}
      if (!name || !chance || chance <= 0) return res.status(400).json({ error: 'Укажи название и процент больше 0' })
      const { data, error } = await supabase
        .from('gifts')
        .insert({ business_id: resolved.businessId, name, chance, icon: icon || 'star', rarity: 'rare', active: true })
        .select()
        .single()
      if (error) throw error
      return res.status(200).json(data)
    }

    if (req.method === 'PUT') {
      const { id, active, chance, name, icon } = req.body || {}
      const updates = {}
      if (active !== undefined) updates.active = active
      if (chance !== undefined) updates.chance = chance
      if (name !== undefined) updates.name = name
      if (icon !== undefined) updates.icon = icon
      const { data, error } = await supabase
        .from('gifts')
        .update(updates)
        .eq('id', id)
        .eq('business_id', resolved.businessId)
        .select()
        .single()
      if (error) throw error
      return res.status(200).json(data)
    }

    if (req.method === 'DELETE') {
      const { id } = req.body || {}
      const { error } = await supabase.from('gifts').delete().eq('id', id).eq('business_id', resolved.businessId)
      if (error) throw error
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'Метод не поддерживается' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Не удалось выполнить действие с призами. Попробуй ещё раз.' })
  }
}
