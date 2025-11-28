import { ArrowLeft } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "./Button"

export default function BackButton({ fallback = "/dashboard", label = "Back" }) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleBack = () => {
    if (window.history.state && window.history.length > 1) {
      navigate(-1)
    } else if (location.pathname !== fallback) {
      navigate(fallback)
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleBack}
      className="rounded-full border border-border/60 bg-background/80 shadow-sm hover:shadow-md"
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      {label}
    </Button>
  )
}

