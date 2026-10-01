import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import Scanner from './pages/Scanner'
import AccessLogs from './pages/AccessLogs'
import Users from './pages/Users'
import SetupWizard from './pages/SetupWizard'
import LoadingSpinner from './components/LoadingSpinner'

function App() {
  const { user, loading } = useAuth()
  const location = useLocation()

  // Always let the setup wizard through without any auth check
  if (location.pathname === '/setup-wizard') {
    return <SetupWizard />
  }

  // Block ALL routes until the token-verify request finishes.
  // Without this, the public-route early returns below could fire
  // before checkAuthStatus() resolves, causing a flash or wrong redirect.
  if (loading) {
    return <LoadingSpinner />
  }

  // ── Public landing page ──────────────────────────────────
  if (location.pathname === '/') {
    if (user) return <Navigate to="/dashboard" replace />
    return <LandingPage />
  }

  // ── Login page ───────────────────────────────────────────
  if (location.pathname === '/login') {
    if (user) return <Navigate to="/dashboard" replace />
    return <Login />
  }

  // ── Protected routes ─────────────────────────────────────
  // Session expired or not logged in → send home (landing page).
  // Using '/' instead of '/login' avoids the black "Not found"
  // screen that appears when the server/SPA doesn't handle /login directly.
  if (!user) {
    return <Navigate to="/" replace />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/students"  element={<Students />} />
        <Route path="/scanner"   element={<Scanner />} />
        <Route path="/logs"      element={<AccessLogs />} />
        <Route path="/users"     element={<Users />} />
        {/* Any unknown path → dashboard when logged in */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
