import { motion } from 'framer-motion'
import { CaseMark } from './Icon'

export default function CaseBox({ opening }: { opening: boolean }) {
  return (
    <motion.div
      className="case-thumb"
      animate={opening ? { rotate: [0, -7, 7, -4, 0], scale: [1, 1.08, 1] } : { y: [0, -8, 0], rotate: [0, 1.5, 0] }}
      transition={opening ? { duration: 0.8, repeat: Infinity } : { duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <CaseMark />
    </motion.div>
  )
}
