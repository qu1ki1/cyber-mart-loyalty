import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);


export default async function handler(req, res) {

  try {

    const message = req.body?.message;

    if (!message) {
      return res.status(200).json({
        ok: true
      });
    }


    const chatId = message.chat.id;


    await supabase
      .from("users")
      .upsert(
        {
          telegram_id: chatId,
          username: message.from?.username || null,
          first_name: message.from?.first_name || null,
          attempts: 1
        },
        {
          onConflict: "telegram_id"
        }
      );


    if (message.text === "/start") {

      await fetch(
        `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            chat_id: chatId,
            text:
              "🎮 CYBER MART\n\nТвой подарок за визит 👇",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "🎁 Получить подарок",
                    web_app: {
                      url:
                        "https://cyber-mart-loyalty.vercel.app"
                    }
                  }
                ]
              ]
            }
          })
        }
      );

    }


    return res.status(200).json({
      ok:true
    });


  } catch(error){

    console.log(error);

    return res.status(500).json({
      ok:false,
      error:error.message
    });

  }

}
