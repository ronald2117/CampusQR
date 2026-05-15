import { useNavigate } from 'react-router-dom'
import './Landing.css'
import logo from '../../public/qr-logo.svg'

function Landing() {
  const navigate = useNavigate()

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <img src={logo} alt="CampusQR Logo" className="logo-icon" />
            <span className="logo-text">CampusQR</span>
          </div>
          <button className="nav-button" onClick={() => navigate('/login')}>
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Campus Access Management
              <span className="hero-gradient"> Made Simple</span>
            </h1>
            <p className="hero-description">
              Streamline your campus security with modern QR code technology.
              Track attendance, manage students, and monitor access in real-time.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary" onClick={() => navigate('/login')}>
                Get Started
                <svg className="btn-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <div className="stat-value">99.9%</div>
                <div className="stat-label">Uptime</div>
              </div>
              <div className="stat">
                <div className="stat-value">Fast</div>
                <div className="stat-label">Scanning</div>
              </div>
              <div className="stat">
                <div className="stat-value">Secure</div>
                <div className="stat-label">Encrypted</div>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="visual-card">
              <div className="qr-demo">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <rect x="20" y="20" width="60" height="60" fill="#667eea" />
                  <rect x="120" y="20" width="60" height="60" fill="#667eea" />
                  <rect x="20" y="120" width="60" height="60" fill="#667eea" />
                  <rect x="30" y="30" width="40" height="40" fill="#fff" />
                  <rect x="130" y="30" width="40" height="40" fill="#fff" />
                  <rect x="30" y="130" width="40" height="40" fill="#fff" />
                  <rect x="120" y="120" width="20" height="20" fill="#667eea" />
                  <rect x="150" y="120" width="20" height="20" fill="#667eea" />
                  <rect x="120" y="150" width="20" height="20" fill="#667eea" />
                  <rect x="160" y="150" width="20" height="20" fill="#667eea" />
                </svg>
              </div>
              <div className="scan-line"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="features-container">
          <div className="section-header">
            <h2 className="section-title">Everything you need</h2>
            <p className="section-subtitle">
              Powerful features to manage your campus access control system
            </p>
          </div>

          <div className="features-grid">
            <div className="feature">
              <div className="feature-icon-wrapper">
                <svg className="feature-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <h3 className="feature-title">QR Code Scanning</h3>
              <p className="feature-description">
                Lightning-fast QR code scanning with camera support on any device
              </p>
            </div>

            <div className="feature">
              <div className="feature-icon-wrapper">
                <svg className="feature-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="feature-title">Student Management</h3>
              <p className="feature-description">
                Complete database with photos, details, and unique QR codes for each student
              </p>
            </div>

            <div className="feature">
              <div className="feature-icon-wrapper">
                <svg className="feature-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="feature-title">Real-time Analytics</h3>
              <p className="feature-description">
                Live dashboard with insights and comprehensive access logs
              </p>
            </div>

            <div className="feature">
              <div className="feature-icon-wrapper">
                <svg className="feature-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="feature-title">Secure & Encrypted</h3>
              <p className="feature-description">
                Bank-level security with role-based access and encrypted data storage
              </p>
            </div>

            <div className="feature">
              <div className="feature-icon-wrapper">
                <svg className="feature-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="feature-title">Mobile Friendly</h3>
              <p className="feature-description">
                Works seamlessly on desktop, tablet, and mobile devices
              </p>
            </div>

            <div className="feature">
              <div className="feature-icon-wrapper">
                <svg className="feature-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="feature-title">Lightning Fast</h3>
              <p className="feature-description">
                Optimized performance for instant scanning and data retrieval
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="cta-container">
          <h2 className="cta-title">Ready to get started?</h2>
          <p className="cta-description">
            Join the modern way of managing campus access control
          </p>
          <button className="btn-cta" onClick={() => navigate('/login')}>
            Sign In Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-brand">
              <img src={logo} alt="CampusQR Logo" className="footer-logo" />
              <span className="footer-text">CampusQR</span>
            </div>
            <p className="footer-copyright">
              &copy; 2025 CampusQR. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
