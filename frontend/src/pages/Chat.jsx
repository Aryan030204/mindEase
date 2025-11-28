import { MessageSquare } from "lucide-react"
import { motion } from "framer-motion"
import ChatWindow from "@/components/chat/ChatWindow"
import BackButton from "@/components/ui/BackButton"

export default function Chat() {
  return (
    <div className="flex flex-col space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <BackButton />
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <MessageSquare className="h-8 w-8 text-primary" />
              AI Wellness Chat
            </h1>
          </div>
          <p className="text-muted-foreground">
            Chat with our AI companion for mental health support and guidance
          </p>
        </div>
      </motion.div>

      <div className="h-[calc(100vh-18rem)]">
        <ChatWindow variant="page" />
      </div>
    </div>
  )
}

