import { Link, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/contexts/ThemeContext"
import {
  Moon,
  Sun,
  Menu,
  LogOut,
  User,
  LayoutDashboard,
  HeartPulse,
  BarChart3,
  Sparkles,
  BookOpen,
  UserRound,
} from "lucide-react"
import { Button } from "../ui/Button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/DropdownMenu"
import { getInitials } from "@/lib/utils"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Mood", to: "/mood-tracker", icon: HeartPulse },
  { label: "Analytics", to: "/analytics", icon: BarChart3 },
  { label: "Recommendations", to: "/recommendations", icon: Sparkles },
  { label: "Resources", to: "/resources", icon: BookOpen },
  { label: "Profile", to: "/profile", icon: UserRound },
]

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()

  return (
    <nav className="sticky top-0 z-30 w-full border-b border-white/40 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 dark:border-white/10 dark:bg-slate-900/80">
      <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6">
        {/* Left: Logo and Mobile Menu */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-lg font-bold">M</span>
              </div>
              <span className="hidden text-xl font-bold sm:inline-block">
                MindEase
              </span>
            </motion.div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden flex-1 justify-center lg:flex">
          <div className="flex items-center gap-1 rounded-full border border-border/60 bg-background/80 px-2 py-1 shadow-inner shadow-primary/10">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon
              const isActive = location.pathname.startsWith(link.to)
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-gradient-to-r from-primary to-sky-500 text-white shadow-lg"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Right: Theme Toggle and User Menu */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="relative"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    {getInitials(user.firstName, user.lastName)}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  )
}

