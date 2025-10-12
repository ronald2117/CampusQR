import { useState, useEffect } from 'react'
import { scannerService } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import './AccessLogs.css'

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
    <div className="access-logs-container">
      {/* Header */}
      <div className="access-logs-header">
        <div className="access-logs-title-section">
          <h2>Access Logs</h2>
          <p>View and filter all access attempts and verifications</p>
        </div>
        <button onClick={exportLogs} className="export-btn">
          <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="filter-card">
        <div className="filter-card-header">
          <h3 className="filter-card-title">
            <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </h3>
        </div>
        <div className="filter-card-body">
          <div className="filter-grid">
            <div className="filter-field">
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
            
            <div className="filter-field">
              <label htmlFor="date_from">From Date</label>
              <input
                type="date"
                id="date_from"
                name="date_from"
                value={filters.date_from}
                onChange={handleFilterChange}
              />
            </div>
            
            <div className="filter-field">
              <label htmlFor="date_to">To Date</label>
              <input
                type="date"
                id="date_to"
                name="date_to"
                value={filters.date_to}
                onChange={handleFilterChange}
              />
            </div>
            
            <div className="filter-field">
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
          
          <div className="filter-actions">
            <button onClick={fetchLogs} className="btn btn-primary" disabled={loading}>
              <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Apply Filters
            </button>
            <button onClick={clearFilters} className="btn btn-outline">
              <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-alert">
          <div>
            <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
          <button 
            onClick={fetchLogs}
            className="btn btn-outline"
            style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Logs Table */}
      <div className="logs-card">
        {logs.length > 0 ? (
          <>
            <div className="logs-table-container">
              <table className="logs-table">
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
                      <td className="datetime-cell">
                        <div className="date-text">
                          {new Date(log.created_at).toLocaleDateString()}
                        </div>
                        <div className="time-text">
                          {new Date(log.created_at).toLocaleTimeString()}
                        </div>
                      </td>
                      <td>
                        <div className="student-cell">
                          {log.photo_url ? (
                            <img
                              src={log.photo_url}
                              alt={log.student_name}
                              className="student-avatar"
                            />
                          ) : (
                            <div className="student-avatar-placeholder">
                              <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          )}
                          <div className="student-info">
                            <div className="student-name">
                              {log.student_name || 'Unknown'}
                            </div>
                            <div className="student-number">
                              {log.student_number || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{log.course || 'N/A'}</td>
                      <td>{log.location || 'Unknown'}</td>
                      <td>
                        <span className={`badge ${log.access_granted ? 'badge-success' : 'badge-danger'}`}>
                          {log.access_granted ? (
                            <>
                              <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Granted
                            </>
                          ) : (
                            <>
                              <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Denied
                            </>
                          )}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${log.verification_type === 'manual' ? 'badge-warning' : 'badge-info'}`}>
                          {log.verification_type === 'manual' ? (
                            <>
                              <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Manual
                            </>
                          ) : (
                            <>
                              <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                              </svg>
                              QR Code
                            </>
                          )}
                        </span>
                      </td>
                      <td>{log.scanned_by_username || 'Unknown'}</td>
                      <td className="details-cell">
                        {log.manual_reason && (
                          <div className="detail-reason">
                            <strong>Reason:</strong> {log.manual_reason}
                          </div>
                        )}
                        {log.error_message && (
                          <div className="detail-error">
                            <strong>Error:</strong> {log.error_message}
                          </div>
                        )}
                        {!log.manual_reason && !log.error_message && (
                          <span className="detail-standard">
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
              <div className="pagination-container">
                <div className="pagination-info">
                  Showing page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalLogs} total logs)
                </div>
                <div className="pagination-controls">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1 || loading}
                    className="pagination-btn"
                  >
                    <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                    First
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={!pagination.hasPrevPage || loading}
                    className="pagination-btn"
                  >
                    <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>
                  <span className="pagination-current">
                    {currentPage}
                  </span>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!pagination.hasNextPage || loading}
                    className="pagination-btn"
                  >
                    Next
                    <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setCurrentPage(pagination.totalPages)}
                    disabled={currentPage === pagination.totalPages || loading}
                    className="pagination-btn"
                  >
                    Last
                    <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
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
  )
}

export default AccessLogs
