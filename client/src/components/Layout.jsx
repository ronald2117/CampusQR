import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()

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
      icon: '📱',
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
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? '250px' : '250px',
        backgroundColor: '#1e293b',
        color: 'white',
        transition: 'all 0.3s',
        position: 'relative',
        ...(window.innerWidth <= 768 && {
          position: 'fixed',
          left: sidebarOpen ? '0' : '-250px',
          zIndex: 1000,
          height: '100vh'
        })
      }}>
        {/* Logo */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: '#2563eb',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem'
          }}>
            📱
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>
              CampusQR
            </h2>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
              v1.0.0
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ padding: '1rem 0' }}>
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1.5rem',
                  color: isActive ? '#2563eb' : '#cbd5e1',
                  backgroundColor: isActive ? '#1e40af20' : 'transparent',
                  borderRight: isActive ? '3px solid #2563eb' : '3px solid transparent',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? '600' : '400'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.target.style.backgroundColor = '#334155'
                    e.target.style.color = 'white'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.target.style.backgroundColor = 'transparent'
                    e.target.style.color = '#cbd5e1'
                  }
                }}
                onClick={() => setSidebarOpen(false)}
              >
                <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* User Info */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '1rem',
          borderTop: '1px solid #334155',
          backgroundColor: '#0f172a'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '0.75rem'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#2563eb',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}>
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: '500' }}>
                {user?.username}
              </p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
                {user?.role}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-outline btn-sm"
            style={{
              width: '100%',
              borderColor: '#475569',
              color: '#cbd5e1'
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && window.innerWidth <= 768 && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <header style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #e2e8f0',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                display: window.innerWidth <= 768 ? 'flex' : 'none',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                fontSize: '1.5rem',
                color: '#374151'
              }}
            >
              ☰
            </button>

            <h1 style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#1e293b'
            }}>
              {navigation.find(item => item.path === location.pathname)?.name || 'CampusQR'}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#f1f5f9',
              borderRadius: '20px',
              fontSize: '0.875rem',
              color: '#374151',
              fontWeight: '500'
            }}>
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
        <main style={{
          flex: 1,
          overflow: 'auto',
          padding: '1.5rem'
        }}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
