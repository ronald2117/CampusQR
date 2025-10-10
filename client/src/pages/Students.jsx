import { useState, useEffect } from 'react'
import { studentService } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import StudentModal from '../components/StudentModal'
import QRCodeModal from '../components/QRCodeModal'
import './Students.css'

const Students = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const [showModal, setShowModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showQRModal, setShowQRModal] = useState(false)
  const [qrData, setQrData] = useState(null)
  
  const { isAdmin } = useAuth()

  useEffect(() => {
    fetchStudents()
  }, [currentPage, searchTerm])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const response = await studentService.getAll({
        page: currentPage,
        limit: 10,
        search: searchTerm
      })
      
      if (response.success) {
        setStudents(response.data.students)
        setPagination(response.data.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch students:', error)
      setError('Failed to load students')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleEdit = (student) => {
    setSelectedStudent(student)
    setShowModal(true)
  }

  const handleAdd = () => {
    setSelectedStudent(null)
    setShowModal(true)
  }

  const handleDelete = async (student) => {
    if (window.confirm(`Are you sure you want to delete ${student.name}?`)) {
      try {
        await studentService.delete(student.id)
        fetchStudents()
      } catch (error) {
        alert('Failed to delete student')
      }
    }
  }

  const handleGenerateQR = async (student) => {
    try {
      setLoading(true)
      const response = await studentService.generateQR(student.id)
      if (response.success) {
        setQrData(response.data)
        setShowQRModal(true)
      }
    } catch (error) {
      alert('Failed to generate QR code')
    } finally {
      setLoading(false)
    }
  }

  const handleModalSubmit = async (formData) => {
    try {
      if (selectedStudent) {
        await studentService.update(selectedStudent.id, formData)
      } else {
        await studentService.create(formData)
      }
      setShowModal(false)
      fetchStudents()
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to save student')
    }
  }

  if (loading && students.length === 0) {
    return <LoadingSpinner message="Loading students..." />
  }

  return (
    <div className="students-container">
      {/* Header */}
      <div className="students-header">
        <div className="students-header-content">
          <h2>Students Management</h2>
          <p>Manage student records and generate QR codes</p>
        </div>
        {isAdmin && (
          <button onClick={handleAdd} className="add-student-btn">
            <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Student
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="search-card">
        <div className="search-card-body">
          <div className="search-controls">
            <div className="search-input-container">
              <input
                type="text"
                className="search-input"
                placeholder="Search students by name, ID, email, or course..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <button 
              onClick={fetchStudents} 
              className="refresh-btn"
              disabled={loading}
            >
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-alert">
          {error}
          <button 
            onClick={fetchStudents}
            className="retry-btn"
          >
            Retry
          </button>
        </div>
      )}

      {/* Students Table */}
      <div className="students-table-card">
        {students.length > 0 ? (
          <>
            <div className="table-container">
              <table className="students-table">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Course</th>
                    <th>Year</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td>
                        <span className="student-id">{student.student_id}</span>
                      </td>
                      <td>
                        <div>
                          <div className="student-name">{student.name}</div>
                          <div className="student-created">
                            Added {new Date(student.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="student-course">{student.email}</td>
                      <td className="student-course">{student.course}</td>
                      <td className="student-year">Year {student.year_level}</td>
                      <td>
                        <span className={`status-badge ${student.enrollment_status}`}>
                          {student.enrollment_status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleGenerateQR(student)}
                            className="action-btn qr-btn"
                            title="Generate QR Code"
                          >
                            <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                            </svg>
                          </button>
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => handleEdit(student)}
                                className="action-btn edit-btn"
                                title="Edit Student"
                              >
                                <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(student)}
                                className="action-btn delete-btn"
                                title="Delete Student"
                              >
                                <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
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
                  Showing page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalStudents} total)
                </div>
                <div className="pagination-controls">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="pagination-btn"
                  >
                    <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="pagination-btn"
                  >
                    Next
                    <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{width: '2rem', height: '2rem'}}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3>No Students Found</h3>
            <p>
              {searchTerm 
                ? 'No students match your search criteria.' 
                : 'Get started by adding your first student.'
              }
            </p>
            {isAdmin && !searchTerm && (
              <button onClick={handleAdd} className="empty-state-btn">
                Add First Student
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showModal && (
        <StudentModal
          student={selectedStudent}
          onSubmit={handleModalSubmit}
          onClose={() => setShowModal(false)}
        />
      )}

      {showQRModal && qrData && (
        <QRCodeModal
          qrData={qrData}
          onClose={() => setShowQRModal(false)}
        />
      )}
    </div>
  )
}

export default Students
