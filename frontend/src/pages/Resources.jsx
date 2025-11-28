import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { resourceAPI } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Select } from "@/components/ui/Select"
import { motion } from "framer-motion"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { BookOpen, ExternalLink, Filter, Sparkles } from "lucide-react"
import { formatDate } from "@/lib/utils"
import BackButton from "@/components/ui/BackButton"

const CATEGORIES = [
  { value: "all", label: "All Resources" },
  { value: "articles", label: "Articles" },
  { value: "meditation", label: "Meditation" },
  { value: "journaling", label: "Journaling" },
  { value: "exercise", label: "Exercise" },
  { value: "faqs", label: "FAQs" },
]

const CATEGORY_COLORS = {
  articles: "bg-blue-500/10 text-blue-500",
  meditation: "bg-purple-500/10 text-purple-500",
  journaling: "bg-pink-500/10 text-pink-500",
  exercise: "bg-green-500/10 text-green-500",
  faqs: "bg-orange-500/10 text-orange-500",
}

const FALLBACK_RESOURCES = [
  {
    _id: "calm-breathing",
    title: "Calm: 5-Minute Breathing Reset",
    description: "Guided breathing audio designed to calm anxious thoughts in minutes.",
    category: "meditation",
    contentURL: "https://www.calm.com/blog/breathing-exercises",
    provider: "Calm",
    tags: ["breathing", "stress", "audio"],
  },
  {
    _id: "headspace-focus",
    title: "Headspace Focus Music",
    description: "Lo-fi playlists curated for mindful work and deep focus sessions.",
    category: "articles",
    contentURL: "https://www.headspace.com/music",
    provider: "Headspace",
    tags: ["music", "focus", "mindfulness"],
  },
  {
    _id: "gratitude-prompts",
    title: "PositivePsychology Gratitude Prompts",
    description: "30 reflective prompts to spark deeper gratitude journaling.",
    category: "journaling",
    contentURL: "https://positivepsychology.com/gratitude-journal-prompts/",
    provider: "PositivePsychology.com",
    tags: ["journaling", "gratitude"],
  },
  {
    _id: "yoga-adriene",
    title: "Yoga With Adriene: Gentle Wind Down",
    description: "25-minute restorative flow to ease tension before bedtime.",
    category: "exercise",
    contentURL: "https://youtu.be/4pKly2JojMw",
    provider: "Yoga With Adriene",
    tags: ["yoga", "restorative", "video"],
  },
  {
    _id: "who-anxiety-faq",
    title: "WHO: Anxiety and Stress FAQs",
    description: "Evidence-based answers to the most common anxiety questions.",
    category: "faqs",
    contentURL: "https://www.who.int/news-room/questions-and-answers/item/mental-health-anxiety",
    provider: "World Health Organization",
    tags: ["education", "anxiety"],
  },
  {
    _id: "journaling-template",
    title: "Mindful Morning Journaling Template",
    description: "Printable template that blends gratitude, check-ins, and planning.",
    category: "journaling",
    contentURL: "https://www.notion.so/templates/journal",
    provider: "Notion Templates",
    tags: ["template", "morning-routine"],
  },
  {
    _id: "nike-mobility",
    title: "Nike Training Club Mobility Flow",
    description: "10-minute mobility workout to loosen shoulders and hips.",
    category: "exercise",
    contentURL: "https://www.nike.com/ntc-app",
    provider: "Nike Training Club",
    tags: ["mobility", "app"],
  },
  {
    _id: "mayo-sleep",
    title: "Mayo Clinic Sleep Hygiene Guide",
    description: "Practical checklist for improving nighttime routines and rest.",
    category: "articles",
    contentURL: "https://www.mayoclinic.org/healthy-lifestyle/adult-health/in-depth/sleep/art-20048379",
    provider: "Mayo Clinic",
    tags: ["sleep", "education"],
  },
]

export default function Resources() {
  const [category, setCategory] = useState("all")
  const [page, setPage] = useState(0)
  const limit = 12

  const { data, isLoading } = useQuery({
    queryKey: ["resources", category, page],
    queryFn: () =>
      resourceAPI.getAll({
        category: category !== "all" ? category : undefined,
        limit,
        skip: page * limit,
      }),
  })

  const apiResources = data?.data?.resources || []
  const pagination = data?.data?.pagination
  const hasApiData = apiResources.length > 0

  const curatedResources = useMemo(() => {
    if (hasApiData) return []
    return FALLBACK_RESOURCES.filter((resource) =>
      category === "all" ? true : resource.category === category
    )
  }, [category, hasApiData])

  const resources = hasApiData ? apiResources : curatedResources
  const total = hasApiData ? pagination?.total || apiResources.length : curatedResources.length
  const hasMore = hasApiData ? pagination?.hasMore || false : false

  useEffect(() => {
    if (!hasApiData && page > 0) {
      setPage(0)
    }
  }, [hasApiData, page])

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
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-primary" />
              Resources
            </h1>
          </div>
          <p className="text-muted-foreground">
            Curated mental health resources, articles, and guides
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </Select>
        </div>
      </motion.div>

      {!hasApiData && !isLoading && (
        <div className="flex items-center gap-2 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 to-sky-100/40 px-4 py-2 text-sm text-primary dark:from-primary/20 dark:to-slate-900/40">
          <Sparkles className="h-4 w-4" />
          Showing hand-picked wellness resources while your personal library loads.
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      ) : resources.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No resources found</h3>
            <p className="text-muted-foreground text-center">
              {category !== "all"
                ? `No ${category} resources available at the moment.`
                : "No resources available at the moment."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource, index) => (
              <motion.div
                key={resource._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-lg line-clamp-2">
                          {resource.title}
                        </CardTitle>
                        {resource.provider && (
                          <p className="text-xs text-muted-foreground mt-1">
                            by {resource.provider}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge
                          variant="outline"
                          className={CATEGORY_COLORS[resource.category] || ""}
                        >
                          {resource.category}
                        </Badge>
                        {!hasApiData && (
                          <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                            <Sparkles className="h-3 w-3" />
                            Curated
                          </Badge>
                        )}
                      </div>
                    </div>
                    {resource.description && (
                      <CardDescription className="line-clamp-2">
                        {resource.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      {resource.createdBy && (
                        <p className="text-xs text-muted-foreground">
                          By {resource.createdBy.firstName} {resource.createdBy.lastName}
                        </p>
                      )}
                      {resource.createdAt && (
                        <p className="text-xs text-muted-foreground">
                          {formatDate(resource.createdAt)}
                        </p>
                      )}
                      {!resource.createdAt && resource.tags && (
                        <div className="flex flex-wrap gap-1 pt-2">
                          {resource.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-[11px] font-normal">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      asChild
                      variant="outline"
                      className="w-full mt-4"
                    >
                      <a
                        href={resource.contentURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2"
                      >
                        View Resource
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {(hasMore || page > 0) && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page + 1} of {Math.ceil(total / limit)}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasMore}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

