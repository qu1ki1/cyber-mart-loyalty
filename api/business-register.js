// api/business-register.js
//
// POST /api/business-register
//   Регистрация: { init_data, name, login, owner_password }
//   Восстановление пароля: { action: 'recover', login }
//
// Восстановление не требует Telegram-подписи — новый пароль
// уходит владельцу в бот.

import { createClient } from '@supabase/supabase-js'
import { getVerifiedUser } from '../lib/verifyTelegram.js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

function slugify(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яё\s-]/gi, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function generatePassword() {
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

const DEFAULT_GIFTS = [
  { name: '+30 минут', chance: 40, icon: 'clock', rarity: 'common', active: true },
  { name: '+1 час', chance: 20, icon: 'clockBig', rarity: 'uncommon', active: true },
  { name: 'Подарок', chance: 20, icon: 'cup', rarity: 'rare', active: true },
  { name: 'Скидка 10%', chance: 15, icon: 'percent', rarity: 'epic', active: true },
  { name: 'Джекпот', chance: 5, icon: 'star', rarity: 'legendary', active: true },
]

async function handleRecover(req, res) {
  const login = (req.body?.login || '').trim().toLowerCase()
  if (!login) return res.status(400).json({ error: 'Укажи логин (slug бизнеса)' })

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, slug')
    .ilike('slug', login)
    .maybeSingle()

  const genericOk = {
    ok: true,
    message: 'Если такой бизнес есть и у него есть владелец в Telegram — новый пароль отправлен ему в бот.',
  }

  if (!business) return res.status(200).json(genericOk)

  const { data: owner } = await supabase
    .from('admins')
    .select('telegram_id')
    .eq('business_id', business.id)
    .eq('role', 'owner')
    .maybeSingle()

  if (!owner?.telegram_id) return res.status(200).json(genericOk)

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
}

async function handleRegister(req, res) {
  const verified = getVerifiedUser(req)
  if (!verified) return res.status(401).json({ error: 'Не удалось подтвердить, что это ты. Перезапусти приложение.' })
  const telegramId = verified.id

  const { name, login, owner_password } = req.body || {}
  if (!name) return res.status(400).json({ error: 'Укажи название бизнеса' })
  if (!login) return res.status(400).json({ error: 'Укажи логин' })
  if (!owner_password || owner_password.length < 4) {
    return res.status(400).json({ error: 'Пароль слишком короткий (минимум 4 символа)' })
  }

  const slug = slugify(login)
  if (!slug) return res.status(400).json({ error: 'Логин должен содержать буквы или цифры' })

  const { data: taken } = await supabase.from('businesses').select('id').ilike('slug', slug).maybeSingle()
  if (taken) return res.status(409).json({ error: `Логин «${slug}» уже занят, придумай другой` })

  const { data: business, error } = await supabase.from('businesses').insert({ name, slug, owner_password }).select().single()
  if (error) throw error

  await supabase.from('gifts').insert(DEFAULT_GIFTS.map((g) => ({ ...g, business_id: business.id })))
  await supabase.from('admins').insert({ business_id: business.id, telegram_id: telegramId, role: 'owner' })

  return res.status(200).json({ id: business.id, slug: business.slug, name: business.name })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Метод не поддерживается' })

  try {
    if (req.body?.action === 'recover') {
      return await handleRecover(req, res)
    }
    return await handleRegister(req, res)
  } catch (err) {
    console.error(err)
    return res.status(500).json({
      error: req.body?.action === 'recover'
        ? 'Не удалось восстановить доступ. Попробуй ещё раз.'
        : 'Не удалось создать бизнес. Попробуй ещё раз чуть позже.',
    })
  }
}