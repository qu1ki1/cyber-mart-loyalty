export type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
};


export function getTelegramUser(): TelegramUser | null {

  const tg = window.Telegram?.WebApp;


  if (!tg) {
    console.warn("Telegram WebApp not found");
    return null;
  }


  const user = tg.initDataUnsafe?.user;


  if (!user) {
    console.warn("Telegram user not found");
    return null;
  }


  return {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    username: user.username,
    language_code: user.language_code,
  };

}