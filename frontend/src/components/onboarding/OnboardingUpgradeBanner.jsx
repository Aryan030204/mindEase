import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/Button"
import { Sparkles } from "lucide-react"

export default function OnboardingUpgradeBanner() {
  const navigate = useNavigate()
  const profile = useSelector((state) => state.onboarding.profile)

  if (!profile?.needsOnboardingUpgrade) {
    return null
  }

  return (
    <div className="mb-4 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-white/70 to-sky-50 p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 rounded-full bg-primary/15 p-2 text-primary">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">
              We have improved how MindEase understands emotional patterns.
            </p>
            <p className="text-xs text-muted-foreground">
              Complete a quick profile refresh to upgrade your personalization.
            </p>
          </div>
        </div>
        <Button onClick={() => navigate("/onboarding/welcome")}>Refresh profile</Button>
      </div>
    </div>
  )
}
