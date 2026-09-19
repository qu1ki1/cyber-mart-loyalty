import { motion } from 'framer-motion'

export default function CaseBox({ opening }: { opening: boolean }) {
  return (
    <motion.div
      className="case-thumb"
      animate={opening ? { rotate: [0, -7, 7, -4, 0], scale: [1, 1.08, 1] } : { y: [0, -10, 0] }}
      transition={opening ? { duration: 0.8, repeat: Infinity } : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div className="case-glow" />
      <div className="case-front">
        <svg viewBox="0 0 100 100" fill="none">
          <path d="M20 35L50 18L80 35V70L50 86L20 70V35Z" stroke="currentColor" strokeWidth="3" />
          <path d="M50 18V86" stroke="currentColor" strokeWidth="3" />
          <path d="M20 35L50 52L80 35" stroke="currentColor" strokeWidth="3" />
          <rect x="42" y="42" width="16" height="18" rx="3" stroke="currentColor" strokeWidth="3" />
        </svg>
      </div>
      <div className="case-light" />
    </motion.div>
  )
}
