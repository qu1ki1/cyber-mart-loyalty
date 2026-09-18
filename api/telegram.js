import TelegramBot from "node-telegram-bot-api";
import { createClient } from "@supabase/supabase-js";

const bot = new TelegramBot(process.env.BOT_TOKEN);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {

  const message = req.body?.message;

  if (!message) {
    return res.status(200).json({ ok: true });
  }

  const chatId = message.chat.id;

  if (message.text === "/start") {

    await supabase
      .from("users")
      .insert({
        telegram_id: chatId,
        username: message.from.username,
        first_name: message.from.first_name
      });


    await bot.sendMessage(
      chatId,
      "🎮 CYBER MART\n\nТвой подарок за визит 👇",
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🎁 Получить подарок",
                web_app: {
                  url: "https://cyber-mart-loyalty.vercel.app"
                }
              }
            ]
          ]
        }
      }
    );
  }


  res.status(200).json({
    ok:true
  });

}
