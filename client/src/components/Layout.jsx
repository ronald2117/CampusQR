import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import logo from '../../public/qr-logo.svg'
import './Layout.css'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const { user, logout } = useAuth()
  const location = useLocation()

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
      if (window.innerWidth > 768) {
        setSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const navigation = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: '📊',
      roles: ['admin', 'security', 'staff']
    },
    {
      name: 'Students',
      path: '/students',
      icon: '👥',
      roles: ['admin', 'staff']
    },
    {
      name: 'Scanner',
      path: '/scanner',
      icon: '📷',
      roles: ['admin', 'security']
    },
    {
      name: 'Access Logs',
      path: '/logs',
      icon: '📋',
      roles: ['admin', 'security']
    }
  ]

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role)
  )

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <div className={`sidebar ${isMobile ? 'sidebar-mobile' : ''} ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="logo-section">
          <div className="logo-icon">
            <img src={logo} alt="CampusQR Logo" />
          </div>
          <div>
            <h2 className="logo-text">
              CampusQR
            </h2>
            <p className="logo-version">
              v1.0.0
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="navigation">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* User Info */}
        <div className="user-section">
          <div className="user-info">
            <div className="user-avatar">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="user-details">
              <p className="user-name">
                {user?.username}
              </p>
              <p className="user-role">
                {user?.role}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="logout-button"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && isMobile && (
        <div
          className="mobile-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="main-content">
        {/* Header */}
        <header className="header">
          <div className="header-left">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mobile-menu-button"
              style={{ display: isMobile ? 'flex' : 'none' }}
            >
              ☰
            </button>

            <h1 className="page-title">
              {navigation.find(item => item.path === location.pathname)?.name || 'CampusQR'}
            </h1>
          </div>

          <div className="header-right">
            <span className="date-badge">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
