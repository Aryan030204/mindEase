import { useState, useRef, useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { chatAPI } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/Card"
import { Textarea } from "@/components/ui/Textarea"
import { Button } from "@/components/ui/Button"
import { motion, AnimatePresence } from "framer-motion"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { Bot, Send, User, MessageSquare, X } from "lucide-react"
import { formatDateTime } from "@/lib/utils"
import toast from "react-hot-toast"
import { cn } from "@/lib/utils"

export default function ChatWindow({ variant = "page", onClose }) {
  const [message, setMessage] = useState("")
  const messagesEndRef = useRef(null)
  const queryClient = useQueryClient()

  const { data: chatHistory, isLoading: historyLoading } = useQuery({
    queryKey: ["chatHistory"],
    queryFn: () => chatAPI.getHistory(50),
  })

  const messages = chatHistory?.data?.messages || []

  const sendMutation = useMutation({
    mutationFn: (message) => chatAPI.sendQuery(message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatHistory"] })
      setMessage("")
      scrollToBottom()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to send message")
    },
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!message.trim()) return
    sendMutation.mutate(message)
  }

  const isWidget = variant === "widget"

  return (
    <Card
      className={cn(
        "flex w-full flex-col overflow-hidden border-primary/10 shadow-2xl",
        isWidget ? "h-[28rem] rounded-3xl" : "h-full"
      )}
    >
      {isWidget && (
        <div className="flex items-center justify-between border-b border-border/50 bg-gradient-to-r from-primary/10 via-pink-100/30 to-blue-100/40 px-4 py-3 dark:from-primary/20 dark:via-slate-900 dark:to-slate-900/60">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">MindEase AI</p>
              <p className="text-xs text-muted-foreground">Always-on support</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <CardContent className={cn("flex flex-1 flex-col p-0", isWidget && "bg-background/80")}>
        <div className={cn("flex-1 space-y-4 overflow-y-auto p-6", isWidget && "text-sm")}>
          {historyLoading ? (
            <div className="flex h-full items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Say hi to your wellness companion</h3>
              <p className="text-muted-foreground">
                Share your feelings or ask for grounding exercises, playlists, or reflections.
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((msg, index) => (
                <motion.div
                  key={`${msg.timestamp}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.02 }}
                  className={cn(
                    "flex gap-3",
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.sender === "bot" && (
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl border p-3 shadow-sm",
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground border-primary/30"
                        : "bg-background/70 border-border/60"
                    )}
                  >
                    <p className="whitespace-pre-wrap text-sm">{msg.text}</p>
                    {msg.timestamp && (
                      <p
                        className={cn(
                          "mt-2 text-[10px] uppercase tracking-wide",
                          msg.sender === "user"
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        )}
                      >
                        {formatDateTime(msg.timestamp)}
                      </p>
                    )}
                  </div>
                  {msg.sender === "user" && (
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          {sendMutation.isPending && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl bg-muted p-3">
                <LoadingSpinner size="sm" />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex gap-2 border-t border-border/50 bg-background/90 p-4 backdrop-blur"
        >
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask for breathing tips, playlists, gratitude prompts..."
            className="min-h-[60px] max-h-[120px] resize-none text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
            disabled={sendMutation.isPending}
          />
          <Button type="submit" size="icon" disabled={!message.trim() || sendMutation.isPending} className="self-end">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

