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

const ACTIVITY_ICONS = {
  meditation: "🧘",
  journaling: "📝",
  music: "🎵",
  workout: "💪",
  breathing: "🌬️",
  walk: "🚶",
}

const ACTIVITY_DESCRIPTIONS = {
  meditation: "Practice mindfulness and find inner peace",
  journaling: "Express your thoughts and reflect on your day",
  music: "Listen to calming or uplifting music",
  workout: "Engage in physical exercise to boost mood",
  breathing: "Practice deep breathing exercises",
  walk: "Take a refreshing walk outdoors",
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
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-8 w-8" />
          Recommendations
        </h1>
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
                    (activity, index) => (
                      <motion.div
                        key={activity}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-2 rounded-lg border bg-card p-4"
                      >
                        <span className="text-2xl">
                          {ACTIVITY_ICONS[activity] || "✨"}
                        </span>
                        <div className="flex-1">
                          <p className="font-semibold capitalize">{activity}</p>
                          <p className="text-sm text-muted-foreground">
                            {ACTIVITY_DESCRIPTIONS[activity] || "A wellness activity"}
                          </p>
                        </div>
                      </motion.div>
                    )
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

