import { useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { motion } from "framer-motion"
import toast from "react-hot-toast"
import { Heart, MoonStar, Smartphone, Users } from "lucide-react"
import { submitMoodLog } from "@/features/adaptive/adaptiveSlice"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Label } from "@/components/ui/Label"
import { Select } from "@/components/ui/Select"
import { Textarea } from "@/components/ui/Textarea"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import BackButton from "@/components/ui/BackButton"

const EMOTIONS = ["happy", "sad", "anxious", "calm", "neutral", "angry", "excited", "tired", "stressed", "overwhelmed"]
const SOCIAL_OPTIONS = ["low", "medium", "high"]

export default function MoodTracker() {
  const dispatch = useDispatch()
  const { currentEmotionalState, moodStatus } = useSelector((state) => state.adaptive)
  const [form, setForm] = useState({
    moodScore: currentEmotionalState?.moodScore || 5,
    emotionTag: currentEmotionalState?.emotionTag || "neutral",
    notes: currentEmotionalState?.notes || "",
    activityDone: currentEmotionalState?.activityDone || false,
    sleepHours: currentEmotionalState?.sleepHours ?? 7,
    screenTime: currentEmotionalState?.screenTime ?? 4,
    socialInteractionLevel: currentEmotionalState?.socialInteractionLevel || "medium",
    stressLevel: currentEmotionalState?.stressLevel ?? 5,
  })

  const cards = useMemo(
    () => [
      { label: "Sleep", key: "sleepHours", icon: MoonStar, min: 0, max: 12, step: 0.5 },
      { label: "Screen Time", key: "screenTime", icon: Smartphone, min: 0, max: 16, step: 0.5 },
      { label: "Stress", key: "stressLevel", icon: Heart, min: 1, max: 10, step: 1 },
    ],
    []
  )

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = await dispatch(submitMoodLog(form))
    if (submitMoodLog.fulfilled.match(result)) {
      toast.success("Mood saved and adaptive systems refreshed.")
    } else {
      toast.error(result.payload || "Failed to save mood")
    }
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <BackButton />
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Mood Logging</h1>
        </div>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">
          Add enough context for the adaptive engine to respond differently tomorrow than it does today.
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-slate-200 bg-white/95">
          <CardHeader>
            <CardTitle>How are you feeling right now?</CardTitle>
            <CardDescription>These signals feed pattern detection, forecasting, and personalized recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Mood Score: {form.moodScore}/10</Label>
              <input
                type="range"
                min="1"
                max="10"
                value={form.moodScore}
                onChange={(event) => updateField("moodScore", Number(event.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-emerald-100 accent-emerald-500"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Emotion Tag</Label>
                <Select value={form.emotionTag} onChange={(event) => updateField("emotionTag", event.target.value)}>
                  {EMOTIONS.map((emotion) => (
                    <option key={emotion} value={emotion}>
                      {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-400" />
                  Social Interaction
                </Label>
                <Select
                  value={form.socialInteractionLevel}
                  onChange={(event) => updateField("socialInteractionLevel", event.target.value)}
                >
                  {SOCIAL_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                rows={5}
                value={form.notes}
                onChange={(event) => updateField("notes", event.target.value)}
                placeholder="What happened today, and what feels most present right now?"
              />
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.activityDone}
                onChange={(event) => updateField("activityDone", event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              I completed a wellness activity today.
            </label>

            <Button type="submit" disabled={moodStatus === "loading"} className="w-full">
              {moodStatus === "loading" ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Updating adaptive state...
                </>
              ) : (
                "Save Mood and Recalculate"
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {cards.map(({ label, key, icon: Icon, min, max, step }) => (
            <Card key={key} className="border-slate-200 bg-white/95">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="h-4 w-4 text-emerald-500" />
                  {label}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-3xl font-bold text-slate-900">{form[key]}</div>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={form[key]}
                  onChange={(event) => updateField(key, Number(event.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-emerald-100 accent-emerald-500"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </form>
    </div>
  )
}
