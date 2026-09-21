// api/team.js
// POST   /api/team  { init_data, slug, role }        -> создать приглашение (owner only)
// GET    /api/team?init_data=...&slug=Y                -> список команды (owner only)
// DELETE /api/team  { init_data, slug, admin_id }        -> убрать доступ (owner only)

import { createClient } from '@supabase/supabase-js'
import { resolveActor } from '../lib/verifyTelegram.js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

function genCode() {
  return Math.random().toString(36).slice(2, 8)
}

async function requireOwner(req, slug) {
  const { data: business } = await supabase.from('businesses').select('id, owner_password').ilike('slug', slug).maybeSingle()
  if (!business) return { error: 'Бизнес не найден' }

  const actor = await resolveActor(req, supabase, business)
  if (!actor || actor.role !== 'owner') return { error: 'Только владелец может управлять командой' }
  return { businessId: business.id }
}

export default async function handler(req, res) {
  const slug = req.method === 'GET' ? req.query.slug : req.body?.slug
  if (!slug) return res.status(400).json({ error: 'Не хватает данных' })

  const resolved = await requireOwner(req, slug)
  if (resolved.error) return res.status(403).json({ error: resolved.error })

  if (req.method === 'GET') {
    const { data: admins, error } = await supabase
      .from('admins')
      .select('id, telegram_id, role, added_at')
      .eq('business_id', resolved.businessId)
      .neq('role', 'owner')
      .order('added_at', { ascending: false })

    if (error) return res.status(500).json({ error: 'Не удалось загрузить команду.' })

    const telegramIds = admins.map((a) => a.telegram_id)
    const { data: users } = await supabase
      .from('users')
      .select('telegram_id, first_name, username')
      .eq('business_id', resolved.businessId)
      .in('telegram_id', telegramIds.length ? telegramIds : [0])

    const userMap = new Map((users || []).map((u) => [u.telegram_id, u]))
    const result = admins.map((a) => {
      const u = userMap.get(a.telegram_id)
      return { id: a.id, role: a.role, added_at: a.added_at, name: u?.first_name || (u?.username ? '@' + u.username : `ID ${a.telegram_id}`) }
    })

    return res.status(200).json(result)
  }

  if (req.method === 'POST') {
    const { role } = req.body || {}
    if (!['manager', 'staff'].includes(role)) return res.status(400).json({ error: 'Некорректные данные' })

    const code = genCode()
    const { error } = await supabase.from('invites').insert({ business_id: resolved.businessId, role, code })
    if (error) return res.status(500).json({ error: 'Не удалось создать приглашение.' })

    return res.status(200).json({ code })
  }

  if (req.method === 'DELETE') {
    const { admin_id } = req.body || {}
    if (!admin_id) return res.status(400).json({ error: 'Не указан сотрудник' })

    const { error } = await supabase.from('admins').delete().eq('id', admin_id).eq('business_id', resolved.businessId)
    if (error) return res.status(500).json({ error: 'Не удалось убрать доступ.' })

    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'Метод не поддерживается' })
}
