import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Heart, MessageSquare, Sparkles, TrendingUp, ArrowRight, MoonStar } from "lucide-react"
import { fetchAdaptiveDashboard } from "@/features/adaptive/adaptiveSlice"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import BackButton from "@/components/ui/BackButton"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

const moodLabels = {
  improving: "Your trend is gently improving.",
  declining: "A softer day may need extra support.",
  stable: "Your emotional baseline looks steady.",
}

export default function Dashboard() {
  const dispatch = useDispatch()
  const { user } = useAuth()
  const {
    currentEmotionalState,
    recommendations,
    dailySuggestions,
    patterns,
    forecast,
    collectiveSummary,
    dashboardStatus,
  } = useSelector((state) => state.adaptive)

  useEffect(() => {
    if (dashboardStatus === "idle") {
      dispatch(fetchAdaptiveDashboard())
    }
  }, [dashboardStatus, dispatch])

  if (dashboardStatus === "loading" && !currentEmotionalState) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[32px] border border-emerald-200/60 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_35%),linear-gradient(135deg,_rgba(248,250,252,0.98),_rgba(236,253,245,0.92),_rgba(239,246,255,0.96))] p-6 shadow-xl shadow-emerald-100/70 dark:border-emerald-500/20 dark:bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_35%),linear-gradient(135deg,_rgba(15,23,42,0.96),_rgba(6,78,59,0.28),_rgba(12,74,110,0.3))] dark:shadow-emerald-950/20"
      >
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-sky-200/30 blur-3xl" />
        <div className="relative space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <BackButton />
            <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-emerald-700 shadow-sm dark:bg-emerald-950/40 dark:text-emerald-200">
              {todayLabel}
            </span>
          </div>
          <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Personalized support for {user?.firstName}'s current emotional rhythm
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            Mood signals, behavior patterns, and recent feedback are shaping what MindEase shows you right now.
          </p>
        </div>
      </motion.section>

      <section className="grid gap-4 lg:grid-cols-4">
        <Card className="border-emerald-100/80 bg-card/95 dark:border-emerald-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Heart className="h-4 w-4 text-rose-500" />
              Emotional State
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {currentEmotionalState?.moodScore || "-"}<span className="text-base text-muted-foreground">/10</span>
            </div>
            <p className="mt-2 text-sm capitalize text-muted-foreground">
              {currentEmotionalState?.emotionTag || "No mood logged yet"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-100/80 bg-card/95 dark:border-amber-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Top Picks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {recommendations?.activities?.length || 0}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Adaptive recommendations ready</p>
          </CardContent>
        </Card>

        <Card className="border-sky-100/80 bg-card/95 dark:border-sky-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4 text-sky-500" />
              Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {forecast?.predictedMood || "-"}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {forecast ? moodLabels[forecast.predictedTrend] : "Forecast appears after enough logs."}
            </p>
          </CardContent>
        </Card>

        <Card className="border-violet-100/80 bg-card/95 dark:border-violet-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <MoonStar className="h-4 w-4 text-violet-500" />
              Pattern Signals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{patterns.length}</div>
            <p className="mt-2 text-sm text-muted-foreground">Detected behavioral patterns</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="border-border/70 bg-card/95">
          <CardHeader>
            <CardTitle>Personalized Recommendations</CardTitle>
            <CardDescription>Deterministic suggestions shaped by mood, traits, behavior, and timing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations?.activities?.length ? (
              recommendations.activities.slice(0, 3).map((activity) => (
                <div key={activity._id} className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-foreground">{activity.personalizedTitle}</h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{activity.personalizedDescription}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        {activity.relevanceContext}
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200">
                      {Math.round(activity.recommendationScore)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Log your mood to unlock adaptive recommendations.</p>
            )}
            <Button asChild className="w-full sm:w-auto">
              <Link to="/recommendations">
                View Recommendation Flow <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/70 bg-card/95">
            <CardHeader>
              <CardTitle>Daily Wellness Suggestions</CardTitle>
              <CardDescription>Low-friction practices from the curated activity pool.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {dailySuggestions.slice(0, 4).map((item) => (
                <div key={item.activityType} className="rounded-2xl bg-emerald-50/70 p-3 dark:bg-emerald-500/10">
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/95">
            <CardHeader>
              <CardTitle>Behavioral Patterns</CardTitle>
              <CardDescription>Short-term signals that can change your recommendations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {patterns.length ? (
                patterns.slice(0, 3).map((pattern) => (
                  <div key={pattern.type} className="rounded-2xl border border-border/70 p-3">
                    <p className="font-medium text-foreground">{pattern.description}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      confidence {Math.round(pattern.confidence * 100)}%
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Patterns will appear after more mood logs.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/95">
            <CardHeader>
              <CardTitle>How Support Is Evolving</CardTitle>
              <CardDescription>Privacy-safe patterns from across the platform are quietly improving your support.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {collectiveSummary.insightCards.length ? (
                collectiveSummary.insightCards.slice(0, 2).map((card) => (
                  <div key={card.title} className="rounded-2xl bg-sky-50/80 p-3 dark:bg-sky-500/10">
                    <p className="font-medium text-foreground">{card.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{card.summary}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Collective insight cards will appear as the system learns more patterns safely.</p>
              )}
            </CardContent>
          </Card>

          <Button asChild variant="outline" className="w-full border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200 dark:hover:bg-sky-500/20">
            <Link to="/chat">
              <MessageSquare className="mr-2 h-4 w-4" />
              Open Adaptive Chat
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
