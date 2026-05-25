import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useAuth } from "./contexts/AuthContext"
import { motion } from "framer-motion"
import { loadOnboardingProfile, resetOnboardingState } from "./features/onboarding/onboardingSlice"
import { fetchAdaptiveDashboard, resetAdaptiveState } from "./features/adaptive/adaptiveSlice"

// Pages
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Dashboard from "./pages/Dashboard"
import MoodTracker from "./pages/MoodTracker"
import MoodAnalytics from "./pages/MoodAnalytics"
import Recommendations from "./pages/Recommendations"
import Chat from "./pages/Chat"
import Resources from "./pages/Resources"
import Profile from "./pages/Profile"
import Layout from "./components/layout/Layout"
import LoadingSpinner from "./components/ui/LoadingSpinner"
import OnboardingWelcomePage from "./pages/onboarding/OnboardingWelcomePage"
import OnboardingQuestionPage from "./pages/onboarding/OnboardingQuestionPage"
import OnboardingCompletePage from "./pages/onboarding/OnboardingCompletePage"
import OnboardingLayout from "./components/onboarding/OnboardingLayout"

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const { profile, profileStatus } = useSelector((state) => state.onboarding)

  if (loading || (user && profileStatus === "loading")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (profile && !profile.onboardingCompleted) {
    return <Navigate to="/onboarding/welcome" replace />
  }

  return children
}

function OnboardingRoute({ children }) {
  const { user, loading } = useAuth()
  const { profile, profileStatus } = useSelector((state) => state.onboarding)

  if (loading || (user && profileStatus === "loading")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (profile?.onboardingCompleted && !profile?.needsOnboardingUpgrade) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  const { profile, profileStatus } = useSelector((state) => state.onboarding)

  if (loading || (user && profileStatus === "loading")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (user) {
    if (profile && !profile.onboardingCompleted) {
      return <Navigate to="/onboarding/welcome" replace />
    }
    return <Navigate to="/dashboard" replace />
  }

  return children
}


const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

function AnimatedPage({ children }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}

function App() {
  const { user } = useAuth()
  const dispatch = useDispatch()

  useEffect(() => {
    if (user) {
      dispatch(loadOnboardingProfile())
      dispatch(fetchAdaptiveDashboard())
    } else {
      dispatch(resetOnboardingState())
      dispatch(resetAdaptiveState())
    }
  }, [dispatch, user])

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <AnimatedPage>
                <Login />
              </AnimatedPage>
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <AnimatedPage>
                <Signup />
              </AnimatedPage>
            </PublicRoute>
          }
        />
        <Route
          path="/onboarding"
          element={
            <OnboardingRoute>
              <OnboardingLayout />
            </OnboardingRoute>
          }
        >
          <Route
            path="welcome"
            element={
              <AnimatedPage>
                <OnboardingWelcomePage />
              </AnimatedPage>
            }
          />
          <Route
            path="question/:id"
            element={
              <AnimatedPage>
                <OnboardingQuestionPage />
              </AnimatedPage>
            }
          />
          <Route
            path="complete"
            element={
              <AnimatedPage>
                <OnboardingCompletePage />
              </AnimatedPage>
            }
          />
        </Route>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route
            path="dashboard"
            element={
              <AnimatedPage>
                <Dashboard />
              </AnimatedPage>
            }
          />
          <Route
            path="mood-tracker"
            element={
              <AnimatedPage>
                <MoodTracker />
              </AnimatedPage>
            }
          />
          <Route
            path="analytics"
            element={
              <AnimatedPage>
                <MoodAnalytics />
              </AnimatedPage>
            }
          />
          <Route
            path="recommendations"
            element={
              <AnimatedPage>
                <Recommendations />
              </AnimatedPage>
            }
          />
          <Route
            path="chat"
            element={
              <AnimatedPage>
                <Chat />
              </AnimatedPage>
            }
          />
          <Route
            path="resources"
            element={
              <AnimatedPage>
                <Resources />
              </AnimatedPage>
            }
          />
          <Route
            path="profile"
            element={
              <AnimatedPage>
                <Profile />
              </AnimatedPage>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

