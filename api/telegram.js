export default function handler(req, res) {
  console.log("Telegram API works");

  res.status(200).json({
    ok: true,
    message: "Telegram webhook ready"
  });
}