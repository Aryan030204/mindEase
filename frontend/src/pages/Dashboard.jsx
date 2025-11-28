import { useQuery } from "@tanstack/react-query"
import { moodAPI, recommendationAPI } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Link } from "react-router-dom"
import { Heart, TrendingUp, Sparkles, MessageSquare, ArrowRight, Calendar } from "lucide-react"
import { motion } from "framer-motion"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { formatDate } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import BackButton from "@/components/ui/BackButton"

export default function Dashboard() {
  const { user } = useAuth()
  
  const { data: latestMood, isLoading: moodLoading } = useQuery({
    queryKey: ["moodHistory"],
    queryFn: () => moodAPI.getHistory({ limit: 1 }),
  })

  const { data: recommendations, isLoading: recLoading } = useQuery({
    queryKey: ["personalizedRecommendations"],
    queryFn: () => recommendationAPI.getPersonalized(),
  })

  const latestLog = latestMood?.data?.logs?.[0]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
      >
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <BackButton />
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary via-fuchsia-500 to-sky-500 bg-clip-text text-transparent">
              Welcome back, {user?.firstName}! 👋
            </h1>
          </div>
          <p className="text-muted-foreground">
            Here's an overview of your mental wellness journey
          </p>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Mood</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {moodLoading ? (
                <LoadingSpinner size="sm" />
              ) : latestLog ? (
                <div>
                  <div className="text-2xl font-bold">{latestLog.moodScore}/10</div>
                  <p className="text-xs text-muted-foreground capitalize">
                    {latestLog.emotionTag}
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-xs text-muted-foreground">No mood logged today</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recommendations</CardTitle>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {recLoading ? (
                <LoadingSpinner size="sm" />
              ) : recommendations?.data?.recommendation ? (
                <div>
                  <div className="text-2xl font-bold">
                    {recommendations.data.recommendation.suggestedActivities?.length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Activities suggested</p>
                </div>
              ) : (
                <div>
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-xs text-muted-foreground">No recommendations yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Logged</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {moodLoading ? (
                <LoadingSpinner size="sm" />
              ) : latestLog ? (
                <div>
                  <div className="text-2xl font-bold">
                    {formatDate(latestLog.date)}
                  </div>
                  <p className="text-xs text-muted-foreground">Most recent entry</p>
                </div>
              ) : (
                <div>
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-xs text-muted-foreground">No entries yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wellness Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {moodLoading ? (
                <LoadingSpinner size="sm" />
              ) : latestLog ? (
                <div>
                  <div className="text-2xl font-bold">
                    {latestLog.moodScore >= 7 ? "Great" : latestLog.moodScore >= 5 ? "Good" : "Needs Care"}
                  </div>
                  <p className="text-xs text-muted-foreground">Based on recent mood</p>
                </div>
              ) : (
                <div>
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-xs text-muted-foreground">Start tracking to see</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid gap-4 md:grid-cols-2"
      >
        <Card>
          <CardHeader>
            <CardTitle>Log Your Mood</CardTitle>
            <CardDescription>
              Track how you're feeling today to maintain your wellness journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/mood-tracker">
                Log Mood <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chat with AI</CardTitle>
            <CardDescription>
              Get instant support and guidance from our AI wellness companion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link to="/chat">
                <MessageSquare className="mr-2 h-4 w-4" />
                Start Chat
              </Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Recommendations */}
      {recommendations?.data?.recommendation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Your Recommendations</CardTitle>
              <CardDescription>
                Personalized activities based on your current mood
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {recommendations.data.recommendation.suggestedActivities?.map((activity, index) => (
                  <motion.span
                    key={activity}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary capitalize"
                  >
                    {activity}
                  </motion.span>
                ))}
              </div>
              <Button asChild variant="outline" className="mt-4">
                <Link to="/recommendations">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

