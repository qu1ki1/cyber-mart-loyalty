// api/telegram.js
//
// Бот теперь делает только одно: открывает мини-апп. Вся остальная логика
// (игра, касса, призы, бренд, статистика) — внутри самого приложения,
// определяется автоматически по тому, кто ты в Telegram.
//
// /start <slug>                — гость сканирует QR в заведении
// /start <slug>-ref-<id>       — гость пришёл по реферальной ссылке
// /start join-<код>            — сотрудник/управляющий переходит по
//                                 приглашению от владельца (выдано внутри
//                                 приложения, владелец просто прислал ссылку)

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const APP_URL = process.env.APP_URL || 'https://cyber-mart-loyalty.vercel.app'

async function send(chatId, text, extra = {}) {
  await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, ...extra }),
  })
}

function openAppButton(url) {
  return { reply_markup: { inline_keyboard: [[{ text: '🎁 Открыть приложение', web_app: { url } }]] } }
}

export default async function handler(req, res) {
  try {
    const body = req.body
    if (!body.message) return res.status(200).json({ ok: true })

    const chatId = body.message.chat.id
    const telegramId = body.message.from?.id || chatId
    const text = (body.message.text || '').trim()

    if (!text.startsWith('/start')) {
      // Бот больше не понимает команд в чате — всё внутри приложения.
      await send(chatId, 'Всё управление — внутри приложения 👇', openAppButton(APP_URL))
      return res.status(200).json({ ok: true })
    }

    const parts = text.split(' ')
    const payload = parts.length > 1 ? parts[1].trim() : ''

    if (!payload) {
      await send(chatId, '👋 Привет! Это LOYALTY.\n\nЕсли ты гость — отсканируй QR в заведении.\nЕсли хочешь запустить свою программу лояльности — просто открой приложение и заполни форму.', openAppButton(APP_URL))
      return res.status(200).json({ ok: true })
    }

    // ---------- приглашение сотрудника/управляющего ----------
    const joinMatch = payload.match(/^join-(.+)$/)
    if (joinMatch) {
      const code = joinMatch[1]
      const { data: invite } = await supabase.from('invites').select('*, businesses(name, slug)').eq('code', code).maybeSingle()

      if (!invite) {
        await send(chatId, 'Ссылка-приглашение не найдена или устарела.')
        return res.status(200).json({ ok: true })
      }
      if (invite.used_by) {
        await send(chatId, 'Эта ссылка уже была использована.')
        return res.status(200).json({ ok: true })
      }

      await supabase.from('admins').upsert(
        { business_id: invite.business_id, telegram_id: telegramId, role: invite.role },
        { onConflict: 'business_id,telegram_id' }
      )
      await supabase.from('invites').update({ used_by: telegramId, used_at: new Date().toISOString() }).eq('id', invite.id)

      const roleLabel = invite.role === 'manager' ? 'управляющий' : 'персонал'
      const appUrl = `${APP_URL}/?biz=${encodeURIComponent(invite.businesses.slug)}`
      await send(chatId, `✅ Готово! Ты теперь ${roleLabel} в «${invite.businesses.name}». Открой приложение 👇`, openAppButton(appUrl))
      return res.status(200).json({ ok: true })
    }

    // ---------- обычный клиентский вход (QR / реферал) ----------
    const refMatch = payload.match(/^(.+)-ref-(\d+)$/)
    const slug = refMatch ? refMatch[1] : payload
    const ref = refMatch ? refMatch[2] : ''
    const appUrl = `${APP_URL}/?biz=${encodeURIComponent(slug)}${ref ? `&ref=${encodeURIComponent(ref)}` : ''}`

    await send(chatId, '🎮 LOYALTY\n\nТвой подарок за визит 👇', openAppButton(appUrl))
    return res.status(200).json({ ok: true })
  } catch (e) {
    console.log(e)
    return res.status(500).json({ error: e.message })
  }
}
