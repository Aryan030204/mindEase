import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { moodAPI, insightAPI } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Select } from "@/components/ui/Select"
import { motion } from "framer-motion"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { TrendingUp, Calendar } from "lucide-react"
import BackButton from "@/components/ui/BackButton"

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00ff00", "#ff00ff", "#00ffff"]

export default function MoodAnalytics() {
  const [period, setPeriod] = useState("week")

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["moodAnalytics", period],
    queryFn: () => moodAPI.getAnalytics(period),
  })

  const { data: profileData } = useQuery({
    queryKey: ["insightProfile"],
    queryFn: () => insightAPI.getProfile(),
  })

  const { data: patternsData } = useQuery({
    queryKey: ["insightPatterns"],
    queryFn: () => insightAPI.getPatterns(),
  })

  const { data: forecastData } = useQuery({
    queryKey: ["insightForecast"],
    queryFn: () => insightAPI.getForecast(),
  })

  const insights = profileData?.data?.insight
  const patterns = patternsData?.data?.patterns || []
  const forecast = forecastData?.data?.forecast

  const analyticsData = analytics?.data

  // Prepare chart data
  const chartData =
    analyticsData?.analytics?.map((item) => ({
      name:
        period === "month"
          ? `${item._id.year}-${String(item._id.month).padStart(2, "0")}`
          : `Week ${item._id.week}, ${item._id.year}`,
      mood: Number(item.avgMoodScore.toFixed(1)),
      count: item.count,
    })) || []

  const emotionData =
    analyticsData?.emotionDistribution?.map((item) => ({
      name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
      value: item.count,
    })) || []

  const overallStats = analyticsData?.overallStats

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
        className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
      >
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <BackButton />
            <h1 className="text-3xl font-bold tracking-tight">Mood Analytics</h1>
          </div>
          <p className="text-muted-foreground">
            Visualize your mood trends and emotional patterns
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
          </Select>
        </div>
      </motion.div>

      {/* Overall Stats */}
      {overallStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-4 md:grid-cols-4"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Mood</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overallStats.avgMoodScore?.toFixed(1) || "-"}
              </div>
              <p className="text-xs text-muted-foreground">out of 10</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats.totalLogs || 0}</div>
              <p className="text-xs text-muted-foreground">entries recorded</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Highest Mood</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats.maxMoodScore || "-"}</div>
              <p className="text-xs text-muted-foreground">best day</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lowest Mood</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats.minMoodScore || "-"}</div>
              <p className="text-xs text-muted-foreground">needs attention</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* AI Insights & Forecasting */}
      {(insights || patterns.length > 0 || forecast) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-4 md:grid-cols-3"
        >
          {insights && (
            <Card className="border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                  <TrendingUp className="h-5 w-5" />
                  AI Emotional Profile
                </CardTitle>
                <CardDescription>Generated from last 14 logs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Baseline Mood:</span>
                  <span className="font-semibold">{insights.emotionalBaseline?.toFixed(1) || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stress Level:</span>
                  <span className={`font-semibold capitalize ${insights.stressLevel === 'high' ? 'text-red-500' : insights.stressLevel === 'medium' ? 'text-yellow-500' : 'text-green-500'}`}>{insights.stressLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Recovery Rate:</span>
                  <span className="font-semibold capitalize">{insights.recoveryRate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dominant Emotion:</span>
                  <span className="font-semibold capitalize">{insights.dominantEmotion}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {patterns.length > 0 && (
            <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
              <CardHeader>
                <CardTitle className="text-blue-700 dark:text-blue-400">Pattern Detection</CardTitle>
                <CardDescription>Identified analytics behaviors</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                  {patterns.map((pattern, index) => (
                    <li key={index}>{pattern}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {forecast && (
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-900">
              <CardHeader>
                <CardTitle className="text-green-700 dark:text-green-400">Mood Forecast</CardTitle>
                <CardDescription>Algorithm linear trend projection</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center pt-4">
                <div className="text-4xl font-black text-green-600 dark:text-green-400">
                  {forecast.predictedMood}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Predicted Score</div>
                <div className="mt-4 w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all" 
                    style={{ width: `${forecast.confidence * 100}%` }}
                  />
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">Confidence: {(forecast.confidence * 100).toFixed(0)}%</div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Mood Trend Line Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Mood Trend</CardTitle>
              <CardDescription>
                Average mood score over {period === "week" ? "weeks" : "months"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="mood"
                      stroke="#8884d8"
                      strokeWidth={2}
                      name="Mood Score"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No data available. Start logging your mood to see trends!
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Emotion Distribution Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Emotion Distribution</CardTitle>
              <CardDescription>Most common emotions</CardDescription>
            </CardHeader>
            <CardContent>
              {emotionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={emotionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {emotionData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No emotion data available
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Mood Count Bar Chart */}
      {chartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Mood Log Frequency</CardTitle>
              <CardDescription>
                Number of mood logs per {period === "week" ? "week" : "month"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#82ca9d" name="Number of Logs" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

