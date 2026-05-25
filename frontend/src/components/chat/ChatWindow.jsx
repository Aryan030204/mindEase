import { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { AnimatePresence, motion } from "framer-motion"
import toast from "react-hot-toast"
import { Bot, MessageSquare, Send, User, X } from "lucide-react"
import { fetchChatHistory, sendChatMessage } from "@/features/adaptive/adaptiveSlice"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { Textarea } from "@/components/ui/Textarea"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { cn, formatDateTime } from "@/lib/utils"

export default function ChatWindow({ variant = "page", onClose }) {
  const dispatch = useDispatch()
  const { chatMessages, chatStatus, chatbotContext } = useSelector((state) => state.adaptive)
  const [message, setMessage] = useState("")
  const endRef = useRef(null)
  const isWidget = variant === "widget"

  useEffect(() => {
    dispatch(fetchChatHistory())
  }, [dispatch])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages, chatStatus])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!message.trim()) return

    const result = await dispatch(sendChatMessage(message))
    if (sendChatMessage.fulfilled.match(result)) {
      setMessage("")
    } else {
      toast.error(result.payload || "Failed to send message")
    }
  }

  return (
    <Card className={cn("flex w-full flex-col overflow-hidden border-slate-200 bg-white/95 shadow-xl", isWidget ? "h-[30rem]" : "h-full")}>
      {isWidget && (
        <div className="flex items-center justify-between border-b border-slate-200 bg-emerald-50/80 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">MindEase Chat</p>
              <p className="text-xs text-slate-500">Context rebuilt from mood, patterns, and recent progress</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <CardContent className="flex flex-1 flex-col p-0">
        {chatbotContext && (
          <div className="border-b border-slate-200 bg-slate-50/80 px-4 py-3 text-xs text-slate-500">
            Tone adapts from {chatbotContext.recentEmotionalState?.emotionTag || "recent mood"} and {chatbotContext.detectedPatterns?.length || 0} detected patterns.
          </div>
        )}

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {chatStatus === "loading" && chatMessages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : chatMessages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <MessageSquare className="mb-4 h-12 w-12 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-900">Adaptive chat is ready</h3>
              <p className="mt-2 max-w-md text-sm text-slate-500">
                Ask for grounding help, reflection prompts, or support with how you are feeling right now.
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {chatMessages.map((msg, index) => (
                <motion.div
                  key={`${msg.timestamp || index}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={cn("flex gap-3", msg.sender === "user" ? "justify-end" : "justify-start")}
                >
                  {msg.sender === "bot" && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-3xl border px-4 py-3 shadow-sm",
                      msg.sender === "user"
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-slate-200 bg-white text-slate-700"
                    )}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-6">{msg.text}</p>
                    {msg.timestamp && (
                      <p className={cn("mt-2 text-[10px] uppercase tracking-[0.16em]", msg.sender === "user" ? "text-white/70" : "text-slate-400")}>
                        {formatDateTime(msg.timestamp)}
                      </p>
                    )}
                  </div>
                  {msg.sender === "user" && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          {chatStatus === "loading" && chatMessages.length > 0 && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white px-4 py-3">
                <LoadingSpinner size="sm" />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form onSubmit={handleSubmit} className="flex gap-3 border-t border-slate-200 bg-white p-4">
          <Textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Talk about what feels heavy, restless, or unclear..."
            className="min-h-[64px] resize-none"
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault()
                handleSubmit(event)
              }
            }}
          />
          <Button type="submit" size="icon" disabled={!message.trim() || chatStatus === "loading"} className="self-end">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
