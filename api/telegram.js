import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_KEY
)

export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(200).send('OK')
  }


  const update = req.body


  if (update.message?.text === '/start') {

    const user = update.message.from


    await supabase
      .from('users')
      .upsert(
        {
          telegram_id: user.id,
          first_name: user.first_name || '',
          username: user.username || ''
        },
        {
          onConflict: 'telegram_id'
        }
      )


    await fetch(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type':'application/json'
        },
        body: JSON.stringify({
          chat_id: update.message.chat.id,
          text:
          "🎮 CYBER MART\n\nТвой подарок за визит 👇",
          reply_markup:{
            inline_keyboard:[
              [
                {
                  text:"🎁 Получить подарок",
                  web_app:{
                    url:"https://cyber-mart-loyalty.vercel.app"
                  }
                }
              ]
            ]
          }
        })
      }
    )

  }


  return res.status(200).json({ok:true})
}