import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/Button"
import { completeOnboardingFlow } from "@/features/onboarding/onboardingSlice"

const formatTraitValue = (value) => {
  if (typeof value === "number") {
    return value.toFixed(1)
  }
  return String(value)
}

export default function OnboardingCompletePage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { profile, status } = useSelector((state) => state.onboarding)

  useEffect(() => {
    if (!profile && status !== "loading") {
      dispatch(completeOnboardingFlow())
    }
  }, [dispatch, profile, status])

  const traits = profile?.traits || {}
  const topTraits = Object.entries(traits).slice(0, 4)

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-3xl border border-white/40 bg-white/80 p-8 shadow-xl backdrop-blur"
      >
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Profile ready</p>
        <h1 className="mt-4 text-3xl font-semibold text-foreground sm:text-4xl">
          Your MindEase profile is ready
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          We will use this to personalize your emotional support and recommendations.
        </p>

        {topTraits.length > 0 && (
          <div className="mt-6 grid gap-3 text-left sm:grid-cols-2">
            {topTraits.map(([key, value]) => (
              <div
                key={key}
                className="rounded-2xl border border-border/60 bg-white/70 px-4 py-3"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {key.replace(/([A-Z])/g, " $1")}
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {formatTraitValue(value)}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button onClick={() => navigate("/dashboard")}>Go to dashboard</Button>
          <span className="text-xs text-muted-foreground">You can refine this later.</span>
        </div>
      </motion.div>
    </div>
  )
}
