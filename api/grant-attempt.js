// api/grant-attempt.js
// POST /api/grant-attempt  { username, count, slug, password }

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не поддерживается' })
  }

  const { username, count, slug, password } = req.body || {}
  if (!slug || !password) return res.status(400).json({ error: 'Укажи бизнес и пароль' })

  const cleanUsername = (username || '').trim().replace(/^@/, '')
  const grantCount = Math.max(1, Number(count) || 1)
  if (!cleanUsername) return res.status(400).json({ error: 'Укажи username гостя' })

  try {
    const { data: business } = await supabase
      .from('businesses')
      .select('id, owner_password, manager_password')
      .ilike('slug', slug)
      .maybeSingle()

    const validPasswords = [business?.owner_password, business?.manager_password].filter(Boolean)
    if (!business || !validPasswords.includes(password)) {
      return res.status(401).json({ error: 'Неверный пароль администратора' })
    }

    const { data: guest, error } = await supabase
      .from('users')
      .select('telegram_id, username, first_name, bonus_attempts')
      .eq('business_id', business.id)
      .ilike('username', cleanUsername)
      .maybeSingle()

    if (error) throw error
    if (!guest) {
      return res.status(404).json({
        error: `Гость с username @${cleanUsername} не найден среди тех, кто уже открывал ваш мини-апп.`,
      })
    }

    const newTotal = (guest.bonus_attempts || 0) + grantCount
    const { error: updateError } = await supabase
      .from('users')
      .update({ bonus_attempts: newTotal })
      .eq('telegram_id', guest.telegram_id)
      .eq('business_id', business.id)
    if (updateError) throw updateError

    return res.status(200).json({
      guest_name: guest.first_name || `@${guest.username}`,
      granted: grantCount,
      total_bonus_attempts: newTotal,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message || 'Внутренняя ошибка' })
  }
}
