import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts"
import { motion } from "framer-motion"
import { Calendar, TrendingUp } from "lucide-react"
import { moodAPI } from "@/lib/api"
import { useSelector } from "react-redux"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Select } from "@/components/ui/Select"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import BackButton from "@/components/ui/BackButton"

const COLORS = ["#10b981", "#f59e0b", "#0ea5e9", "#6366f1", "#f97316", "#ef4444"]

export default function MoodAnalytics() {
  const [period, setPeriod] = useState("week")
  const { patterns, forecast, insightProfile, collectiveSummary } = useSelector((state) => state.adaptive)

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["moodAnalytics", period],
    queryFn: () => moodAPI.getAnalytics(period),
  })

  const analyticsData = analytics?.data
  const overallStats = analyticsData?.overallStats

  const chartData =
    analyticsData?.analytics?.map((item) => ({
      name:
        period === "month"
          ? `${item._id.year}-${String(item._id.month).padStart(2, "0")}`
          : `Week ${item._id.week}, ${item._id.year}`,
      mood: Number(item.avgMoodScore?.toFixed?.(1) || item.avgMoodScore || 0),
      count: item.count,
    })) || []

  const emotionData =
    analyticsData?.emotionDistribution?.map((item) => ({
      name: item._id,
      value: item.count,
    })) || []

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <BackButton />
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Emotional Insights</h1>
          </div>
          <p className="text-sm text-slate-600">Charts from your mood timeline, plus adaptive patterns and short-term forecasting.</p>
        </div>
        <Select value={period} onChange={(event) => setPeriod(event.target.value)}>
          <option value="week">Weekly</option>
          <option value="month">Monthly</option>
        </Select>
      </motion.div>

      {overallStats && (
        <section className="grid gap-4 md:grid-cols-4">
          <Card className="border-slate-200 bg-white/95">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Mood</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{overallStats.avgMoodScore?.toFixed(1) || "-"}</div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-white/95">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4 text-slate-400" />
                Total Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{overallStats.totalLogs || 0}</div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-white/95">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Highest Mood</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{overallStats.maxMoodScore || "-"}</div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-white/95">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <TrendingUp className="h-4 w-4 text-slate-400" />
                Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{forecast?.predictedMood || "-"}</div>
              <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">
                {forecast?.predictedTrend || "stable"} trend
              </p>
            </CardContent>
          </Card>
        </section>
      )}

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="border-slate-200 bg-white/95">
          <CardHeader>
            <CardTitle>Adaptive Profile</CardTitle>
            <CardDescription>Summary derived from your recent log history.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            <p>Baseline mood: <span className="font-semibold text-slate-900">{insightProfile?.emotionalBaseline?.toFixed?.(1) || "-"}</span></p>
            <p>Stress level: <span className="font-semibold capitalize text-slate-900">{insightProfile?.stressLevel || "-"}</span></p>
            <p>Recovery rate: <span className="font-semibold capitalize text-slate-900">{insightProfile?.recoveryRate || "-"}</span></p>
            <p>Dominant emotion: <span className="font-semibold capitalize text-slate-900">{insightProfile?.dominantEmotion || "-"}</span></p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white/95 lg:col-span-2">
          <CardHeader>
            <CardTitle>Detected Patterns</CardTitle>
            <CardDescription>Deterministic patterns that can influence ranking and chat tone.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {patterns.length ? (
              patterns.map((pattern) => (
                <div key={pattern.type} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                  <p className="font-medium text-slate-900">{pattern.description}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">
                    confidence {Math.round(pattern.confidence * 100)}%
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">Patterns appear after enough behavioral signal is available.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-200 bg-white/95">
          <CardHeader>
            <CardTitle>Behavioral Trend Summaries</CardTitle>
            <CardDescription>Human-friendly reflections from anonymized learning across similar situations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {collectiveSummary.behavioralTrendSummaries.length ? (
              collectiveSummary.behavioralTrendSummaries.map((item) => (
                <div key={item.activityType} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                  <p className="font-medium text-slate-900">{item.summary}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">Collective trend summaries will appear as the system gathers enough anonymous outcomes.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white/95">
          <CardHeader>
            <CardTitle>Recommendation Evolution</CardTitle>
            <CardDescription>Signals that the recommendation engine is learning what tends to help.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {collectiveSummary.recommendationEvolutionIndicators.length ? (
              collectiveSummary.recommendationEvolutionIndicators.map((item) => (
                <div key={item.activityType} className="rounded-2xl bg-emerald-50/80 p-4">
                  <p className="font-medium text-slate-900">{item.label}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">Evolution indicators will appear after more anonymized recommendation outcomes accumulate.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-200 bg-white/95">
          <CardHeader>
            <CardTitle>Mood Trend</CardTitle>
            <CardDescription>Average mood over time.</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="mood" stroke="#10b981" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-sm text-slate-500">No mood trend yet.</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white/95">
          <CardHeader>
            <CardTitle>Emotion Distribution</CardTitle>
            <CardDescription>Which emotions show up most often.</CardDescription>
          </CardHeader>
          <CardContent>
            {emotionData.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={emotionData} dataKey="value" nameKey="name" outerRadius={90} label>
                    {emotionData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-sm text-slate-500">No emotion distribution yet.</div>
            )}
          </CardContent>
        </Card>
      </section>

      {chartData.length > 0 && (
        <Card className="border-slate-200 bg-white/95">
          <CardHeader>
            <CardTitle>Logging Frequency</CardTitle>
            <CardDescription>How often entries are being recorded.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
