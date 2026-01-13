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
  const [showPassword, setShowPassword] = useState(false)
  
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await login(formData.email, formData.password)
      
      if (!result.success) {
        let errorMessage = 'Login failed'
        
        if (result.message === 'Invalid credentials') {
          errorMessage = '❌ Login Failed\n\nIncorrect email or password. Please check your credentials and try again.'
        } else if (result.message === 'Email and password are required') {
          errorMessage = '❌ Missing Information\n\nPlease enter both email and password.'
        } else if (result.message === 'Internal server error') {
          errorMessage = '❌ Server Error\n\nThe server encountered an error. Please try again later or contact support.'
        } else if (result.message.includes('Network Error') || result.message.includes('timeout')) {
          errorMessage = '❌ Connection Error\n\nUnable to connect to the server. Please check your internet connection and try again.'
        } else {
          errorMessage = `❌ Login Failed\n\n${result.message}`
        }
        
        alert(errorMessage)
        setError(result.message)
      }
    } catch (error) {
      alert('❌ Unexpected Error\n\nAn unexpected error occurred. Please try again.')
      setError('An unexpected error occurred')
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
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className="form-input password-input"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="icon">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="icon">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? (
                <>
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
