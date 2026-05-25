import { useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { motion } from "framer-motion"
import toast from "react-hot-toast"
import { CheckCircle2, Clock3, Sparkles, XCircle } from "lucide-react"
import { updateRecommendationFeedback } from "@/features/adaptive/adaptiveSlice"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import BackButton from "@/components/ui/BackButton"

const actionButtons = [
  { action: "accepted", label: "Accept", icon: CheckCircle2, className: "border-emerald-200 text-emerald-700 hover:bg-emerald-50" },
  { action: "completed", label: "Complete", icon: Sparkles, className: "border-sky-200 text-sky-700 hover:bg-sky-50" },
  { action: "ignored", label: "Ignore", icon: XCircle, className: "border-slate-200 text-slate-600 hover:bg-slate-50" },
]

export default function Recommendations() {
  const dispatch = useDispatch()
  const { recommendations, recommendationHistory, dailySuggestions, recommendationActionStatus } = useSelector(
    (state) => state.adaptive
  )

  const recentHistory = useMemo(() => recommendationHistory.slice(0, 4), [recommendationHistory])

  const handleAction = async (activityId, action) => {
    if (!recommendations?._id) return
    const result = await dispatch(
      updateRecommendationFeedback({
        recommendationId: recommendations._id,
        activityId,
        action,
      })
    )

    if (updateRecommendationFeedback.fulfilled.match(result)) {
      toast.success("Recommendation feedback saved.")
    } else {
      toast.error(result.payload || "Failed to update recommendation")
    }
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <BackButton />
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-slate-900">
            <Sparkles className="h-8 w-8 text-amber-500" />
            Adaptive Recommendations
          </h1>
        </div>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">
          These activities come from the curated dataset and are ranked by deterministic scoring, not by the LLM.
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-slate-200 bg-white/95">
          <CardHeader>
            <CardTitle>Current Personalized Set</CardTitle>
            <CardDescription>Feedback here directly changes future weighting.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations?.activities?.length ? (
              recommendations.activities.map((activity) => (
                <div key={activity._id} className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{activity.personalizedTitle}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{activity.personalizedDescription}</p>
                      <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">
                        {activity.relevanceContext}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                      {Math.round(activity.recommendationScore)}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {actionButtons.map(({ action, label, icon: Icon, className }) => (
                      <Button
                        key={action}
                        type="button"
                        variant="outline"
                        disabled={recommendationActionStatus === "loading"}
                        className={className}
                        onClick={() => handleAction(activity._id, action)}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No adaptive set is ready yet. Start by logging your mood.</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-slate-200 bg-white/95">
            <CardHeader>
              <CardTitle>Daily Wellness Suggestions</CardTitle>
              <CardDescription>Always available low-intensity options.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {dailySuggestions.map((item) => (
                <div key={item.activityType} className="rounded-2xl border border-slate-200 p-3">
                  <p className="font-medium text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white/95">
            <CardHeader>
              <CardTitle>Recent Recommendation History</CardTitle>
              <CardDescription>Latest recommendation cycles and their status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentHistory.map((item) => (
                <div key={item._id} className="rounded-2xl bg-slate-50/80 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-slate-900">
                      {item.activities?.[0]?.personalizedTitle || "Recommendation cycle"}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.16em] text-slate-400">
                      <Clock3 className="h-3.5 w-3.5" />
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
