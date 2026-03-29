import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { authAPI } from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/Dialog"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { motion } from "framer-motion"
import { Heart } from "lucide-react"
import toast from "react-hot-toast"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [isForgotOpen, setIsForgotOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [requestCodeLoading, setRequestCodeLoading] = useState(false)
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)
  const [codeSent, setCodeSent] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (cooldownSeconds <= 0) {
      return undefined
    }

    const timer = setInterval(() => {
      setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [cooldownSeconds])

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const result = await login(email, password)
    setLoading(false)

    if (result.success) {
      navigate("/dashboard")
    }
  }

  const handleOpenForgotPassword = () => {
    setResetEmail(email)
    setIsForgotOpen(true)
  }

  const handleSendCode = async () => {
    if (!resetEmail.trim()) {
      toast.error("Please enter your email")
      return
    }

    setRequestCodeLoading(true)
    try {
      const response = await authAPI.requestPasswordResetCode({ email: resetEmail.trim() })
      const waitSeconds = Number(response.data?.retryAfterSeconds) || 300

      setCodeSent(true)
      setCooldownSeconds(waitSeconds)
      toast.success(response.data?.message || "Recovery code sent")
    } catch (error) {
      const retryAfter = Number(error.response?.data?.retryAfterSeconds) || 0
      if (retryAfter > 0) {
        setCooldownSeconds(retryAfter)
      }
      toast.error(error.response?.data?.message || "Failed to send recovery code")
    } finally {
      setRequestCodeLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()

    const trimmedOtp = otp.trim()
    if (!/^\d{6}$/.test(trimmedOtp)) {
      toast.error("Enter a valid 6 digit code")
      return
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters")
      return
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("Passwords do not match")
      return
    }

    setResetPasswordLoading(true)
    try {
      const response = await authAPI.resetPasswordWithCode({
        email: resetEmail.trim(),
        otp: trimmedOtp,
        newPassword,
      })
      toast.success(response.data?.message || "Password reset successful")
      setIsForgotOpen(false)
      setOtp("")
      setNewPassword("")
      setConfirmNewPassword("")
      setCodeSent(false)
      setCooldownSeconds(0)
      setPassword("")
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password")
    } finally {
      setResetPasswordLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-2">
          <CardHeader className="space-y-1 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground"
            >
              <Heart className="h-8 w-8" />
            </motion.div>
            <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your MindEase account to continue your wellness journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    onClick={handleOpenForgotPassword}
                    className="text-xs font-medium text-primary hover:underline"
                    disabled={loading}
                  >
                    Forget password?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link to="/signup" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={isForgotOpen} onOpenChange={setIsForgotOpen}>
        <DialogContent onClose={() => setIsForgotOpen(false)}>
          <DialogHeader className="mb-4">
            <DialogTitle>Recover Your MindEase Password</DialogTitle>
            <DialogDescription>
              Enter your email to receive a 6 digit code. The code expires in 5 minutes.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="you@example.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                disabled={requestCodeLoading || resetPasswordLoading}
                required
              />
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleSendCode}
              disabled={requestCodeLoading || resetPasswordLoading || cooldownSeconds > 0}
            >
              {requestCodeLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Sending code...
                </>
              ) : cooldownSeconds > 0 ? (
                `Send code in ${formatCountdown(cooldownSeconds)}`
              ) : (
                "Send Code"
              )}
            </Button>

            <div className="space-y-2">
              <Label htmlFor="otp">6 digit code</Label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                disabled={resetPasswordLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={resetPasswordLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">Confirm new password</Label>
              <Input
                id="confirm-new-password"
                type="password"
                placeholder="Re-enter new password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                disabled={resetPasswordLoading}
                required
              />
            </div>

            {codeSent && (
              <p className="text-xs text-muted-foreground">
                A MindEase recovery code has been sent. Use it within 5 minutes to reset your password.
              </p>
            )}

            <Button type="submit" className="w-full" disabled={resetPasswordLoading || !codeSent}>
              {resetPasswordLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Resetting password...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

