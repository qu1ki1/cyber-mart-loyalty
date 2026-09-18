export {}

declare global {
  interface TelegramWebAppUser {
    id: number
    first_name: string
    last_name?: string
    username?: string
    language_code?: string
  }

  interface TelegramHapticFeedback {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void
    selectionChanged: () => void
  }

  interface TelegramWebApp {
    ready: () => void
    expand: () => void
    close: () => void
    setHeaderColor: (color: string) => void
    setBackgroundColor: (color: string) => void
    initDataUnsafe: {
      user?: TelegramWebAppUser
    }
    HapticFeedback: TelegramHapticFeedback
    themeParams: Record<string, string>
  }

  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}
