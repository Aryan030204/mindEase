import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { MessageCircle, Sparkles } from "lucide-react"
import ChatWindow from "./ChatWindow"

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="fixed bottom-24 right-4 z-50 w-[92vw] max-w-sm sm:bottom-28 sm:right-6"
          >
            <ChatWindow variant="widget" onClose={() => setIsOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-primary via-fuchsia-500 to-sky-500 text-white shadow-2xl shadow-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary sm:right-6"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open AI wellness chat"
      >
        {isOpen ? <Sparkles className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </motion.button>
    </>
  )
}

