import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./contexts/AuthContext"
import { motion } from "framer-motion"

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

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (user) {
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

