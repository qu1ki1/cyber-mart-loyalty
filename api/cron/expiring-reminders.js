// api/cron/expiring-reminders.js
//
// Запускается раз в день (см. vercel.json → crons). Находит все
// непогашенные подарки, у которых до истечения срока осталось
// меньше 24 часов, и шлёт гостю напоминание в Telegram.
//
// Защита: Vercel сам добавляет заголовок авторизации при вызове по
// расписанию, но чтобы никто посторонний не мог дёргать этот урл
// вручную и спамить гостей, дополнительно проверяем секрет.

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

export default async function handler(req, res) {
  const auth = req.headers['authorization']
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const now = new Date()
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    const { data: expiring, error } = await supabase
      .from('winners')
      .select('id, telegram_id, gift_name, expires_at, business_id, reminded')
      .eq('redeemed', false)
      .eq('reminded', false)
      .lte('expires_at', in24h.toISOString())
      .gte('expires_at', now.toISOString())

    if (error) throw error
    if (!expiring || expiring.length === 0) {
      return res.status(200).json({ sent: 0 })
    }

    let sent = 0
    for (const win of expiring) {
      const { data: business } = await supabase.from('businesses').select('name, slug, reminder_text').eq('id', win.business_id).maybeSingle()
      if (!business) continue

      const appUrl = `${process.env.APP_URL || ''}/?biz=${encodeURIComponent(business.slug)}`
      const text = business.reminder_text
        ? business.reminder_text.replace('{gift}', win.gift_name)
        : `⏳ ${business.name}\n\nПоследний день действия подарка «${win.gift_name}» — не забудь забрать!`

      try {
        await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: win.telegram_id,
            text,
            reply_markup: { inline_keyboard: [[{ text: 'Открыть приложение', web_app: { url: appUrl } }]] },
          }),
        })
        await supabase.from('winners').update({ reminded: true }).eq('id', win.id)
        sent++
      } catch (sendErr) {
        console.error('Failed to remind', win.id, sendErr)
      }
    }

    const winBackSent = await sendWinBackMessages()

    return res.status(200).json({ sent, win_back_sent: winBackSent })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Не удалось выполнить рассылку.' })
  }
}

// "После отсутствия": гость не заходил 14+ дней и ему ещё не слали
// win-back сообщение с момента его последнего визита.
async function sendWinBackMessages() {
  const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()

  const { data: dormant, error } = await supabase
    .from('users')
    .select('telegram_id, business_id, last_spin_at, winback_sent_at')
    .lte('last_spin_at', cutoff)
    .or('winback_sent_at.is.null,winback_sent_at.lt.last_spin_at')

  if (error || !dormant) return 0

  let sent = 0
  for (const user of dormant) {
    const { data: business } = await supabase.from('businesses').select('name, slug').eq('id', user.business_id).maybeSingle()
    if (!business) continue

    const appUrl = `${process.env.APP_URL || ''}/?biz=${encodeURIComponent(business.slug)}`

    try {
      await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: user.telegram_id,
          text: `🎁 ${business.name}\n\nМы подготовили для тебя сюрприз — загляни в гости!`,
          reply_markup: { inline_keyboard: [[{ text: 'Открыть приложение', web_app: { url: appUrl } }]] },
        }),
      })
      await supabase
        .from('users')
        .update({ winback_sent_at: new Date().toISOString() })
        .eq('telegram_id', user.telegram_id)
        .eq('business_id', user.business_id)
      sent++
    } catch (sendErr) {
      console.error('Win-back failed', user.telegram_id, sendErr)
    }
  }
  return sent
}
