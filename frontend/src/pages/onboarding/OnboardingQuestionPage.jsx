import { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/Button"
import OnboardingProgress from "@/components/onboarding/OnboardingProgress"
import OnboardingOptionCard from "@/components/onboarding/OnboardingOptionCard"
import { submitAnswer, getNextQuestion } from "@/features/onboarding/onboardingSlice"

export default function OnboardingQuestionPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { id } = useParams()
  const { currentQuestion, progress, status } = useSelector((state) => state.onboarding)
  const [selectedOptionId, setSelectedOptionId] = useState(null)

  useEffect(() => {
    if (!currentQuestion) {
      dispatch(getNextQuestion())
    }
  }, [currentQuestion, dispatch])

  useEffect(() => {
    if (currentQuestion?.id && id !== String(currentQuestion.id)) {
      navigate(`/onboarding/question/${currentQuestion.id}`, { replace: true })
    }
  }, [currentQuestion, id, navigate])

  useEffect(() => {
    setSelectedOptionId(null)
  }, [currentQuestion?.id])

  const options = useMemo(() => currentQuestion?.options || [], [currentQuestion])

  const handleNext = async () => {
    if (!selectedOptionId || !currentQuestion?.id) return

    const answerResult = await dispatch(
      submitAnswer({
        questionId: currentQuestion.id,
        selectedOptionId,
      })
    )

    if (!submitAnswer.fulfilled.match(answerResult)) {
      return
    }

    const nextResult = await dispatch(getNextQuestion())
    if (getNextQuestion.fulfilled.match(nextResult)) {
      if (nextResult.payload.question) {
        navigate(`/onboarding/question/${nextResult.payload.question.id}`)
      } else {
        navigate("/onboarding/complete")
      }
    }
  }

  if (!currentQuestion) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center text-center">
        <p className="text-sm text-muted-foreground">Preparing your next question...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center px-4">
      <motion.div
        key={currentQuestion.id}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-3xl border border-white/40 bg-white/85 p-6 shadow-xl backdrop-blur"
      >
        <div className="space-y-4">
          <OnboardingProgress answered={progress.answered} total={progress.total} />
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              {currentQuestion.category || "Profile"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">
              {currentQuestion.question}
            </h2>
            {currentQuestion.description && (
              <p className="mt-2 text-sm text-muted-foreground">
                {currentQuestion.description}
              </p>
            )}
          </div>
          <div className="grid gap-3">
            {options.map((option) => (
              <OnboardingOptionCard
                key={option.id}
                text={option.text}
                selected={selectedOptionId === option.id}
                onClick={() => setSelectedOptionId(option.id)}
              />
            ))}
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Listen to what feels true in this moment.
          </span>
          <Button
            onClick={handleNext}
            disabled={!selectedOptionId || status === "loading"}
          >
            {status === "loading" ? "Saving..." : "Next"}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
