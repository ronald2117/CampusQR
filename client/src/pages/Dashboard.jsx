import { useState, useEffect } from 'react'
import { dashboardService } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import './Dashboard.css'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await dashboardService.getStats()
      if (response.success) {
        setStats(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      setError('Failed to load dashboard statistics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />
  }

  if (error) {
    return (
      <div className="error-alert">
        {error}
        <button 
          onClick={fetchStats}
          className="retry-btn"
        >
          Retry
        </button>
      </div>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="dashboard-container">
      {/* Overview Cards */}
      <div className="overview-grid">
        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-icon total-students">
              <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="stat-info">
              <p>Total Students</p>
              <h3>{stats?.overview?.totalStudents || 0}</h3>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-icon active-students">
              <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="stat-info">
              <p>Active Students</p>
              <h3>{stats?.overview?.activeStudents || 0}</h3>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-icon today-scans">
              <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <div className="stat-info">
              <p>Today's Scans</p>
              <h3>{stats?.overview?.todayAccess || 0}</h3>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-icon success-rate">
              <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="stat-info">
              <p>Success Rate</p>
              <h3>{stats?.overview?.successRate || 0}%</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="main-grid">
        {/* Recent Access Attempts */}
        <div className="content-card">
          <div className="content-card-header">
            <h3 className="content-card-title">Recent Access Attempts</h3>
            <p className="content-card-subtitle">Latest verification activities</p>
          </div>
          <div className="content-card-body">
            {stats?.recentAccess?.length > 0 ? (
              <div className="access-list">
                {stats.recentAccess.map((log, index) => (
                  <div key={index} className="access-item">
                    <div className={`access-icon ${log.access_granted ? 'granted' : 'denied'}`}>
                      {log.access_granted ? (
                        <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                    <div className="access-info">
                      <h4>{log.student_name || 'Unknown Student'}</h4>
                      <p>
                        {log.location || 'Unknown Location'} • {' '}
                        {new Date(log.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <span className={`access-badge ${log.access_granted ? 'granted' : 'denied'}`}>
                      {log.access_granted ? 'Granted' : 'Denied'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-message">No recent access attempts</p>
            )}
          </div>
        </div>

        {/* Weekly Statistics */}
        <div className="content-card">
          <div className="content-card-header">
            <h3 className="content-card-title">Weekly Statistics</h3>
            <p className="content-card-subtitle">Access attempts over the last 7 days</p>
          </div>
          <div className="content-card-body">
            {stats?.weeklyStats?.length > 0 ? (
              <div>
                {stats.weeklyStats.map((stat, index) => {
                  const maxAttempts = Math.max(...stats.weeklyStats.map(s => s.totalAttempts))
                  const percentage = maxAttempts > 0 ? (stat.totalAttempts / maxAttempts) * 100 : 0
                  
                  return (
                    <div key={index} className="weekly-stat-item">
                      <div className="weekly-stat-header">
                        <span className="weekly-stat-date">
                          {formatDate(stat.date)}
                        </span>
                        <span className="weekly-stat-info">
                          {stat.totalAttempts} attempts ({stat.successRate}% success)
                        </span>
                      </div>
                      <div className="progress-bar-container">
                        <div className="progress-bar" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="empty-message">No weekly statistics available</p>
            )}
          </div>
        </div>
      </div>

      {/* Additional Statistics */}
      <div className="additional-grid">
        {/* Top Courses */}
        <div className="content-card">
          <div className="content-card-header">
            <h3 className="content-card-title">Top Courses</h3>
            <p className="content-card-subtitle">Student distribution by course</p>
          </div>
          <div className="content-card-body">
            {stats?.topCourses?.length > 0 ? (
              <div className="courses-chart-container">
                <div className="pie-chart-wrapper">
                  <svg className="pie-chart" viewBox="0 0 100 100">
                    {(() => {
                      const total = stats.topCourses.reduce((sum, course) => sum + course.student_count, 0)
                      const colors = [
                        '#3b82f6', // blue
                        '#10b981', // green
                        '#f59e0b', // amber
                        '#ef4444', // red
                        '#8b5cf6', // purple
                        '#ec4899', // pink
                        '#06b6d4', // cyan
                        '#84cc16', // lime
                      ]
                      
                      let currentAngle = 0
                      
                      return stats.topCourses.map((course, index) => {
                        const percentage = (course.student_count / total) * 100
                        const angle = (percentage / 100) * 360
                        const startAngle = currentAngle
                        currentAngle += angle
                        
                        const startX = 50 + 50 * Math.cos((Math.PI * startAngle) / 180)
                        const startY = 50 + 50 * Math.sin((Math.PI * startAngle) / 180)
                        const endX = 50 + 50 * Math.cos((Math.PI * (startAngle + angle)) / 180)
                        const endY = 50 + 50 * Math.sin((Math.PI * (startAngle + angle)) / 180)
                        const largeArc = angle > 180 ? 1 : 0
                        
                        const pathData = [
                          `M 50 50`,
                          `L ${startX} ${startY}`,
                          `A 50 50 0 ${largeArc} 1 ${endX} ${endY}`,
                          `Z`
                        ].join(' ')
                        
                        return (
                          <path
                            key={index}
                            d={pathData}
                            fill={colors[index % colors.length]}
                            stroke="white"
                            strokeWidth="0.5"
                          />
                        )
                      })
                    })()}
                  </svg>
                </div>
                
                <div className="course-legends">
                  {(() => {
                    const total = stats.topCourses.reduce((sum, course) => sum + course.student_count, 0)
                    const colors = [
                      '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
                      '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
                    ]
                    
                    return stats.topCourses.map((course, index) => {
                      const percentage = ((course.student_count / total) * 100).toFixed(1)
                      
                      return (
                        <div key={index} className="course-legend-item">
                          <div 
                            className="course-legend-color" 
                            style={{ backgroundColor: colors[index % colors.length] }}
                          />
                          <div className="course-legend-info">
                            <div>
                              <div className="course-legend-name">{course.course}</div>
                              <div className="course-legend-count">
                                {course.student_count} students
                              </div>
                            </div>
                            <div className="course-legend-percentage">
                              {percentage}%
                            </div>
                          </div>
                        </div>
                      )
                    })
                  })()}
                </div>
              </div>
            ) : (
              <p className="empty-message">No course data available</p>
            )}
          </div>
        </div>

        {/* Enrollment Status */}
        <div className="content-card">
          <div className="content-card-header">
            <h3 className="content-card-title">Enrollment Status</h3>
            <p className="content-card-subtitle">Student status distribution</p>
          </div>
          <div className="content-card-body">
            {stats?.enrollmentStats?.length > 0 ? (
              stats.enrollmentStats.map((status, index) => (
                <div key={index} className="enrollment-item">
                  <div className={`enrollment-dot ${status.enrollment_status}`} />
                  <span className="enrollment-status">
                    {status.enrollment_status}
                  </span>
                  <span className="enrollment-count">
                    {status.count}
                  </span>
                </div>
              ))
            ) : (
              <p className="empty-message">No enrollment data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
