export type IconKey = 'clock' | 'clockBig' | 'cup' | 'percent' | 'star'

export function Icon({ icon, className }: { icon: IconKey; className?: string }) {
  switch (icon) {
    case 'clock':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M12 21a9 9 0 100-18 9 9 0 000 18z" stroke="currentColor" strokeWidth={1.6} />
          <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
        </svg>
      )
    case 'clockBig':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M12 21a9 9 0 100-18 9 9 0 000 18z" stroke="currentColor" strokeWidth={1.6} />
          <path d="M12 6.5v5.5l4 2.5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
        </svg>
      )
    case 'cup':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M7 4h10l-1.7 13.6a3 3 0 01-3 2.4h-.6a3 3 0 01-3-2.4L7 4z"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinejoin="round"
          />
          <path d="M8.5 9.5c1.2 1 2.3 1.4 3.5 1.4s2.3-.4 3.5-1.4" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" />
        </svg>
      )
    case 'percent':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="7.5" cy="7.5" r="2.2" stroke="currentColor" strokeWidth={1.6} />
          <circle cx="16.5" cy="16.5" r="2.2" stroke="currentColor" strokeWidth={1.6} />
          <path d="M17 6L6 18" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
        </svg>
      )
    case 'star':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M12 2.5l2.6 6.1 6.4.6-4.9 4.3 1.5 6.3L12 16.6 6.4 19.8l1.5-6.3-4.9-4.3 6.4-.6L12 2.5z"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
        </svg>
      )
  }
}

// The case thumbnail always shows this gift-box mark, regardless of the reward.
export function CaseMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" />
      <path d="M12 2V22M3 7L12 12L21 7" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" />
    </svg>
  )
}
