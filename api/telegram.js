// api/telegram.js
//
// Вебхук бота. QR в заведении ведёт на t.me/<bot>?start=<slug> — Telegram
// присылает этот slug сюда в тексте команды /start, мы вшиваем его в
// адрес мини-аппа как ?biz=<slug>, а клиент (src/App.tsx) читает его
// оттуда, чтобы понять, для какого бизнеса открылось приложение.

const APP_URL = process.env.APP_URL || 'https://cyber-mart-loyalty.vercel.app'

export default async function handler(req, res) {
  try {
    const body = req.body

    if (body.message) {
      const chatId = body.message.chat.id
      const text = body.message.text || ''
      const parts = text.split(' ')
      const payload = parts.length > 1 ? parts[1].trim() : ''

      // Формат реферальной ссылки: <slug>-ref-<telegram_id пригласившего>
      const refMatch = payload.match(/^(.+)-ref-(\d+)$/)
      const slug = refMatch ? refMatch[1] : payload
      const ref = refMatch ? refMatch[2] : ''

      const appUrl = slug
        ? `${APP_URL}/?biz=${encodeURIComponent(slug)}${ref ? `&ref=${encodeURIComponent(ref)}` : ''}`
        : APP_URL

      await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: slug ? '🎮 LOYALTY\n\nТвой подарок за визит 👇' : '🎮 LOYALTY\n\nОтсканируй QR в заведении, чтобы открыть игру.',
          reply_markup: slug
            ? {
                inline_keyboard: [[{ text: '🎁 Получить подарок', web_app: { url: appUrl } }]],
              }
            : undefined,
        }),
      })
    }

    return res.status(200).json({ ok: true })
  } catch (e) {
    console.log(e)
    return res.status(500).json({ error: e.message })
  }
}
