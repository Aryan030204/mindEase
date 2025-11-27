import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Heart,
  BarChart3,
  Sparkles,
  MessageSquare,
  BookOpen,
  User,
  X,
} from "lucide-react"
import { Button } from "../ui/Button"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/mood-tracker", icon: Heart, label: "Mood Tracker" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/recommendations", icon: Sparkles, label: "Recommendations" },
  { to: "/chat", icon: MessageSquare, label: "AI Chat" },
  { to: "/resources", icon: BookOpen, label: "Resources" },
  { to: "/profile", icon: User, label: "Profile" },
]

export default function Sidebar({ onClose }) {
  return (
    <aside className="flex h-full w-64 flex-col border-r bg-card">
      {/* Mobile Close Button */}
      <div className="flex h-16 items-center justify-between border-b px-4 lg:hidden">
        <span className="text-lg font-semibold">Menu</span>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item, index) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )
            }
          >
            {({ isActive }) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3"
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <p className="text-xs text-muted-foreground">
          © 2024 MindEase. Your mental wellness companion.
        </p>
      </div>
    </aside>
  )
}

