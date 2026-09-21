// api/invite.js
// POST /api/invite  { telegram_id, slug, role }  -> создать приглашение (owner only)

import { createClient } from '@supabase/supabase-js'
import { getVerifiedUser } from '../lib/verifyTelegram.js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

function genCode() {
  return Math.random().toString(36).slice(2, 8)
}

async function requireOwner(telegramId, slug) {
  const { data: business } = await supabase.from('businesses').select('id').ilike('slug', slug).maybeSingle()
  if (!business) return { error: 'Бизнес не найден' }

  const { data: admin } = await supabase
    .from('admins')
    .select('role')
    .eq('business_id', business.id)
    .eq('telegram_id', telegramId)
    .maybeSingle()

  if (!admin || admin.role !== 'owner') return { error: 'Только владелец может приглашать сотрудников' }
  return { businessId: business.id }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Метод не поддерживается' })

  const verified = getVerifiedUser(req)
  if (!verified) return res.status(401).json({ error: 'Не удалось подтвердить, что это ты. Перезапусти приложение.' })
  const telegramId = verified.id

  const { slug, role } = req.body || {}
  if (!slug || !['manager', 'staff'].includes(role)) {
    return res.status(400).json({ error: 'Некорректные данные' })
  }

  const resolved = await requireOwner(telegramId, slug)
  if (resolved.error) return res.status(403).json({ error: resolved.error })

  const code = genCode()
  const { error } = await supabase.from('invites').insert({ business_id: resolved.businessId, role, code })
  if (error) return res.status(500).json({ error: 'Не удалось создать приглашение.' })

  return res.status(200).json({ code })
}
