// api/_verifyTelegram.js
//
// Telegram подписывает данные, которые мини-апп получает при запуске
// (window.Telegram.WebApp.initData), специальным HMAC-хешем на основе
// BOT_TOKEN. Проверка этой подписи — единственный надёжный способ
// убедиться, что telegram_id в запросе реально принадлежит тому,
// кто его прислал, а не подставлен вручную через devtools.
//
// Используй verifyInitData(initData) в каждом эндпоинте вместо того,
// чтобы напрямую доверять telegram_id из тела запроса.

import crypto from 'crypto'

export function verifyInitData(initData) {
  if (!initData || typeof initData !== 'string') return null

  const params = new URLSearchParams(initData)
  const hash = params.get('hash')
  if (!hash) return null
  params.delete('hash')

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n')

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(process.env.BOT_TOKEN).digest()
  const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex')

  if (computedHash !== hash) return null

  // Не даём использовать данные старше суток (initData можно перехватить и реплеить).
  const authDate = Number(params.get('auth_date') || 0)
  if (!authDate || Date.now() / 1000 - authDate > 86400) return null

  const userRaw = params.get('user')
  if (!userRaw) return null

  try {
    const user = JSON.parse(userRaw)
    return { id: user.id, first_name: user.first_name, username: user.username }
  } catch {
    return null
  }
}

// Достаёт проверенный telegram_id из тела/квери запроса. Если initData
// нет или она невалидна — возвращает null, и эндпоинт должен отказать.
export function getVerifiedUser(req) {
  const initData = req.method === 'GET' ? req.query.init_data : req.body?.init_data
  return verifyInitData(initData)
}

// Определяет "кто это" двумя способами: через Telegram (как обычно, для
// мини-аппа) или через пароль владельца (для входа с компьютера, без
// Telegram вообще). Пароль — это businesses.owner_password. Найден по
// паролю доступ всегда даёт роль owner (пароль знает только владелец).
//
// business — уже загруженная строка бизнеса (нужно business.id и
// business.owner_password), req — тот же объект запроса.
export async function resolveActor(req, supabase, business) {
  const password = req.method === 'GET' ? req.query.password : req.body?.password

  if (password) {
    if (business.owner_password && password === business.owner_password) {
      return { role: 'owner', telegramId: null }
    }
    return null
  }

  const verified = getVerifiedUser(req)
  if (!verified) return null

  const { data: admin } = await supabase
    .from('admins')
    .select('role')
    .eq('business_id', business.id)
    .eq('telegram_id', verified.id)
    .maybeSingle()

  if (!admin) return null
  return { role: admin.role, telegramId: verified.id }
}
