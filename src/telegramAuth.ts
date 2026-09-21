// Telegram подписывает initData сам при запуске мини-аппа — отправляем
// её на сервер вместе с каждым запросом, а сервер сам проверяет подпись
// и достаёт настоящий telegram_id (lib/verifyTelegram.js). Это не даёт
// подделать чужой telegram_id через devtools.
export function getInitData(): string {
  return window.Telegram?.WebApp?.initData || ''
}
