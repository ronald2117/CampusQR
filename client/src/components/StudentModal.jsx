import { useState } from 'react'
import './StudentModal.css'

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

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="student-modal-overlay" onClick={handleOverlayClick}>
      <div className="student-modal">
        <div className="student-modal-header">
          <h3 className="student-modal-title">
            {student ? 'Edit Student' : 'Add New Student'}
          </h3>
          <button
            onClick={onClose}
            className="student-modal-close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="student-form">
                    <div className="student-modal-body">
            {error && (
              <div className="alert alert-error">
                <svg className="icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {/* Photo Upload */}
            <div className="photo-upload-section">
              <div className="photo-preview">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                  />
                ) : (
                  <svg className="photo-placeholder" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                id="photo"
                style={{ display: 'none' }}
              />
              <label htmlFor="photo" className="upload-btn">
                <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Upload Photo
              </label>
              <p className="upload-help-text">
                Optional. Max 5MB. JPG, PNG, or GIF.
              </p>
            </div>

            <div className="form-grid">
              {/* Student ID */}
              <div className="form-group">
                <label htmlFor="student_id" className="form-label">Student ID *</label>
                <input
                  type="text"
                  id="student_id"
                  name="student_id"
                  value={formData.student_id}
                  onChange={handleInputChange}
                  placeholder="e.g., STU001"
                  required
                  disabled={loading}
                  className="form-input"
                />
              </div>

              {/* Name */}
              <div className="form-group">
                <label htmlFor="name" className="form-label">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., John Doe"
                  required
                  disabled={loading}
                  className="form-input"
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-group form-group-full">
              <label htmlFor="email" className="form-label">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="e.g., john.doe@university.edu"
                required
                disabled={loading}
                className="form-input"
              />
            </div>

            <div className="form-grid">
              {/* Course */}
              <div className="form-group">
                <label htmlFor="course" className="form-label">Course/Program *</label>
                <select
                  id="course"
                  name="course"
                  value={formData.course}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  className="form-select"
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
              <div className="form-group">
                <label htmlFor="year_level" className="form-label">Year Level</label>
                <select
                  id="year_level"
                  name="year_level"
                  value={formData.year_level}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="form-select"
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
            <div className="form-group form-group-full">
              <label htmlFor="enrollment_status" className="form-label">Enrollment Status</label>
              <select
                id="enrollment_status"
                name="enrollment_status"
                value={formData.enrollment_status}
                onChange={handleInputChange}
                disabled={loading}
                className="form-select"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="graduated">Graduated</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="student-modal-footer">
            <div className="button-group">
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
                    <div className="spinner"></div>
                    {student ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {student ? 'Update Student' : 'Create Student'}
                  </>
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
