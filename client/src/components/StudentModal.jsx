import { useState } from 'react'

const StudentModal = ({ student, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    student_id: student?.student_id || '',
    name: student?.name || '',
    email: student?.email || '',
    course: student?.course || '',
    year_level: student?.year_level || 1,
    enrollment_status: student?.enrollment_status || 'active',
    photo: null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [previewUrl, setPreviewUrl] = useState(student?.photo_url || null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB')
        return
      }
      
      setFormData(prev => ({ ...prev, photo: file }))
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Create FormData object for file upload
      const submitData = new FormData()
      
      Object.keys(formData).forEach(key => {
        if (key === 'photo' && formData[key]) {
          submitData.append('photo', formData[key])
        } else if (key !== 'photo') {
          submitData.append(key, formData[key])
        }
      })

      await onSubmit(submitData)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: '600px' }}>
        <div className="card-header">
          <h3 className="card-title">
            {student ? 'Edit Student' : 'Add New Student'}
          </h3>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: 'var(--text-muted)'
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card-body">
            {error && (
              <div className="alert alert-error mb-4">
                {error}
              </div>
            )}

            {/* Photo Upload */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                backgroundColor: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                overflow: 'hidden',
                border: '3px dashed var(--border-color)'
              }}>
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <span style={{ fontSize: '3rem', color: 'var(--text-muted)' }}>👤</span>
                )}
              </div>
              
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                id="photo"
                style={{ display: 'none' }}
              />
              <label htmlFor="photo" className="btn btn-outline btn-sm">
                📷 Upload Photo
              </label>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0.5rem 0 0' }}>
                Optional. Max 5MB. JPG, PNG, or GIF.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Student ID */}
              <div>
                <label htmlFor="student_id">Student ID *</label>
                <input
                  type="text"
                  id="student_id"
                  name="student_id"
                  value={formData.student_id}
                  onChange={handleInputChange}
                  placeholder="e.g., STU001"
                  required
                  disabled={loading}
                />
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., John Doe"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email */}
            <div style={{ marginTop: '1rem' }}>
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="e.g., john.doe@university.edu"
                required
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4" style={{ marginTop: '1rem' }}>
              {/* Course */}
              <div>
                <label htmlFor="course">Course/Program *</label>
                <select
                  id="course"
                  name="course"
                  value={formData.course}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                >
                  <option value="">Select Course</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Business Administration">Business Administration</option>
                  <option value="Nursing">Nursing</option>
                  <option value="Education">Education</option>
                  <option value="Psychology">Psychology</option>
                  <option value="Accounting">Accounting</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Year Level */}
              <div>
                <label htmlFor="year_level">Year Level</label>
                <select
                  id="year_level"
                  name="year_level"
                  value={formData.year_level}
                  onChange={handleInputChange}
                  disabled={loading}
                >
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year</option>
                  <option value={5}>5th Year</option>
                </select>
              </div>
            </div>

            {/* Enrollment Status */}
            <div style={{ marginTop: '1rem' }}>
              <label htmlFor="enrollment_status">Enrollment Status</label>
              <select
                id="enrollment_status"
                name="enrollment_status"
                value={formData.enrollment_status}
                onChange={handleInputChange}
                disabled={loading}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="graduated">Graduated</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="card-footer">
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                    {student ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  student ? 'Update Student' : 'Create Student'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StudentModal
