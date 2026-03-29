import { useQuery } from "@tanstack/react-query";
import { moodAPI, recommendationAPI } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Link } from "react-router-dom";
import {
  Heart,
  TrendingUp,
  Sparkles,
  MessageSquare,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { motion } from "framer-motion";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import BackButton from "@/components/ui/BackButton";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: latestMood, isLoading: moodLoading } = useQuery({
    queryKey: ["moodHistory"],
    queryFn: () => moodAPI.getHistory({ limit: 1 }),
  });

  const { data: recommendations, isLoading: recLoading } = useQuery({
    queryKey: ["personalizedRecommendations"],
    queryFn: () => recommendationAPI.getPersonalized(),
  });

  const latestLog = latestMood?.data?.logs?.[0];
  const moodPercent = latestLog ? Math.max(0, Math.min(100, latestLog.moodScore * 10)) : 0;
  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-fuchsia-500/5 to-sky-500/10 p-5 shadow-lg shadow-primary/10"
      >
        <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative z-10 space-y-2">
          <p className="inline-flex items-center rounded-full border border-primary/20 bg-white/70 px-3 py-1 text-xs font-semibold tracking-wide text-primary shadow-sm backdrop-blur dark:bg-slate-900/70">
            {todayLabel}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <BackButton />
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary via-fuchsia-500 to-sky-500 bg-clip-text text-transparent">
              Welcome back, {user?.firstName}! 👋
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
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
        <motion.div variants={itemVariants} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
          <Card className="group relative overflow-hidden border-primary/15">
            <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-primary via-fuchsia-500 to-sky-500" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Today's Mood
              </CardTitle>
              <div className="rounded-lg bg-primary/10 p-2 text-primary transition-colors group-hover:bg-primary/20">
                <Heart className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              {moodLoading ? (
                <LoadingSpinner size="sm" />
              ) : latestLog ? (
                <div>
                  <div className="text-2xl font-bold">
                    {latestLog.moodScore}/10
                  </div>
                  <p className="text-xs text-muted-foreground capitalize">
                    {latestLog.emotionTag}
                  </p>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-primary/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary via-fuchsia-500 to-sky-500 transition-all duration-500"
                      style={{ width: `${moodPercent}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-xs text-muted-foreground">
                    No mood logged today
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
          <Card className="group relative overflow-hidden border-primary/15">
            <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-primary via-fuchsia-500 to-sky-500" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Recommendations
              </CardTitle>
              <div className="rounded-lg bg-primary/10 p-2 text-primary transition-colors group-hover:bg-primary/20">
                <Sparkles className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              {recLoading ? (
                <LoadingSpinner size="sm" />
              ) : recommendations?.data?.recommendation ? (
                <div>
                  <div className="text-2xl font-bold">
                    {recommendations.data.recommendation.suggestedActivities
                      ?.length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Activities suggested
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-xs text-muted-foreground">
                    No recommendations yet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
          <Card className="group relative overflow-hidden border-primary/15">
            <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-primary via-fuchsia-500 to-sky-500" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Logged</CardTitle>
              <div className="rounded-lg bg-primary/10 p-2 text-primary transition-colors group-hover:bg-primary/20">
                <Calendar className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              {moodLoading ? (
                <LoadingSpinner size="sm" />
              ) : latestLog ? (
                <div>
                  <div className="text-2xl font-bold">
                    {formatDate(latestLog.date)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Most recent entry
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-xs text-muted-foreground">
                    No entries yet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
          <Card className="group relative overflow-hidden border-primary/15">
            <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-primary via-fuchsia-500 to-sky-500" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Wellness Score
              </CardTitle>
              <div className="rounded-lg bg-primary/10 p-2 text-primary transition-colors group-hover:bg-primary/20">
                <TrendingUp className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              {moodLoading ? (
                <LoadingSpinner size="sm" />
              ) : latestLog ? (
                <div>
                  <div className="text-2xl font-bold">
                    {latestLog.moodScore >= 7
                      ? "Great"
                      : latestLog.moodScore >= 5
                        ? "Good"
                        : "Needs Care"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Based on recent mood
                  </p>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-primary/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary via-fuchsia-500 to-sky-500 transition-all duration-500"
                      style={{ width: `${moodPercent}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-xs text-muted-foreground">
                    Start tracking to see
                  </p>
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
        <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-white to-sky-50 dark:via-slate-900 dark:to-slate-900">
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/20 blur-2xl" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="rounded-lg bg-primary/15 p-2 text-primary">
                <Heart className="h-4 w-4" />
              </span>
              Log Your Mood
            </CardTitle>
            <CardDescription>
              Track how you're feeling today to maintain your wellness journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full shadow-md shadow-primary/30">
              <Link to="/mood-tracker">
                Log Mood <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-sky-400/20 bg-gradient-to-br from-sky-500/10 via-white to-fuchsia-50 dark:via-slate-900 dark:to-slate-900">
          <div className="pointer-events-none absolute -left-8 -bottom-8 h-24 w-24 rounded-full bg-sky-400/20 blur-2xl" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="rounded-lg bg-sky-500/15 p-2 text-sky-600 dark:text-sky-400">
                <MessageSquare className="h-4 w-4" />
              </span>
              Chat with AI
            </CardTitle>
            <CardDescription>
              Get instant support and guidance from our AI wellness companion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full border-sky-300/50 bg-white/70 dark:bg-slate-900/60">
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
                {recommendations.data.recommendation.suggestedActivities?.map(
                  (activity, index) => (
                    <motion.span
                      key={activity}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary capitalize"
                    >
                      {activity}
                    </motion.span>
                  ),
                )}
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
  );
}
