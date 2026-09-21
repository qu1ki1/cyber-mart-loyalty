// api/recover.js
//
// POST /api/recover  { login: "cybermart00" }
//
// Восстановление логина/пароля владельца:
// 1. Находим бизнес по slug (логин)
// 2. Находим владельца в admins (role = owner)
// 3. Генерируем новый пароль, сохраняем в businesses.owner_password
// 4. Отправляем логин + новый пароль владельцу в Telegram

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

function generatePassword() {
  // 8 символов: буквы + цифры, без путаницы 0/O, 1/l
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let out = ''
  for (let i = 0; i < 8; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

async function sendTelegram(chatId, text) {
  const token = process.env.BOT_TOKEN
  if (!token) throw new Error('BOT_TOKEN не настроен')
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error('Не удалось отправить сообщение в Telegram: ' + body)
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Метод не поддерживается' })

  const login = (req.body?.login || '').trim().toLowerCase()
  if (!login) return res.status(400).json({ error: 'Укажи логин (slug бизнеса)' })

  try {
    const { data: business } = await supabase
      .from('businesses')
      .select('id, name, slug')
      .ilike('slug', login)
      .maybeSingle()

    if (!business) {
      // Не раскрываем, существует ли логин — одна и та же формулировка
      return res.status(200).json({
        ok: true,
        message: 'Если такой бизнес есть и у него есть владелец в Telegram — новый пароль отправлен ему в бот.',
      })
    }

    const { data: owner } = await supabase
      .from('admins')
      .select('telegram_id')
      .eq('business_id', business.id)
      .eq('role', 'owner')
      .maybeSingle()

    if (!owner?.telegram_id) {
      return res.status(200).json({
        ok: true,
        message: 'Если такой бизнес есть и у него есть владелец в Telegram — новый пароль отправлен ему в бот.',
      })
    }

    const newPassword = generatePassword()

    const { error: updateError } = await supabase
      .from('businesses')
      .update({ owner_password: newPassword })
      .eq('id', business.id)

    if (updateError) throw updateError

    await sendTelegram(
      owner.telegram_id,
      `🔐 Восстановление доступа к LOYALTY\n\n` +
        `Бизнес: ${business.name}\n` +
        `Логин: ${business.slug}\n` +
        `Новый пароль: ${newPassword}\n\n` +
        `Войди в личный кабинет с этими данными. Старый пароль больше не действует.`
    )

    return res.status(200).json({
      ok: true,
      message: 'Новый пароль отправлен владельцу в Telegram. Проверь сообщения от бота.',
    })
  } catch (err) {
    console.error('RECOVER ERROR:', err)
    return res.status(500).json({ error: 'Не удалось восстановить доступ. Попробуй ещё раз.' })
  }
}
