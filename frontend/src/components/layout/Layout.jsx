import { Outlet } from "react-router-dom"
import Navbar from "./Navbar"
import Sidebar from "./Sidebar"
import { useState } from "react"
import { motion } from "framer-motion"
import ChatWidget from "../chat/ChatWidget"

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-pink-50 via-slate-50 to-sky-50 text-foreground dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-60 blur-3xl">
        <div className="absolute left-1/3 top-0 h-72 w-72 rounded-full bg-primary/20" />
        <div className="absolute bottom-10 right-10 h-64 w-64 rounded-full bg-sky-400/20 dark:bg-sky-500/10" />
      </div>

      <div className="relative z-10">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <motion.div
          initial={false}
          animate={{
            x: sidebarOpen ? 0 : "-100%",
          }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed left-0 top-0 z-50 h-screen w-64 lg:translate-x-0"
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </motion.div>

        {/* Main Content */}
        <div className="lg:pl-64">
          <main className="p-4 md:p-6 lg:p-8">
            <div className="rounded-3xl border border-white/40 bg-white/80 p-4 shadow-xl shadow-primary/5 backdrop-blur dark:border-white/10 dark:bg-slate-900/80">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      <ChatWidget />
    </div>
  )
}

