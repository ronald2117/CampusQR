import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './Login.css'
import logo from '../../public/qr-logo.svg'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await login(formData.email, formData.password)
    
    if (!result.success) {
      setError(result.message)
    }
    
    setLoading(false)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-card-body">
          <div className="login-header">
            <div className="qr-logo">
                <img src={logo} alt="CampusQR Logo" className="logo-image" />
            </div>
            <h1 className="login-title">CampusQR</h1>
            <p className="login-subtitle">
              Student Verification System
            </p>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-input"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="demo-credentials-container">
            <p className="demo-title">
              Demo Credentials:
            </p>
            <div className="demo-item">
              <span className="demo-role">Admin:</span>
              <span className="demo-credentials">admin@campusqr.com / admin123</span>
            </div>
            <div className="demo-item">
              <span className="demo-role">Security:</span>
              <span className="demo-credentials">security@campusqr.com / security123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
