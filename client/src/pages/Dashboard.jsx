import { useState, useEffect } from 'react'
import { dashboardService } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

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
      <div className="alert alert-error">
        {error}
        <button 
          onClick={fetchStats}
          className="btn btn-outline btn-sm"
          style={{ marginLeft: '1rem' }}
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
    <div className="container-fluid">
      {/* Overview Cards */}
      <div className="grid grid-cols-4 mb-8">
        <div className="card">
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '50px',
                height: '50px',
                backgroundColor: '#dbeafe',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                👥
              </div>
              <div>
                <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem' }}>
                  Total Students
                </p>
                <h3 style={{ margin: 0, fontSize: '2rem', fontWeight: '700' }}>
                  {stats?.overview?.totalStudents || 0}
                </h3>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '50px',
                height: '50px',
                backgroundColor: '#dcfce7',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                ✅
              </div>
              <div>
                <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem' }}>
                  Active Students
                </p>
                <h3 style={{ margin: 0, fontSize: '2rem', fontWeight: '700' }}>
                  {stats?.overview?.activeStudents || 0}
                </h3>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '50px',
                height: '50px',
                backgroundColor: '#fef3c7',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                📱
              </div>
              <div>
                <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem' }}>
                  Today's Scans
                </p>
                <h3 style={{ margin: 0, fontSize: '2rem', fontWeight: '700' }}>
                  {stats?.overview?.todayAccess || 0}
                </h3>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '50px',
                height: '50px',
                backgroundColor: '#f0f9ff',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                📊
              </div>
              <div>
                <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem' }}>
                  Success Rate
                </p>
                <h3 style={{ margin: 0, fontSize: '2rem', fontWeight: '700' }}>
                  {stats?.overview?.successRate || 0}%
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Recent Access Attempts */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Access Attempts</h3>
            <p className="card-subtitle">Latest verification activities</p>
          </div>
          <div className="card-body">
            {stats?.recentAccess?.length > 0 ? (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {stats.recentAccess.map((log, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '0.75rem 0',
                      borderBottom: index < stats.recentAccess.length - 1 ? '1px solid var(--border-color)' : 'none'
                    }}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: log.access_granted ? '#dcfce7' : '#fef2f2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem'
                    }}>
                      {log.access_granted ? '✅' : '❌'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: '500' }}>
                        {log.student_name || 'Unknown Student'}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        {log.location || 'Unknown Location'} • {' '}
                        {new Date(log.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <span className={`badge ${log.access_granted ? 'badge-success' : 'badge-danger'}`}>
                      {log.access_granted ? 'Granted' : 'Denied'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-center">No recent access attempts</p>
            )}
          </div>
        </div>

        {/* Weekly Statistics */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Weekly Statistics</h3>
            <p className="card-subtitle">Access attempts over the last 7 days</p>
          </div>
          <div className="card-body">
            {stats?.weeklyStats?.length > 0 ? (
              <div>
                {stats.weeklyStats.map((stat, index) => {
                  const maxAttempts = Math.max(...stats.weeklyStats.map(s => s.totalAttempts))
                  const percentage = maxAttempts > 0 ? (stat.totalAttempts / maxAttempts) * 100 : 0
                  
                  return (
                    <div
                      key={index}
                      style={{
                        marginBottom: '1rem',
                        padding: '0.75rem 0'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.5rem'
                      }}>
                        <span style={{ fontWeight: '500', fontSize: '0.875rem' }}>
                          {formatDate(stat.date)}
                        </span>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                          {stat.totalAttempts} attempts ({stat.successRate}% success)
                        </span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '8px',
                        backgroundColor: 'var(--border-color)',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${percentage}%`,
                          height: '100%',
                          backgroundColor: 'var(--primary-color)',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-muted text-center">No weekly statistics available</p>
            )}
          </div>
        </div>
      </div>

      {/* Additional Statistics */}
      <div className="grid grid-cols-2 gap-6 mt-6">
        {/* Top Courses */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Top Courses</h3>
            <p className="card-subtitle">Student distribution by course</p>
          </div>
          <div className="card-body">
            {stats?.topCourses?.length > 0 ? (
              stats.topCourses.map((course, index) => {
                const maxCount = Math.max(...stats.topCourses.map(c => c.student_count))
                const percentage = (course.student_count / maxCount) * 100
                
                return (
                  <div key={index} style={{ marginBottom: '1rem' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{ fontWeight: '500' }}>{course.course}</span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        {course.student_count} students
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '6px',
                      backgroundColor: 'var(--border-color)',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${percentage}%`,
                        height: '100%',
                        backgroundColor: '#10b981',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-muted text-center">No course data available</p>
            )}
          </div>
        </div>

        {/* Enrollment Status */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Enrollment Status</h3>
            <p className="card-subtitle">Student status distribution</p>
          </div>
          <div className="card-body">
            {stats?.enrollmentStats?.length > 0 ? (
              stats.enrollmentStats.map((status, index) => {
                const colors = {
                  active: '#10b981',
                  inactive: '#f59e0b',
                  graduated: '#6366f1',
                  suspended: '#ef4444'
                }
                
                return (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '0.75rem 0',
                      borderBottom: index < stats.enrollmentStats.length - 1 ? '1px solid var(--border-color)' : 'none'
                    }}
                  >
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: colors[status.enrollment_status] || '#64748b'
                    }} />
                    <span style={{ flex: 1, textTransform: 'capitalize' }}>
                      {status.enrollment_status}
                    </span>
                    <span style={{ fontWeight: '600' }}>
                      {status.count}
                    </span>
                  </div>
                )
              })
            ) : (
              <p className="text-muted text-center">No enrollment data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
