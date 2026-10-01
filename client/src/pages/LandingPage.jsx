import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import logo from '../../public/qr-logo.svg'
import './LandingPage.css'

/* ─────────────────────────────────────────
   Sub-components
───────────────────────────────────────── */

const PrivacyModal = ({ onClose }) => (
  <div className="lp-modal-overlay" onClick={onClose}>
    <div className="lp-modal" onClick={e => e.stopPropagation()}>
      <div className="lp-modal-header">
        <h2>Privacy Policy</h2>
        <button className="lp-modal-close" onClick={onClose} aria-label="Close">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="lp-modal-body">
        <p className="lp-modal-date">Last updated: October 1, 2026</p>

        <h3>1. Information We Collect</h3>
        <p>CampusQR collects student identification data (name, student ID, course, year level, and enrollment status), staff and security personnel account information (email, username, role), and access log data (scan timestamps, locations, and outcomes). We also collect photographs uploaded as part of student profiles.</p>

        <h3>2. How We Use Your Information</h3>
        <p>We use collected information solely to operate the campus access control system: verifying student identity at entry points, generating audit trails for campus security, and producing statistical reports for administrative purposes. We do not sell, trade, or rent personal data to third parties.</p>

        <h3>3. Data Storage &amp; Security</h3>
        <p>All data is stored on your institution's own servers and is never transmitted to external services. QR codes are cryptographically signed and time-limited. Database access is restricted to authorised system accounts only. Passwords are hashed using industry-standard bcrypt algorithms.</p>

        <h3>4. Data Retention</h3>
        <p>Student records are retained for the duration of enrolment plus one academic year. Access logs are retained for three years for security audit purposes. Accounts of departed staff are deactivated and anonymised after 90 days.</p>

        <h3>5. Your Rights</h3>
        <p>Students and staff may request access to, correction of, or deletion of their personal data by contacting the system administrator. Requests are fulfilled within 30 working days, subject to legal retention obligations.</p>

        <h3>6. Cookies &amp; Local Storage</h3>
        <p>CampusQR uses browser local storage only to persist your authentication session token. No tracking cookies or third-party analytics are used.</p>

        <h3>7. Changes to This Policy</h3>
        <p>We may update this policy periodically. Continued use of the system after changes constitutes acceptance of the revised policy. Major changes will be communicated via the system administrator.</p>

        <h3>8. Contact</h3>
        <p>For privacy-related enquiries, contact your institution's CampusQR administrator or reach us at <a href="mailto:privacy@campusqr.edu">privacy@campusqr.edu</a>.</p>
      </div>
    </div>
  </div>
)

const TermsModal = ({ onClose }) => (
  <div className="lp-modal-overlay" onClick={onClose}>
    <div className="lp-modal" onClick={e => e.stopPropagation()}>
      <div className="lp-modal-header">
        <h2>Terms of Service</h2>
        <button className="lp-modal-close" onClick={onClose} aria-label="Close">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="lp-modal-body">
        <p className="lp-modal-date">Last updated: October 1, 2026</p>

        <h3>1. Acceptance of Terms</h3>
        <p>By accessing or using CampusQR, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the system.</p>

        <h3>2. Permitted Use</h3>
        <p>CampusQR is licensed exclusively for use by accredited educational institutions. The system may only be used for legitimate campus access control and student verification purposes. Misuse, including unauthorised access attempts or data manipulation, is strictly prohibited.</p>

        <h3>3. Account Responsibilities</h3>
        <p>Users are responsible for maintaining the confidentiality of their login credentials. Any activity occurring under your account is your responsibility. Suspected unauthorised access must be reported to your administrator immediately.</p>

        <h3>4. QR Code Usage</h3>
        <p>Student QR codes are personal and non-transferable. Sharing, duplicating, or altering a QR code is a violation of these terms and may result in disciplinary action by the institution.</p>

        <h3>5. System Availability</h3>
        <p>CampusQR is provided as a self-hosted solution. Your institution is responsible for maintaining uptime, backups, and infrastructure. We provide the software as-is with no warranties of uninterrupted availability.</p>

        <h3>6. Limitation of Liability</h3>
        <p>To the fullest extent permitted by law, CampusQR and its developers shall not be liable for any indirect, incidental, or consequential damages arising from your use of the system.</p>

        <h3>7. Governing Law</h3>
        <p>These terms are governed by the laws of the jurisdiction in which your institution operates. Any disputes shall be resolved in the courts of that jurisdiction.</p>
      </div>
    </div>
  </div>
)

/* ─────────────────────────────────────────
   Main Landing Page
───────────────────────────────────────── */
const LandingPage = () => {
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [navScrolled, setNavScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [contactForm, setContactForm] = useState({ name: '', email: '', institution: '', message: '' })
  const [contactSent, setContactSent] = useState(false)
  const contactRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileMenuOpen(false)
  }

  const handleContactSubmit = (e) => {
    e.preventDefault()
    setContactSent(true)
    setContactForm({ name: '', email: '', institution: '', message: '' })
    setTimeout(() => setContactSent(false), 5000)
  }

  const features = [
    {
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      ),
      title: 'Instant QR Verification',
      desc: 'Scan student QR codes with any camera or physical scanner for sub-second identity verification at every campus entry point.',
      color: 'blue',
    },
    {
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Role-Based Access',
      desc: 'Separate dashboards for admins, security personnel, and staff. Each role sees only what they need — nothing more.',
      color: 'indigo',
    },
    {
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      title: 'Full Audit Trail',
      desc: 'Every scan is logged with timestamp, location, scanner identity, and outcome — providing a complete, tamper-evident access history.',
      color: 'violet',
    },
    {
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: 'Multi-Mode Scanning',
      desc: 'Use a phone camera, tablet, or plug-in USB/Bluetooth physical scanner. Every scan mode feeds into the same verified pipeline.',
      color: 'cyan',
    },
    {
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Live Analytics',
      desc: 'Real-time dashboard showing today\'s scans, active students, and system health — so administrators always have the full picture.',
      color: 'emerald',
    },
    {
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: 'Self-Hosted & Private',
      desc: 'Deploy on your own servers. Your student data never leaves your campus infrastructure. Full GDPR-friendly data sovereignty.',
      color: 'amber',
    },
  ]

  const steps = [
    { num: '01', title: 'Enrol Students', desc: 'Import or manually add students with their details and photos. The system auto-generates a unique, cryptographically secure QR code for each.' },
    { num: '02', title: 'Deploy at Entry Points', desc: 'Set up CampusQR on any device with a camera — or plug in a USB barcode scanner — at your gates, library, dormitory, or labs.' },
    { num: '03', title: 'Scan & Verify', desc: 'Security personnel point the scanner at a student\'s QR code. Access is granted or denied within milliseconds, with full details displayed on screen.' },
    { num: '04', title: 'Review Logs & Reports', desc: 'Administrators review access history, export reports, and monitor campus traffic patterns — all from a clean, searchable dashboard.' },
  ]

  const stats = [
    { value: '<0.5s', label: 'Average verification time' },
    { value: '99.9%', label: 'Scan accuracy rate' },
    { value: '3', label: 'Scanner modes supported' },
    { value: '∞', label: 'Access log retention' },
  ]

  return (
    <div className="lp-root">
      {/* ── Navbar ── */}
      <nav className={`lp-nav ${navScrolled ? 'scrolled' : ''}`}>
        <div className="lp-nav-inner">
          <a className="lp-nav-brand" href="#hero">
            <img src={logo} alt="CampusQR logo" />
            <span>CampusQR</span>
          </a>

          <div className={`lp-nav-links ${mobileMenuOpen ? 'open' : ''}`}>
            <button onClick={() => scrollTo('features')}>Features</button>
            <button onClick={() => scrollTo('how-it-works')}>How It Works</button>
            <button onClick={() => scrollTo('contact')}>Contact</button>
            <Link to="/login" className="lp-nav-cta" onClick={() => setMobileMenuOpen(false)}>Sign In →</Link>
          </div>

          <button className="lp-hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="lp-hero" id="hero">
        <div className="lp-hero-bg">
          <div className="lp-hero-orb lp-hero-orb-1" />
          <div className="lp-hero-orb lp-hero-orb-2" />
          <div className="lp-hero-grid" />
        </div>
        <div className="lp-hero-content">
          <div className="lp-hero-badge">
            <span className="lp-badge-dot" />
            Campus Security — Reimagined
          </div>
          <h1 className="lp-hero-title">
            Smart QR-Based<br />
            <span className="lp-hero-gradient">Student Verification</span>
          </h1>
          <p className="lp-hero-subtitle">
            CampusQR gives your institution a modern, reliable, and fully self-hosted system for verifying student identity at every campus entry point — using any camera or physical scanner.
          </p>
          <div className="lp-hero-actions">
            <Link to="/login" className="lp-btn lp-btn-primary">
              Get Started
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <button className="lp-btn lp-btn-ghost" onClick={() => scrollTo('how-it-works')}>
              See How It Works
            </button>
          </div>
          <div className="lp-hero-stats">
            {stats.map(s => (
              <div className="lp-hero-stat" key={s.label}>
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* floating card mockup */}
        <div className="lp-hero-visual">
          <div className="lp-mock-card lp-mock-granted">
            <div className="lp-mock-icon">✓</div>
            <div>
              <p className="lp-mock-status">ACCESS GRANTED</p>
              <p className="lp-mock-name">Juan dela Cruz · CS-3A</p>
            </div>
          </div>
          <div className="lp-mock-card lp-mock-scanner">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="lp-mock-qr-icon">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <p className="lp-mock-scanner-text">Scanning…</p>
            <div className="lp-mock-scan-line" />
          </div>
          <div className="lp-mock-card lp-mock-log">
            <p className="lp-mock-log-title">Recent Scans</p>
            {['Maria Santos — Main Gate', 'Carlo Reyes — Library', 'Ana Lim — Dormitory'].map((entry, i) => (
              <div key={i} className="lp-mock-log-row">
                <span className="lp-mock-log-dot" />
                <span>{entry}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="lp-section lp-features" id="features">
        <div className="lp-container">
          <div className="lp-section-header">
            <span className="lp-section-tag">Features</span>
            <h2>Everything your campus needs</h2>
            <p>A complete access control platform — no third-party subscriptions, no data leaving your network.</p>
          </div>
          <div className="lp-features-grid">
            {features.map((f) => (
              <div className={`lp-feature-card lp-feature-card-${f.color}`} key={f.title}>
                <div className="lp-feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="lp-section lp-how" id="how-it-works">
        <div className="lp-container">
          <div className="lp-section-header">
            <span className="lp-section-tag">How It Works</span>
            <h2>Up and running in four steps</h2>
            <p>From setup to first scan in under an hour. No special hardware required.</p>
          </div>
          <div className="lp-steps">
            {steps.map((s, i) => (
              <div className="lp-step" key={s.num}>
                <div className="lp-step-num">{s.num}</div>
                {i < steps.length - 1 && <div className="lp-step-connector" />}
                <div className="lp-step-body">
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Scanner Modes highlight ── */}
      <section className="lp-section lp-modes">
        <div className="lp-container">
          <div className="lp-modes-inner">
            <div className="lp-modes-text">
              <span className="lp-section-tag">Scanner Flexibility</span>
              <h2>Three ways to scan,<br />one unified platform</h2>
              <p>Whether you're at a main gate with a dedicated scanner gun, a librarian using a tablet, or a security guard on a smartphone — CampusQR works seamlessly across all setups.</p>
              <ul className="lp-modes-list">
                <li>
                  <span className="lp-modes-icon lp-modes-icon-camera">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </span>
                  <div>
                    <strong>Camera Mode</strong>
                    <span>Use any smartphone or webcam to scan QR codes in real-time.</span>
                  </div>
                </li>
                <li>
                  <span className="lp-modes-icon lp-modes-icon-physical">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                  </span>
                  <div>
                    <strong>Physical Scanner Mode</strong>
                    <span>Plug in any USB or Bluetooth barcode gun — works plug-and-play.</span>
                  </div>
                </li>
                <li>
                  <span className="lp-modes-icon lp-modes-icon-manual">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </span>
                  <div>
                    <strong>Manual Entry Mode</strong>
                    <span>Enter a student ID directly — useful when a QR code can't be read.</span>
                  </div>
                </li>
              </ul>
            </div>
            <div className="lp-modes-visual">
              <div className="lp-mode-pill lp-mode-pill-camera">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Camera
              </div>
              <div className="lp-mode-pill lp-mode-pill-physical lp-mode-pill-active">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                Physical Scanner
              </div>
              <div className="lp-mode-pill lp-mode-pill-manual">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Manual Entry
              </div>
              <div className="lp-modes-glow" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section className="lp-section lp-contact" id="contact" ref={contactRef}>
        <div className="lp-container">
          <div className="lp-contact-inner">
            <div className="lp-contact-info">
              <span className="lp-section-tag">Contact Us</span>
              <h2>Get in touch</h2>
              <p>Have questions about deploying CampusQR at your institution, or need technical support? We're here to help.</p>

              <div className="lp-contact-details">
                <div className="lp-contact-detail">
                  <div className="lp-contact-detail-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <strong>Email</strong>
                    <a href="mailto:support@campusqr.edu">support@campusqr.edu</a>
                  </div>
                </div>
                <div className="lp-contact-detail">
                  <div className="lp-contact-detail-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <strong>Phone</strong>
                    <a href="tel:+63281234567">+63 2 8123 4567</a>
                  </div>
                </div>
                <div className="lp-contact-detail">
                  <div className="lp-contact-detail-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <strong>Address</strong>
                    <span>Metro Manila, Philippines</span>
                  </div>
                </div>
                <div className="lp-contact-detail">
                  <div className="lp-contact-detail-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <strong>Support Hours</strong>
                    <span>Mon–Fri, 8 AM – 6 PM PHT</span>
                  </div>
                </div>
              </div>
            </div>

            <form className="lp-contact-form" onSubmit={handleContactSubmit}>
              {contactSent && (
                <div className="lp-contact-success">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Message sent! We'll get back to you within one business day.
                </div>
              )}
              <div className="lp-form-row">
                <div className="lp-form-group">
                  <label htmlFor="cf-name">Full Name *</label>
                  <input id="cf-name" type="text" required value={contactForm.name} onChange={e => setContactForm({ ...contactForm, name: e.target.value })} placeholder="Your full name" />
                </div>
                <div className="lp-form-group">
                  <label htmlFor="cf-email">Email Address *</label>
                  <input id="cf-email" type="email" required value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} placeholder="you@institution.edu" />
                </div>
              </div>
              <div className="lp-form-group">
                <label htmlFor="cf-institution">Institution / Organisation</label>
                <input id="cf-institution" type="text" value={contactForm.institution} onChange={e => setContactForm({ ...contactForm, institution: e.target.value })} placeholder="Your school or organisation" />
              </div>
              <div className="lp-form-group">
                <label htmlFor="cf-message">Message *</label>
                <textarea id="cf-message" required rows={5} value={contactForm.message} onChange={e => setContactForm({ ...contactForm, message: e.target.value })} placeholder="How can we help you?" />
              </div>
              <button type="submit" className="lp-btn lp-btn-primary lp-btn-full">
                Send Message
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footer-top">
            <div className="lp-footer-brand">
              <div className="lp-footer-logo">
                <img src={logo} alt="CampusQR" />
                <span>CampusQR</span>
              </div>
              <p>A secure, self-hosted QR-based student verification system for modern educational institutions.</p>
            </div>

            <div className="lp-footer-links">
              <div className="lp-footer-col">
                <h4>Product</h4>
                <button onClick={() => scrollTo('features')}>Features</button>
                <button onClick={() => scrollTo('how-it-works')}>How It Works</button>
                <Link to="/login">Sign In</Link>
              </div>
              <div className="lp-footer-col">
                <h4>Support</h4>
                <button onClick={() => scrollTo('contact')}>Contact Us</button>
                <a href="mailto:support@campusqr.edu">Email Support</a>
                <a href="mailto:support@campusqr.edu">Report an Issue</a>
              </div>
              <div className="lp-footer-col">
                <h4>Legal</h4>
                <button onClick={() => setShowPrivacy(true)}>Privacy Policy</button>
                <button onClick={() => setShowTerms(true)}>Terms of Service</button>
              </div>
            </div>
          </div>

          <div className="lp-footer-bottom">
            <p>© {new Date().getFullYear()} CampusQR. Built for educational institutions.</p>
            <div className="lp-footer-legal-links">
              <button onClick={() => setShowPrivacy(true)}>Privacy</button>
              <span>·</span>
              <button onClick={() => setShowTerms(true)}>Terms</button>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Modals ── */}
      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
    </div>
  )
}

export default LandingPage
