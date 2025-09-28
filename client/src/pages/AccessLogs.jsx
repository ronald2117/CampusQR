import { useState, useEffect } from 'react'
import { scannerService } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

const AccessLogs = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pagination, setPagination] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    student_id: '',
    date_from: '',
    date_to: '',
    access_granted: ''
  })

  useEffect(() => {
    fetchLogs()
  }, [currentPage, filters])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: 20,
        ...filters
      }
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '') {
          delete params[key]
        }
      })

      const response = await scannerService.getLogs(params)
      
      if (response.success) {
        setLogs(response.data.logs)
        setPagination(response.data.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error)
      setError('Failed to load access logs')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({
      student_id: '',
      date_from: '',
      date_to: '',
      access_granted: ''
    })
    setCurrentPage(1)
  }

  const exportLogs = () => {
    // Create CSV content
    const headers = [
      'Date/Time',
      'Student ID',
      'Student Name',
      'Course',
      'Location',
      'Access Granted',
      'Verification Type',
      'Scanned By',
      'Reason/Error'
    ]
    
    const csvContent = [
      headers.join(','),
      ...logs.map(log => [
        new Date(log.created_at).toLocaleString(),
        log.student_number || 'N/A',
        log.student_name || 'Unknown',
        log.course || 'N/A',
        log.location || 'Unknown',
        log.access_granted ? 'Yes' : 'No',
        log.verification_type || 'qr',
        log.scanned_by_username || 'Unknown',
        log.manual_reason || log.error_message || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n')

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `access_logs_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  if (loading && logs.length === 0) {
    return <LoadingSpinner message="Loading access logs..." />
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h2 style={{ margin: 0 }}>Access Logs</h2>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>
            View and filter all access attempts and verifications
          </p>
        </div>
        <button onClick={exportLogs} className="btn btn-outline">
          📥 Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="card-header">
          <h3 className="card-title">Filters</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label htmlFor="student_id">Student ID</label>
              <input
                type="text"
                id="student_id"
                name="student_id"
                value={filters.student_id}
                onChange={handleFilterChange}
                placeholder="Search by student ID"
              />
            </div>
            
            <div>
              <label htmlFor="date_from">From Date</label>
              <input
                type="date"
                id="date_from"
                name="date_from"
                value={filters.date_from}
                onChange={handleFilterChange}
              />
            </div>
            
            <div>
              <label htmlFor="date_to">To Date</label>
              <input
                type="date"
                id="date_to"
                name="date_to"
                value={filters.date_to}
                onChange={handleFilterChange}
              />
            </div>
            
            <div>
              <label htmlFor="access_granted">Access Status</label>
              <select
                id="access_granted"
                name="access_granted"
                value={filters.access_granted}
                onChange={handleFilterChange}
              >
                <option value="">All</option>
                <option value="true">Granted</option>
                <option value="false">Denied</option>
              </select>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button onClick={fetchLogs} className="btn btn-primary" disabled={loading}>
              🔍 Apply Filters
            </button>
            <button onClick={clearFilters} className="btn btn-outline">
              🗑️ Clear Filters
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error mb-6">
          {error}
          <button 
            onClick={fetchLogs}
            className="btn btn-outline btn-sm"
            style={{ marginLeft: '1rem' }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Logs Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {logs.length > 0 ? (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date/Time</th>
                      <th>Student</th>
                      <th>Course</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Method</th>
                      <th>Scanned By</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id}>
                        <td>
                          <div>
                            <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>
                              {new Date(log.created_at).toLocaleDateString()}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {new Date(log.created_at).toLocaleTimeString()}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {log.photo_url ? (
                              <img
                                src={log.photo_url}
                                alt={log.student_name}
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  objectFit: 'cover'
                                }}
                              />
                            ) : (
                              <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: '#f1f5f9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.875rem'
                              }}>
                                👤
                              </div>
                            )}
                            <div>
                              <div style={{ fontWeight: '500' }}>
                                {log.student_name || 'Unknown'}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {log.student_number || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>{log.course || 'N/A'}</td>
                        <td>{log.location || 'Unknown'}</td>
                        <td>
                          <span className={`badge ${log.access_granted ? 'badge-success' : 'badge-danger'}`}>
                            {log.access_granted ? '✅ Granted' : '❌ Denied'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${log.verification_type === 'manual' ? 'badge-warning' : 'badge-info'}`}>
                            {log.verification_type === 'manual' ? '✏️ Manual' : '📱 QR Code'}
                          </span>
                        </td>
                        <td>{log.scanned_by_username || 'Unknown'}</td>
                        <td>
                          {log.manual_reason && (
                            <div style={{ fontSize: '0.875rem' }}>
                              <strong>Reason:</strong> {log.manual_reason}
                            </div>
                          )}
                          {log.error_message && (
                            <div style={{ fontSize: '0.875rem', color: 'var(--error-color)' }}>
                              <strong>Error:</strong> {log.error_message}
                            </div>
                          )}
                          {!log.manual_reason && !log.error_message && (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                              Standard verification
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div style={{
                  padding: '1rem 1.5rem',
                  borderTop: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    Showing page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalLogs} total logs)
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1 || loading}
                      className="btn btn-outline btn-sm"
                    >
                      ⏮️ First
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={!pagination.hasPrevPage || loading}
                      className="btn btn-outline btn-sm"
                    >
                      ← Previous
                    </button>
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 1rem',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}>
                      {currentPage}
                    </span>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={!pagination.hasNextPage || loading}
                      className="btn btn-outline btn-sm"
                    >
                      Next →
                    </button>
                    <button
                      onClick={() => setCurrentPage(pagination.totalPages)}
                      disabled={currentPage === pagination.totalPages || loading}
                      className="btn btn-outline btn-sm"
                    >
                      ⏭️ Last
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{
              padding: '3rem',
              textAlign: 'center',
              color: 'var(--text-muted)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
              <h3>No Access Logs Found</h3>
              <p>
                {Object.values(filters).some(v => v) 
                  ? 'No logs match your current filters.' 
                  : 'No access attempts have been recorded yet.'
                }
              </p>
              {Object.values(filters).some(v => v) && (
                <button onClick={clearFilters} className="btn btn-outline">
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AccessLogs
