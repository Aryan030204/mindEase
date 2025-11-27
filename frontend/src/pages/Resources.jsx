import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { resourceAPI } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Select } from "@/components/ui/Select"
import { motion } from "framer-motion"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { BookOpen, ExternalLink, Filter } from "lucide-react"
import { formatDate } from "@/lib/utils"

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

  const resources = data?.data?.resources || []
  const total = data?.data?.pagination?.total || 0
  const hasMore = data?.data?.pagination?.hasMore || false

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="h-8 w-8" />
            Resources
          </h1>
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
                      <CardTitle className="text-lg line-clamp-2">
                        {resource.title}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className={CATEGORY_COLORS[resource.category] || ""}
                      >
                        {resource.category}
                      </Badge>
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

