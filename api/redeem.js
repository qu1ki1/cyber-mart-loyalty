// api/redeem.js
//
// Погашение кода администратором клуба.
// Требует ADMIN_PASSWORD или DEV_PASSWORD (любой из двух подходит для гашения —
// разница между уровнями только в доступе к настройке призов и полному журналу).
//
// POST /api/redeem  { code, password }

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не поддерживается' })
  }

  const { code, password } = req.body || {}
  const validPasswords = [process.env.ADMIN_PASSWORD, process.env.DEV_PASSWORD].filter(Boolean)

  if (!password || !validPasswords.includes(password)) {
    return res.status(401).json({ error: 'Неверный пароль администратора' })
  }

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Не указан код' })
  }

  try {
    const { data: win, error } = await supabase.from('winners').select('*').eq('code', code.trim().toUpperCase()).maybeSingle()

    if (error) throw error
    if (!win) {
      return res.status(404).json({ error: 'Код не найден' })
    }
    if (win.redeemed) {
      return res.status(409).json({ error: 'Этот код уже был погашен ранее' })
    }
    if (win.expires_at && new Date(win.expires_at) < new Date()) {
      return res.status(410).json({ error: 'Срок действия кода истёк' })
    }

    const { data: guest } = await supabase.from('users').select('username, first_name').eq('telegram_id', win.telegram_id).maybeSingle()

    const { error: updateError } = await supabase
      .from('winners')
      .update({ redeemed: true, redeemed_at: new Date().toISOString() })
      .eq('id', win.id)

    if (updateError) throw updateError

    return res.status(200).json({
      gift_name: win.gift_name,
      guest_name: guest?.first_name || (guest?.username ? '@' + guest.username : 'Гость'),
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message || 'Внутренняя ошибка' })
  }
}
