import { motion } from "framer-motion"

export default function OnboardingProgress({ answered = 0, total = 0 }) {
  const safeTotal = Math.max(total, 1)
  const progress = Math.min(Math.round((answered / safeTotal) * 100), 100)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Progress</span>
        <span>
          {answered} of {safeTotal}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-primary to-sky-500"
        />
      </div>
    </div>
  )
}
