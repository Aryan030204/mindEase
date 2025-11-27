import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { moodAPI } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Label } from "@/components/ui/Label"
import { Textarea } from "@/components/ui/Textarea"
import { Select } from "@/components/ui/Select"
import { motion } from "framer-motion"
import toast from "react-hot-toast"
import { Heart, CheckCircle2 } from "lucide-react"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { formatDate } from "@/lib/utils"

const EMOTIONS = ["happy", "sad", "anxious", "calm", "angry", "excited", "tired", "neutral"]
const MOOD_COLORS = {
  1: "bg-red-500",
  2: "bg-orange-500",
  3: "bg-yellow-500",
  4: "bg-yellow-400",
  5: "bg-blue-400",
  6: "bg-blue-500",
  7: "bg-green-400",
  8: "bg-green-500",
  9: "bg-emerald-500",
  10: "bg-emerald-600",
}

export default function MoodTracker() {
  const [moodScore, setMoodScore] = useState(5)
  const [emotionTag, setEmotionTag] = useState("neutral")
  const [notes, setNotes] = useState("")
  const [activityDone, setActivityDone] = useState(false)

  const queryClient = useQueryClient()

  const { data: todayMood, isLoading } = useQuery({
    queryKey: ["moodHistory"],
    queryFn: () => moodAPI.getHistory({ limit: 1 }),
  })

  const todayLog = todayMood?.data?.logs?.find(
    (log) => new Date(log.date).toDateString() === new Date().toDateString()
  )

  const mutation = useMutation({
    mutationFn: (data) => moodAPI.addLog(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moodHistory"] })
      queryClient.invalidateQueries({ queryKey: ["moodAnalytics"] })
      toast.success(todayLog ? "Mood updated successfully!" : "Mood logged successfully!")
      if (!todayLog) {
        setMoodScore(5)
        setEmotionTag("neutral")
        setNotes("")
        setActivityDone(false)
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to log mood")
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    mutation.mutate({
      moodScore,
      emotionTag,
      notes,
      activityDone,
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold tracking-tight">Mood Tracker</h1>
        <p className="text-muted-foreground">
          Log your daily mood and track your emotional well-being
        </p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Mood Log Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                {todayLog ? "Update Today's Mood" : "Log Your Mood"}
              </CardTitle>
              <CardDescription>
                {todayLog
                  ? `You logged your mood on ${formatDate(todayLog.date)}. Update it below.`
                  : "How are you feeling today?"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Mood Score */}
                <div className="space-y-3">
                  <Label>Mood Score: {moodScore}/10</Label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={moodScore}
                      onChange={(e) => setMoodScore(Number(e.target.value))}
                      className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Very Low</span>
                      <span>Very High</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setMoodScore(num)}
                        className={`flex-1 h-8 rounded transition-all ${
                          moodScore >= num ? MOOD_COLORS[num] : "bg-muted"
                        } ${moodScore === num ? "ring-2 ring-primary ring-offset-2" : ""}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Emotion Tag */}
                <div className="space-y-2">
                  <Label htmlFor="emotion">Emotion</Label>
                  <Select
                    id="emotion"
                    value={emotionTag}
                    onChange={(e) => setEmotionTag(e.target.value)}
                  >
                    {EMOTIONS.map((emotion) => (
                      <option key={emotion} value={emotion}>
                        {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                      </option>
                    ))}
                  </Select>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="What's on your mind today?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                </div>

                {/* Activity Done */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="activityDone"
                    checked={activityDone}
                    onChange={(e) => setActivityDone(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="activityDone" className="cursor-pointer">
                    Completed recommended activity today
                  </Label>
                </div>

                <Button type="submit" className="w-full" disabled={mutation.isPending}>
                  {mutation.isPending ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Saving...
                    </>
                  ) : todayLog ? (
                    "Update Mood"
                  ) : (
                    "Log Mood"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Today's Mood Display */}
        {todayLog && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Today's Mood
                </CardTitle>
                <CardDescription>
                  Logged on {formatDate(todayLog.date)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">{todayLog.moodScore}</span>
                    <span className="text-muted-foreground">/10</span>
                  </div>
                  <div className="mt-2 flex gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <div
                        key={num}
                        className={`flex-1 h-3 rounded ${
                          todayLog.moodScore >= num ? MOOD_COLORS[num] : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Emotion</p>
                  <p className="text-lg font-semibold capitalize">{todayLog.emotionTag}</p>
                </div>
                {todayLog.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="text-sm">{todayLog.notes}</p>
                  </div>
                )}
                {todayLog.activityDone && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm">Activity completed</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}

