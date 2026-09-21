// api/telegram.js
//
// Бот делает только одно: показывает ОДНУ кнопку "Открыть LOYALTY".
// Вся остальная логика — игра, касса, призы, бренд, статистика —
// внутри самого приложения, определяется автоматически по тому,
// кто ты в Telegram. Никакого текста про QR-коды тут нет и не будет —
// QR просто физически ведёт на этого бота, только и всего.

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const APP_URL = process.env.APP_URL || 'https://cyber-mart-loyalty.vercel.app'

async function send(chatId, text, url) {
  await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      reply_markup: { inline_keyboard: [[{ text: 'Открыть LOYALTY', web_app: { url } }]] },
    }),
  })
}

export default async function handler(req, res) {
  try {
    const body = req.body
    if (!body.message) return res.status(200).json({ ok: true })

    const chatId = body.message.chat.id
    const telegramId = body.message.from?.id || chatId
    const text = (body.message.text || '').trim()

    if (!text.startsWith('/start')) {
      await send(chatId, 'LOYALTY', APP_URL)
      return res.status(200).json({ ok: true })
    }

    const parts = text.split(' ')
    const payload = parts.length > 1 ? parts[1].trim() : ''

    if (!payload) {
      await send(chatId, 'LOYALTY', APP_URL)
      return res.status(200).json({ ok: true })
    }

    // ---------- приглашение сотрудника/управляющего ----------
    const joinMatch = payload.match(/^join-(.+)$/)
    if (joinMatch) {
      const code = joinMatch[1]
      const { data: invite } = await supabase.from('invites').select('*, businesses(name, slug)').eq('code', code).maybeSingle()

      if (!invite) {
        await send(chatId, 'Приглашение не найдено или устарело.', APP_URL)
        return res.status(200).json({ ok: true })
      }
      if (invite.used_by) {
        await send(chatId, 'Эта ссылка уже была использована.', APP_URL)
        return res.status(200).json({ ok: true })
      }

      await supabase.from('admins').upsert(
        { business_id: invite.business_id, telegram_id: telegramId, role: invite.role },
        { onConflict: 'business_id,telegram_id' }
      )
      await supabase.from('invites').update({ used_by: telegramId, used_at: new Date().toISOString() }).eq('id', invite.id)

      const appUrl = `${APP_URL}/?biz=${encodeURIComponent(invite.businesses.slug)}`
      await send(chatId, `Готово! Ты добавлен в «${invite.businesses.name}».`, appUrl)
      return res.status(200).json({ ok: true })
    }

    // ---------- обычный вход (клиент по ссылке заведения) ----------
    const slug = payload
    const appUrl = `${APP_URL}/?biz=${encodeURIComponent(slug)}`

    await send(chatId, 'LOYALTY', appUrl)
    return res.status(200).json({ ok: true })
  } catch (e) {
    console.log(e)
    return res.status(500).json({ error: e.message })
  }
}
