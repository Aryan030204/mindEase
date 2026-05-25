import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export default function OnboardingOptionCard({ text, selected, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      type="button"
      className={cn(
        "w-full rounded-2xl border px-4 py-4 text-left text-sm font-medium transition",
        selected
          ? "border-primary bg-primary/10 text-foreground shadow-md"
          : "border-border bg-white/70 text-muted-foreground hover:border-primary/40 hover:text-foreground"
      )}
    >
      {text}
    </motion.button>
  )
}
