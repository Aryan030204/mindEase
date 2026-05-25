import { Outlet } from "react-router-dom"

export default function OnboardingLayout() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-primary/10 via-white to-sky-50 text-foreground">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-60 blur-3xl">
        <div className="absolute left-1/4 top-0 h-72 w-72 rounded-full bg-primary/20" />
        <div className="absolute bottom-10 right-10 h-64 w-64 rounded-full bg-sky-400/20" />
      </div>
      <div className="relative z-10 px-4 py-10">
        <Outlet />
      </div>
    </div>
  )
}
