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

  if (location.pathname === '/setup-wizard') {
    return <SetupWizard />
  }

  // Public landing page — always accessible at /
  if (location.pathname === '/') {
    if (user) {
      return <Navigate to="/dashboard" replace />
    }
    return <LandingPage />
  }

  // Login page — accessible without auth
  if (location.pathname === '/login') {
    if (user) {
      return <Navigate to="/dashboard" replace />
    }
    return <Login />
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/students" element={<Students />} />
        <Route path="/scanner" element={<Scanner />} />
        <Route path="/logs" element={<AccessLogs />} />
        <Route path="/users" element={<Users />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
