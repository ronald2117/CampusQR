import { useState, useEffect } from 'react'
import { studentService } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import StudentModal from '../components/StudentModal'
import QRCodeModal from '../components/QRCodeModal'

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

  const getStatusBadge = (status) => {
    const badges = {
      active: 'badge-success',
      inactive: 'badge-warning',
      graduated: 'badge-info',
      suspended: 'badge-danger'
    }
    return badges[status] || 'badge-secondary'
  }

  if (loading && students.length === 0) {
    return <LoadingSpinner message="Loading students..." />
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
          <h2 style={{ margin: 0 }}>Students Management</h2>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>
            Manage student records and generate QR codes
          </p>
        </div>
        {isAdmin && (
          <button onClick={handleAdd} className="btn btn-primary">
            ➕ Add Student
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="card mb-6">
        <div className="card-body">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <input
                type="text"
                placeholder="Search students by name, ID, email, or course..."
                value={searchTerm}
                onChange={handleSearch}
                style={{ margin: 0 }}
              />
            </div>
            <button 
              onClick={fetchStudents} 
              className="btn btn-outline"
              disabled={loading}
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error mb-6">
          {error}
          <button 
            onClick={fetchStudents}
            className="btn btn-outline btn-sm"
            style={{ marginLeft: '1rem' }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Students Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {students.length > 0 ? (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Photo</th>
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
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: '#f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden'
                          }}>
                            {student.photo_url ? (
                              <img
                                src={student.photo_url}
                                alt={student.name}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                              />
                            ) : (
                              <span style={{ fontSize: '1.25rem' }}>👤</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: '600' }}>{student.student_id}</span>
                        </td>
                        <td>
                          <div>
                            <div style={{ fontWeight: '500' }}>{student.name}</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                              Added {new Date(student.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                        <td>{student.email}</td>
                        <td>{student.course}</td>
                        <td>Year {student.year_level}</td>
                        <td>
                          <span className={`badge ${getStatusBadge(student.enrollment_status)}`}>
                            {student.enrollment_status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => handleGenerateQR(student)}
                              className="btn btn-outline btn-sm"
                              title="Generate QR Code"
                            >
                              📱
                            </button>
                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => handleEdit(student)}
                                  className="btn btn-outline btn-sm"
                                  title="Edit Student"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleDelete(student)}
                                  className="btn btn-danger btn-sm"
                                  title="Delete Student"
                                >
                                  🗑️
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
                <div style={{
                  padding: '1rem 1.5rem',
                  borderTop: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'between',
                  alignItems: 'center'
                }}>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    Showing page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalStudents} total)
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={!pagination.hasPrevPage}
                      className="btn btn-outline btn-sm"
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                      className="btn btn-outline btn-sm"
                    >
                      Next →
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
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
              <h3>No Students Found</h3>
              <p>
                {searchTerm 
                  ? 'No students match your search criteria.' 
                  : 'Get started by adding your first student.'
                }
              </p>
              {isAdmin && !searchTerm && (
                <button onClick={handleAdd} className="btn btn-primary">
                  Add First Student
                </button>
              )}
            </div>
          )}
        </div>
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
