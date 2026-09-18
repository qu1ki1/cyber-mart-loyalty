import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);


export default async function handler(req, res) {

  try {

    if (req.method === "GET") {
      return res.status(200).json({
        ok:true,
        message:"Telegram webhook ready"
      });
    }


    const body = req.body;


    if (body?.message) {

      const chatId = body.message.chat.id;
      const user = body.message.from;


      await supabase
        .from("users")
        .upsert(
          {
            telegram_id: user.id,
            username: user.username || null,
            first_name: user.first_name || null
          },
          {
            onConflict:"telegram_id"
          }
        );


      await fetch(
        `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
        {
          method:"POST",
          headers:{
            "Content-Type":"application/json"
          },
          body:JSON.stringify({

            chat_id:chatId,

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
      );

    }


    return res.status(200).json({
      ok:true
    });


  } catch(e){

    console.log(e);

    return res.status(500).json({
      error:e.message
    });

  }

}
