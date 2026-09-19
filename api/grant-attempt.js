// api/grant-attempt.js
//
// Выдача бонусной попытки гостю по username (без telegram_id — его никто
// не помнит наизусть). Работает только если гость хотя бы раз открывал
// мини-апп — тогда его username уже сохранён в таблице users.
//
// POST /api/grant-attempt  { username, count, password }

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не поддерживается' })
  }

  const { username, count, password } = req.body || {}
  const validPasswords = [process.env.ADMIN_PASSWORD, process.env.DEV_PASSWORD].filter(Boolean)

  if (!password || !validPasswords.includes(password)) {
    return res.status(401).json({ error: 'Неверный пароль администратора' })
  }

  const cleanUsername = (username || '').trim().replace(/^@/, '')
  const grantCount = Math.max(1, Number(count) || 1)

  if (!cleanUsername) {
    return res.status(400).json({ error: 'Укажи username гостя' })
  }

  try {
    const { data: guest, error } = await supabase
      .from('users')
      .select('telegram_id, username, first_name, bonus_attempts')
      .ilike('username', cleanUsername)
      .maybeSingle()

    if (error) throw error

    if (!guest) {
      return res.status(404).json({
        error: `Гость с username @${cleanUsername} не найден. Возможно, он ни разу не открывал мини-апп, или у него не задан username в Telegram — в этом случае попроси показать профиль и попробуй другой способ.`,
      })
    }

    const newTotal = (guest.bonus_attempts || 0) + grantCount

    const { error: updateError } = await supabase
      .from('users')
      .update({ bonus_attempts: newTotal })
      .eq('telegram_id', guest.telegram_id)

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
