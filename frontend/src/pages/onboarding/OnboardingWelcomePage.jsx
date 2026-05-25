import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/Button"
import { startOnboardingFlow, resetOnboardingState } from "@/features/onboarding/onboardingSlice"

export default function OnboardingWelcomePage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { status } = useSelector((state) => state.onboarding)

  const handleStart = async () => {
    dispatch(resetOnboardingState())
    const result = await dispatch(startOnboardingFlow())

    if (startOnboardingFlow.fulfilled.match(result)) {
      const nextQuestion = result.payload.question
      if (nextQuestion) {
        navigate(`/onboarding/question/${nextQuestion.id}`)
      } else {
        navigate("/onboarding/complete")
      }
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-3xl border border-white/40 bg-white/80 p-8 shadow-xl backdrop-blur"
      >
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">MindEase onboarding</p>
        <h1 className="mt-4 text-3xl font-semibold text-foreground sm:text-4xl">
          Let us understand how you feel
        </h1>
        <p className="mt-4 text-sm text-muted-foreground sm:text-base">
          Answer a few calm, conversational questions so MindEase can personalize your
          emotional support, recommendations, and insights.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button onClick={handleStart} disabled={status === "loading"}>
            {status === "loading" ? "Preparing..." : "Begin profile"}
          </Button>
          <span className="text-xs text-muted-foreground">
            Takes about 2 to 3 minutes.
          </span>
        </div>
      </motion.div>
    </div>
  )
}
