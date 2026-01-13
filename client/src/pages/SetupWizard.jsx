import { useState, useEffect } from 'react'
import './SetupWizard.css'

const SetupWizard = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [ipAddress, setIpAddress] = useState('')
  const [detectedIPs, setDetectedIPs] = useState([])
  const [os, setOS] = useState('')
  const [certFiles, setCertFiles] = useState('')
  const [connectionStatus, setConnectionStatus] = useState({
    frontend: null,
    backend: null,
    https: null
  })

  useEffect(() => {
    detectOS()
    fetchNetworkInfo()
  }, [])

  const detectOS = () => {
    const userAgent = window.navigator.userAgent
    let detectedOS = 'Unknown'

    if (userAgent.indexOf('Win') !== -1) detectedOS = 'Windows'
    else if (userAgent.indexOf('Mac') !== -1) detectedOS = 'macOS'
    else if (userAgent.indexOf('Linux') !== -1) detectedOS = 'Linux'

    setOS(detectedOS)
  }

  const fetchNetworkInfo = async () => {
    try {
      const response = await fetch(window.location.origin + '/api/setup/network-info', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }).catch(() => null)

      if (response && response.ok) {
        const data = await response.json()
        if (data.success && data.data.ips && data.data.ips.length > 0) {
          setDetectedIPs(data.data.ips)
          const preferredIP = data.data.ips.find(ip => 
            ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')
          ) || data.data.ips[0]
          setIpAddress(preferredIP)
          updateCertFiles(preferredIP)
        }
      } else {
        const hostname = window.location.hostname
        if (hostname && hostname !== 'localhost') {
          setDetectedIPs([hostname])
          setIpAddress(hostname)
          updateCertFiles(hostname)
        }
      }
    } catch (error) {
      console.error('Failed to fetch network info:', error)
      const hostname = window.location.hostname
      if (hostname && hostname !== 'localhost') {
        setDetectedIPs([hostname])
        setIpAddress(hostname)
        updateCertFiles(hostname)
      }
    }
  }

  const updateCertFiles = (ip) => {
    setCertFiles(`${ip}+3.pem and ${ip}+3-key.pem`)
  }

  const handleIPChange = (e) => {
    const newIP = e.target.value
    setIpAddress(newIP)
    updateCertFiles(newIP)
  }

  const testConnections = async () => {
    const status = {
      frontend: null,
      backend: null,
      https: null
    }

    status.https = window.location.protocol === 'https:'

    try {
      const backendURL = `${window.location.protocol}//${ipAddress}:3001/api/health`
      const response = await fetch(backendURL, { 
        method: 'GET',
        mode: 'cors'
      })
      status.backend = response.ok
    } catch (error) {
      status.backend = false
    }

    status.frontend = window.location.hostname !== ''

    setConnectionStatus(status)
  }

  const downloadFile = (filename, content) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const generateServerEnv = () => {
    return `PORT=3001
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=campusqr
DATABASE_USER=root
DATABASE_PASSWORD=your_password

# Security
JWT_SECRET=your_super_secure_jwt_secret_key_change_in_production
ENCRYPTION_KEY=campusqr_secure_encryption_key_2025_do_not_share

# Network
FRONTEND_URL=https://${ipAddress}:5173

# Environment
NODE_ENV=development`
  }

  const generateClientEnv = () => {
    return `VITE_API_URL=https://${ipAddress}:3001/api`
  }

  const generateViteConfig = () => {
    return `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, '${certFiles.split(' and ')[1]}')),
      cert: fs.readFileSync(path.resolve(__dirname, '${certFiles.split(' and ')[0]}')),
    },
    proxy: {
      '/api': {
        target: 'https://${ipAddress}:3001',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})`
  }

  const getInstallMkcertCommand = () => {
    switch (os) {
      case 'Windows':
        return `# Option 1: Using Chocolatey (Recommended)
choco install mkcert
mkcert -install

# Option 2: Using Scoop
scoop bucket add extras
scoop install mkcert
mkcert -install`
      case 'macOS':
        return `brew install mkcert
mkcert -install`
      case 'Linux':
        return `# Ubuntu/Debian
sudo apt install libnss3-tools mkcert
mkcert -install

# Fedora
sudo dnf install nss-tools mkcert
mkcert -install`
      default:
        return 'Visit: https://github.com/FiloSottile/mkcert'
    }
  }

  const getGenerateCertsCommand = () => {
    return `cd client
mkcert ${ipAddress} localhost 127.0.0.1 ::1`
  }

  const getFirewallCommand = () => {
    switch (os) {
      case 'Windows':
        return `# PowerShell (Run as Administrator)
New-NetFirewallRule -DisplayName "CampusQR Backend" -Direction Inbound -Protocol TCP -LocalPort 3001 -Action Allow
New-NetFirewallRule -DisplayName "CampusQR Frontend" -Direction Inbound -Protocol TCP -LocalPort 5173 -Action Allow`
      case 'macOS':
        return `# System Preferences → Security & Privacy → Firewall → Firewall Options
# Add Node.js and allow incoming connections`
      case 'Linux':
        return `# Ubuntu/Debian (UFW)
sudo ufw allow 3001/tcp
sudo ufw allow 5173/tcp
sudo ufw reload

# Fedora/RHEL (firewalld)
sudo firewall-cmd --add-port=3001/tcp --permanent
sudo firewall-cmd --add-port=5173/tcp --permanent
sudo firewall-cmd --reload`
      default:
        return 'Configure firewall to allow ports 3001 and 5173'
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => alert('Copied to clipboard!'))
      .catch(() => alert('Failed to copy. Please copy manually.'))
  }

  const steps = [
    {
      number: 1,
      title: 'Network Configuration',
      description: 'Detect your network IP address'
    },
    {
      number: 2,
      title: 'Install mkcert',
      description: 'Install certificate generation tool'
    },
    {
      number: 3,
      title: 'Generate Certificates',
      description: 'Create SSL certificates for HTTPS'
    },
    {
      number: 4,
      title: 'Configure Environment',
      description: 'Download configuration files'
    },
    {
      number: 5,
      title: 'Firewall Setup',
      description: 'Allow network access'
    },
    {
      number: 6,
      title: 'Test & Finish',
      description: 'Verify everything works'
    }
  ]

  return (
    <div className="setup-wizard-container">
      <div className="setup-wizard-header">
        <div className="wizard-logo">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h1>CampusQR Setup Wizard</h1>
        <p>Easy step-by-step setup for HTTPS and mobile access</p>
      </div>

      <div className="wizard-progress">
        {steps.map((step) => (
          <div 
            key={step.number}
            className={`progress-step ${currentStep === step.number ? 'active' : ''} ${currentStep > step.number ? 'completed' : ''}`}
            onClick={() => setCurrentStep(step.number)}
          >
            <div className="step-circle">
              {currentStep > step.number ? (
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step.number
              )}
            </div>
            <div className="step-label">
              <div className="step-title">{step.title}</div>
              <div className="step-desc">{step.description}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="wizard-content">
        {currentStep === 1 && (
          <div className="wizard-step">
            <h2>Step 1: Network Configuration</h2>
            <p>We've detected the following information about your system:</p>

            <div className="info-card">
              <div className="info-row">
                <strong>Operating System:</strong>
                <span className="info-badge">{os}</span>
              </div>
              <div className="info-row">
                <strong>Current URL:</strong>
                <span className="info-value">{window.location.href}</span>
              </div>
              <div className="info-row">
                <strong>Protocol:</strong>
                <span className={`info-badge ${window.location.protocol === 'https:' ? 'success' : 'warning'}`}>
                  {window.location.protocol === 'https:' ? 'HTTPS ✓' : 'HTTP (needs HTTPS)'}
                </span>
              </div>
            </div>

            {detectedIPs.length > 0 && (
              <div className="config-section">
                <label>Detected IP Addresses:</label>
                <div className="ip-list">
                  {detectedIPs.map((ip) => (
                    <button
                      key={ip}
                      className={`ip-option ${ip === ipAddress ? 'selected' : ''}`}
                      onClick={() => {
                        setIpAddress(ip)
                        updateCertFiles(ip)
                      }}
                    >
                      {ip}
                      {ip === ipAddress && ' ✓'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="config-section">
              <label htmlFor="ip-input">Your Network IP Address:</label>
              <input
                id="ip-input"
                type="text"
                value={ipAddress}
                onChange={handleIPChange}
                placeholder="e.g., 192.168.1.100"
                className="wizard-input"
              />
              <small className="help-text">
                This IP will be used to configure HTTPS certificates and access the app from mobile devices
              </small>
            </div>

            <div className="command-box">
              <div className="command-header">
                <strong>Find Your IP Address:</strong>
                <button onClick={() => copyToClipboard(
                  os === 'Windows' ? 'ipconfig' : 
                  os === 'macOS' ? 'ifconfig | grep "inet "' : 
                  'ip addr show'
                )} className="copy-btn">
                  Copy Command
                </button>
              </div>
              <code>
                {os === 'Windows' && 'ipconfig'}
                {os === 'macOS' && 'ifconfig | grep "inet "'}
                {os === 'Linux' && 'ip addr show | grep "inet "'}
              </code>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="wizard-step">
            <h2>Step 2: Install mkcert</h2>
            <p>mkcert is a tool to generate locally-trusted SSL certificates. This is required for HTTPS on mobile devices.</p>

            <div className="command-box">
              <div className="command-header">
                <strong>Install mkcert:</strong>
                <button onClick={() => copyToClipboard(getInstallMkcertCommand())} className="copy-btn">
                  Copy Commands
                </button>
              </div>
              <pre>{getInstallMkcertCommand()}</pre>
            </div>

            <div className="alert alert-info">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <strong>Windows Users:</strong> Run PowerShell as Administrator
                <br />
                <strong>macOS/Linux Users:</strong> You may need sudo privileges
              </div>
            </div>

            <div className="verification-section">
              <strong>Verify Installation:</strong>
              <div className="command-box">
                <code>mkcert -version</code>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="wizard-step">
            <h2>Step 3: Generate SSL Certificates</h2>
            <p>Generate SSL certificates for your IP address to enable HTTPS.</p>

            <div className="config-section">
              <label>Certificate Files to be Generated:</label>
              <div className="cert-files">
                <div className="cert-file">📄 {certFiles.split(' and ')[0]}</div>
                <div className="cert-file">🔑 {certFiles.split(' and ')[1]}</div>
              </div>
            </div>

            <div className="command-box">
              <div className="command-header">
                <strong>Generate Certificates:</strong>
                <button onClick={() => copyToClipboard(getGenerateCertsCommand())} className="copy-btn">
                  Copy Commands
                </button>
              </div>
              <pre>{getGenerateCertsCommand()}</pre>
            </div>

            <div className="alert alert-warning">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <strong>Important:</strong> Run this command from the project root directory. The certificates must be created in the <code>client/</code> folder.
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="wizard-step">
            <h2>Step 4: Download Configuration Files</h2>
            <p>Download these pre-configured files and place them in the correct locations.</p>

            <div className="download-grid">
              <div className="download-card">
                <div className="download-icon">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3>server/.env</h3>
                <p>Backend configuration</p>
                <button onClick={() => downloadFile('.env', generateServerEnv())} className="download-btn">
                  Download
                </button>
              </div>

              <div className="download-card">
                <div className="download-icon">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3>client/.env</h3>
                <p>Frontend configuration</p>
                <button onClick={() => downloadFile('.env', generateClientEnv())} className="download-btn">
                  Download
                </button>
              </div>

              <div className="download-card">
                <div className="download-icon">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3>client/vite.config.js</h3>
                <p>Vite HTTPS configuration</p>
                <button onClick={() => downloadFile('vite.config.js', generateViteConfig())} className="download-btn">
                  Download
                </button>
              </div>
            </div>

            <div className="alert alert-info">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <strong>Note:</strong> Update <code>DATABASE_PASSWORD</code> in server/.env with your actual MySQL password.
              </div>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="wizard-step">
            <h2>Step 5: Configure Firewall</h2>
            <p>Allow incoming connections on ports 3001 (backend) and 5173 (frontend).</p>

            <div className="command-box">
              <div className="command-header">
                <strong>Firewall Configuration:</strong>
                <button onClick={() => copyToClipboard(getFirewallCommand())} className="copy-btn">
                  Copy Commands
                </button>
              </div>
              <pre>{getFirewallCommand()}</pre>
            </div>

            <div className="alert alert-warning">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                {os === 'Windows' && <strong>Windows:</strong>}
                {os === 'Windows' && ' Run PowerShell as Administrator'}
                {os === 'macOS' && <strong>macOS:</strong>}
                {os === 'macOS' && ' You may need to enter your password'}
                {os === 'Linux' && <strong>Linux:</strong>}
                {os === 'Linux' && ' Requires sudo privileges'}
              </div>
            </div>
          </div>
        )}

        {currentStep === 6 && (
          <div className="wizard-step">
            <h2>Step 6: Test & Finish</h2>
            <p>Let's verify that everything is configured correctly.</p>

            <div className="test-section">
              <button onClick={testConnections} className="test-btn">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Run Connection Tests
              </button>
            </div>

            {(connectionStatus.frontend !== null || connectionStatus.backend !== null || connectionStatus.https !== null) && (
              <div className="status-grid">
                <div className={`status-card ${connectionStatus.https === true ? 'success' : connectionStatus.https === false ? 'error' : ''}`}>
                  <div className="status-icon">
                    {connectionStatus.https === true ? '✓' : connectionStatus.https === false ? '✗' : '?'}
                  </div>
                  <h3>HTTPS Enabled</h3>
                  <p>{connectionStatus.https ? 'Working' : 'Not configured'}</p>
                </div>

                <div className={`status-card ${connectionStatus.frontend === true ? 'success' : connectionStatus.frontend === false ? 'error' : ''}`}>
                  <div className="status-icon">
                    {connectionStatus.frontend === true ? '✓' : connectionStatus.frontend === false ? '✗' : '?'}
                  </div>
                  <h3>Frontend</h3>
                  <p>{connectionStatus.frontend ? 'Connected' : 'Not reachable'}</p>
                </div>

                <div className={`status-card ${connectionStatus.backend === true ? 'success' : connectionStatus.backend === false ? 'error' : ''}`}>
                  <div className="status-icon">
                    {connectionStatus.backend === true ? '✓' : connectionStatus.backend === false ? '✗' : '?'}
                  </div>
                  <h3>Backend API</h3>
                  <p>{connectionStatus.backend ? 'Connected' : 'Not reachable'}</p>
                </div>
              </div>
            )}

            <div className="access-info">
              <h3>Access URLs:</h3>
              <div className="url-list">
                <div className="url-item">
                  <strong>Desktop:</strong>
                  <code>https://{ipAddress}:5173</code>
                </div>
                <div className="url-item">
                  <strong>Mobile (same WiFi):</strong>
                  <code>https://{ipAddress}:5173</code>
                </div>
                <div className="url-item">
                  <strong>Backend API:</strong>
                  <code>https://{ipAddress}:3001</code>
                </div>
              </div>
            </div>

            <div className="alert alert-success">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <strong>Next Steps:</strong>
                <ul>
                  <li>Start the backend: <code>cd server && npm run dev</code></li>
                  <li>Start the frontend: <code>cd client && npm run dev</code></li>
                  <li>Access the app at: <code>https://{ipAddress}:5173</code></li>
                  <li>Accept certificate warnings on first visit</li>
                  <li>Login with: admin@campusqr.com / admin123</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="wizard-navigation">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="nav-btn prev"
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          {currentStep < 6 ? (
            <button
              onClick={() => setCurrentStep(Math.min(6, currentStep + 1))}
              className="nav-btn next"
            >
              Next
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <a href="/" className="nav-btn finish">
              Go to Login
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default SetupWizard
