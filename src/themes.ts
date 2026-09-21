// src/themes.ts
// 10 дизайн-тем из ТЗ. Каждая — набор CSS-переменных, применяется
// в App.tsx поверх текущей вёрстки (структура экранов не меняется,
// меняются только цвета/шрифт/фон).

export type ThemeKey =
  | 'neon_gaming'
  | 'luxury'
  | 'coffee'
  | 'beauty'
  | 'fitness'
  | 'kids'
  | 'fashion'
  | 'auto'
  | 'restaurant'
  | 'universal'

type ThemeVars = {
  '--bg': string
  '--neon': string
  '--neon-soft': string
  '--cyan': string
  '--ink': string
  '--muted': string
  '--line': string
  '--line-dim': string
  font: string // Google Fonts family name, используется в index.html подключённых шрифтах
}

export const THEMES: Record<ThemeKey, ThemeVars> = {
  neon_gaming: {
    '--bg': '#050607',
    '--neon': '#39ff8a',
    '--neon-soft': 'rgba(57,255,138,0.5)',
    '--cyan': '#3ce6ff',
    '--ink': '#eef7f0',
    '--muted': '#7c8b81',
    '--line': 'rgba(57,255,120,0.28)',
    '--line-dim': 'rgba(57,255,120,0.12)',
    font: 'Rajdhani',
  },
  luxury: {
    '--bg': '#0a0806',
    '--neon': '#e8c26a',
    '--neon-soft': 'rgba(232,194,106,0.45)',
    '--cyan': '#f4e4c1',
    '--ink': '#f5f0e6',
    '--muted': '#9c9184',
    '--line': 'rgba(232,194,106,0.3)',
    '--line-dim': 'rgba(232,194,106,0.12)',
    font: 'Cormorant Garamond',
  },
  coffee: {
    '--bg': '#1c140f',
    '--neon': '#c8874a',
    '--neon-soft': 'rgba(200,135,74,0.45)',
    '--cyan': '#e8b877',
    '--ink': '#f2e8dd',
    '--muted': '#a08a76',
    '--line': 'rgba(200,135,74,0.3)',
    '--line-dim': 'rgba(200,135,74,0.12)',
    font: 'Rajdhani',
  },
  beauty: {
    '--bg': '#140a12',
    '--neon': '#ff8fc9',
    '--neon-soft': 'rgba(255,143,201,0.45)',
    '--cyan': '#ffc1e0',
    '--ink': '#fbe9f4',
    '--muted': '#a5859c',
    '--line': 'rgba(255,143,201,0.3)',
    '--line-dim': 'rgba(255,143,201,0.12)',
    font: 'Rajdhani',
  },
  fitness: {
    '--bg': '#0a0e08',
    '--neon': '#c6ff3f',
    '--neon-soft': 'rgba(198,255,63,0.45)',
    '--cyan': '#7dffb0',
    '--ink': '#f0fbe6',
    '--muted': '#899480',
    '--line': 'rgba(198,255,63,0.3)',
    '--line-dim': 'rgba(198,255,63,0.12)',
    font: 'Rajdhani',
  },
  kids: {
    '--bg': '#0e1420',
    '--neon': '#ffb84d',
    '--neon-soft': 'rgba(255,184,77,0.45)',
    '--cyan': '#5ec9ff',
    '--ink': '#f5f7ff',
    '--muted': '#8b93a8',
    '--line': 'rgba(255,184,77,0.3)',
    '--line-dim': 'rgba(255,184,77,0.12)',
    font: 'Rajdhani',
  },
  fashion: {
    '--bg': '#0c0c0c',
    '--neon': '#ffffff',
    '--neon-soft': 'rgba(255,255,255,0.35)',
    '--cyan': '#d4d4d4',
    '--ink': '#ffffff',
    '--muted': '#8a8a8a',
    '--line': 'rgba(255,255,255,0.22)',
    '--line-dim': 'rgba(255,255,255,0.1)',
    font: 'Rajdhani',
  },
  auto: {
    '--bg': '#0a0d10',
    '--neon': '#ff3b3b',
    '--neon-soft': 'rgba(255,59,59,0.45)',
    '--cyan': '#8a97a6',
    '--ink': '#f0f2f4',
    '--muted': '#7d8894',
    '--line': 'rgba(255,59,59,0.3)',
    '--line-dim': 'rgba(255,59,59,0.12)',
    font: 'Rajdhani',
  },
  restaurant: {
    '--bg': '#170d0a',
    '--neon': '#e0a44d',
    '--neon-soft': 'rgba(224,164,77,0.45)',
    '--cyan': '#ff8a5c',
    '--ink': '#f7ece0',
    '--muted': '#a08a76',
    '--line': 'rgba(224,164,77,0.3)',
    '--line-dim': 'rgba(224,164,77,0.12)',
    font: 'Rajdhani',
  },
  universal: {
    '--bg': '#08090c',
    '--neon': '#5b8def',
    '--neon-soft': 'rgba(91,141,239,0.45)',
    '--cyan': '#8fc4ff',
    '--ink': '#eef1f7',
    '--muted': '#818a99',
    '--line': 'rgba(91,141,239,0.3)',
    '--line-dim': 'rgba(91,141,239,0.12)',
    font: 'Rajdhani',
  },
}

export const THEME_LABELS: Record<ThemeKey, string> = {
  neon_gaming: 'Neon Gaming',
  luxury: 'Luxury',
  coffee: 'Coffee',
  beauty: 'Beauty',
  fitness: 'Fitness',
  kids: 'Kids',
  fashion: 'Fashion',
  auto: 'Auto',
  restaurant: 'Restaurant',
  universal: 'Universal',
}

export function applyTheme(
  themeKey: string | null | undefined,
  accentColor?: string | null,
  textColor?: string | null
) {
  const theme = THEMES[(themeKey as ThemeKey) || 'neon_gaming'] || THEMES.neon_gaming
  const root = document.documentElement.style
  root.setProperty('--bg', theme['--bg'])
  root.setProperty('--neon', accentColor || theme['--neon'])
  root.setProperty('--neon-soft', theme['--neon-soft'])
  root.setProperty('--cyan', theme['--cyan'])
  root.setProperty('--ink', textColor || theme['--ink'])
  root.setProperty('--muted', theme['--muted'])
  root.setProperty('--line', theme['--line'])
  root.setProperty('--line-dim', theme['--line-dim'])
  document.body.style.background = theme['--bg']
}
