import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { recommendationAPI } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { motion } from "framer-motion"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Activity,
} from "lucide-react"
import toast from "react-hot-toast"
import BackButton from "@/components/ui/BackButton"

const ACTIVITY_LIBRARY = {
  meditation: { icon: "🧘", title: "Guided Meditation", description: "Practice a 10-minute loving-kindness session." },
  breathing: { icon: "🌬️", title: "Breathing Ritual", description: "Try box-breathing or the 4-7-8 technique." },
  journaling: { icon: "📝", title: "Reflective Journaling", description: "Write freely for five minutes about your day." },
  music: { icon: "🎵", title: "Mood Music", description: "Listen to a playlist that matches or lifts your mood." },
  workout: { icon: "💪", title: "Movement Burst", description: "Complete a short strength or cardio circuit." },
  walk: { icon: "🚶", title: "Mindful Walk", description: "Stroll outside and notice five calming details." },
  yoga: { icon: "🧎", title: "Gentle Yoga", description: "Flow through a series of slow, grounding poses." },
  stretching: { icon: "🤸", title: "Restorative Stretching", description: "Release tension with a guided stretch." },
  nature_walk: { icon: "🌳", title: "Nature Reset", description: "Spend 15 minutes outside absorbing natural light." },
  digital_detox: { icon: "📴", title: "Digital Detox", description: "Unplug from screens and check in with your senses." },
  gratitude: { icon: "🙏", title: "Gratitude Pause", description: "List three things that brought you comfort today." },
  creative: { icon: "🎨", title: "Creative Break", description: "Paint, doodle, cook, or tinker with a fun idea." },
  social_check_in: { icon: "💬", title: "Social Check-in", description: "Connect with someone who energizes you." },
  therapy_check_in: { icon: "🧠", title: "Therapy Touchpoint", description: "Review therapy notes or schedule a session." },
  hydration_break: { icon: "💧", title: "Hydration Break", description: "Sip water or herbal tea and take three deep breaths." },
  mindful_eating: { icon: "🥗", title: "Mindful Snack", description: "Enjoy a nourishing snack without multitasking." },
}

const formatActivity = (id) => {
  if (!id) return { title: "Wellness activity", description: "Take a mindful pause.", icon: "✨" }
  const meta = ACTIVITY_LIBRARY[id]
  if (meta) return meta
  const friendly = id.replace(/_/g, " ")
  return { title: friendly.charAt(0).toUpperCase() + friendly.slice(1), description: "A supportive activity.", icon: "✨" }
}

export default function Recommendations() {
  const queryClient = useQueryClient()

  const { data: generalRecs, isLoading: generalLoading } = useQuery({
    queryKey: ["generalRecommendations"],
    queryFn: () => recommendationAPI.getGeneral(),
  })

  const { data: personalizedRec, isLoading: personalizedLoading } = useQuery({
    queryKey: ["personalizedRecommendations"],
    queryFn: () => recommendationAPI.getPersonalized(),
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => recommendationAPI.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["personalizedRecommendations"] })
      toast.success("Recommendation status updated!")
    },
    onError: () => {
      toast.error("Failed to update recommendation")
    },
  })

  const handleStatusUpdate = (id, status) => {
    updateStatusMutation.mutate({ id, status })
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "accepted":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "ignored":
        return <XCircle className="h-4 w-4 text-gray-500" />
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-blue-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className="flex flex-wrap items-center gap-3">
          <BackButton />
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            Recommendations
          </h1>
        </div>
        <p className="text-muted-foreground">
          Personalized activities and wellness tips to support your mental health
        </p>
      </motion.div>

      {/* Personalized Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Personalized Recommendations
            </CardTitle>
            <CardDescription>
              Activities tailored to your current mood and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            {personalizedLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : personalizedRec?.data?.recommendation ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  {personalizedRec.data.recommendation.suggestedActivities?.map(
                    (activity, index) => {
                      const meta = formatActivity(activity)
                      return (
                        <motion.div
                          key={`${activity}-${index}`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-3 rounded-lg border bg-card p-4"
                        >
                          <span className="text-2xl">{meta.icon}</span>
                          <div className="flex-1">
                            <p className="font-semibold">{meta.title}</p>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                              {activity.replace(/_/g, " ")}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {meta.description}
                            </p>
                          </div>
                        </motion.div>
                      )
                    }
                  )}
                </div>

                <div className="flex items-center gap-2 pt-4 border-t">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(personalizedRec.data.recommendation.status)}
                    <span className="text-sm capitalize">
                      {personalizedRec.data.recommendation.status}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleStatusUpdate(
                        personalizedRec.data.recommendation._id,
                        "accepted"
                      )
                    }
                    disabled={updateStatusMutation.isPending}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleStatusUpdate(
                        personalizedRec.data.recommendation._id,
                        "completed"
                      )
                    }
                    disabled={updateStatusMutation.isPending}
                  >
                    Mark Complete
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleStatusUpdate(
                        personalizedRec.data.recommendation._id,
                        "ignored"
                      )
                    }
                    disabled={updateStatusMutation.isPending}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Ignore
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No personalized recommendations available.</p>
                <p className="text-sm mt-2">
                  Log your mood to get personalized activity suggestions!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* General Wellness Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>General Wellness Tips</CardTitle>
            <CardDescription>
              Universal practices for maintaining mental well-being
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generalLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : generalRecs?.data?.tips ? (
              <div className="grid gap-3 md:grid-cols-2">
                {generalRecs.data.tips.map((tip, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="flex items-start gap-3 rounded-lg border bg-card p-4"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {index + 1}
                    </div>
                    <p className="flex-1 text-sm">{tip}</p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No tips available at the moment.
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

