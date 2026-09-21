import { getInitData } from './telegramAuth'

const SLUG_KEY = 'loyaltyBizSlug'
const PASSWORD_KEY = 'loyaltyBizPassword'

// localStorage — чтобы после регистрации/входа не нужно было логиниться
// каждый раз (даже после закрытия браузера). Только при входе с нового
// устройства / очистке данных потребуется пароль снова.
export function setWebSession(slug: string, password: string) {
  try {
    localStorage.setItem(SLUG_KEY, slug)
    localStorage.setItem(PASSWORD_KEY, password)
  } catch {
    // private mode / blocked storage
  }
  // дублируем в sessionStorage на случай, если localStorage недоступен
  try {
    sessionStorage.setItem(SLUG_KEY, slug)
    sessionStorage.setItem(PASSWORD_KEY, password)
  } catch {}
}

export function clearWebSession() {
  try {
    localStorage.removeItem(SLUG_KEY)
    localStorage.removeItem(PASSWORD_KEY)
  } catch {}
  try {
    sessionStorage.removeItem(SLUG_KEY)
    sessionStorage.removeItem(PASSWORD_KEY)
  } catch {}
}

export function getWebSession(): { slug: string; password: string } | null {
  try {
    const slug = localStorage.getItem(SLUG_KEY) || sessionStorage.getItem(SLUG_KEY)
    const password = localStorage.getItem(PASSWORD_KEY) || sessionStorage.getItem(PASSWORD_KEY)
    return slug && password ? { slug, password } : null
  } catch {
    return null
  }
}

// Поля, которые нужно добавить в любой запрос к защищённому эндпоинту.
// В мини-аппе (Telegram) — подпись initData. На странице входа с
// компьютера (без Telegram) — пароль владельца, который эндпоинты
// проверяют через lib/verifyTelegram.js → resolveActor.
export function getAuthFields(): Record<string, string> {
  const session = getWebSession()
  if (session) return { password: session.password }
  return { init_data: getInitData() }
}

// То же самое, но сразу готовой строкой для GET-запросов:
// "init_data=..." или "password=...".
export function authQueryString(): string {
  const session = getWebSession()
  if (session) return `password=${encodeURIComponent(session.password)}`
  return `init_data=${encodeURIComponent(getInitData())}`
}
