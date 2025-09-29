import { useState, useRef, useEffect } from 'react'
import { scannerService } from '../services/api'
import QrScanner from 'qr-scanner'

const Scanner = () => {
  const videoRef = useRef(null)
  const [qrScanner, setQrScanner] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [location, setLocation] = useState('')
  const [manualMode, setManualMode] = useState(false)
  const [manualStudentId, setManualStudentId] = useState('')
  const [manualReason, setManualReason] = useState('')
  const [cameras, setCameras] = useState([])
  const [selectedCamera, setSelectedCamera] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check for camera support and get available cameras
    const initializeCamera = async () => {
      try {
        // Check if camera is supported
        const hasCamera = await QrScanner.hasCamera()
        console.log('Has camera:', hasCamera)
        
        if (!hasCamera) {
          setError('No camera detected on this device.')
          return
        }

        // Request camera permission first
        try {
          await navigator.mediaDevices.getUserMedia({ video: true })
          console.log('Camera permission granted')
        } catch (permError) {
          console.error('Camera permission denied:', permError)
          setError('Camera permission denied. Please allow camera access and refresh the page.')
          return
        }

        // List available cameras
        const availableCameras = await QrScanner.listCameras(true)
        console.log('Available cameras:', availableCameras)
        setCameras(availableCameras)
        
        if (availableCameras.length > 0) {
          // Prefer back camera for mobile
          const backCamera = availableCameras.find(camera => 
            camera.label.toLowerCase().includes('back') || 
            camera.label.toLowerCase().includes('environment')
          )
          setSelectedCamera(backCamera ? backCamera.id : availableCameras[0].id)
        } else {
          setError('No cameras found. This may be a browser compatibility issue.')
        }
      } catch (error) {
        console.error('Failed to initialize camera:', error)
        setError(`Camera initialization failed: ${error.message}. Try refreshing the page or using a different browser.`)
      }
    }

    initializeCamera()

    return () => {
      if (qrScanner) {
        qrScanner.stop()
        qrScanner.destroy()
      }
    }
  }, [qrScanner])

  const startScanning = async () => {
    if (!videoRef.current) return

    try {
      setError('')
      setResult(null)
      
      // Mobile-specific configuration
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      
      const scanner = new QrScanner(
        videoRef.current,
        (result) => handleScanResult(result.data),
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: selectedCamera || (isMobile ? 'environment' : 'user'),
          maxScansPerSecond: 2, // Reduce for mobile performance
          returnDetailedScanResult: false
        }
      )

      console.log('Starting scanner with camera:', selectedCamera)
      await scanner.start()
      setQrScanner(scanner)
      setScanning(true)
      
      console.log('Scanner started successfully')
    } catch (error) {
      console.error('Failed to start camera:', error)
      
      // More specific error messages
      if (error.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access in your browser settings.')
      } else if (error.name === 'NotFoundError') {
        setError('No camera found. Please check if your device has a working camera.')
      } else if (error.name === 'NotSupportedError') {
        setError('Camera not supported by this browser. Try using Chrome, Safari, or Firefox.')
      } else {
        setError(`Camera error: ${error.message}. Try refreshing the page.`)
      }
    }
  }

  const stopScanning = () => {
    if (qrScanner) {
      qrScanner.stop()
      qrScanner.destroy()
      setQrScanner(null)
    }
    setScanning(false)
  }

  const handleScanResult = async (qrData) => {
    if (!qrData || loading) return

    setLoading(true)
    try {
      const response = await scannerService.verifyQR(qrData, location)
      setResult(response.data)
      stopScanning()
      
      // Auto-clear result after 5 seconds
      setTimeout(() => {
        setResult(null)
      }, 5000)
    } catch (error) {
      console.error('QR verification failed:', error)
      setError(error.response?.data?.message || 'QR code verification failed')
      setResult({
        accessGranted: false,
        reason: error.response?.data?.message || 'Invalid QR code'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleManualVerification = async (e) => {
    e.preventDefault()
    if (!manualStudentId || !manualReason) return

    setLoading(true)
    try {
      const response = await scannerService.manualVerify(manualStudentId, location, manualReason)
      setResult(response.data)
      setManualStudentId('')
      setManualReason('')
      
      // Auto-clear result after 5 seconds
      setTimeout(() => {
        setResult(null)
      }, 5000)
    } catch (error) {
      console.error('Manual verification failed:', error)
      setError(error.response?.data?.message || 'Manual verification failed')
    } finally {
      setLoading(false)
    }
  }

  const clearResult = () => {
    setResult(null)
    setError('')
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ margin: 0 }}>QR Code Scanner</h2>
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>
          Scan student QR codes or perform manual verification
        </p>
        {/* Debug info for mobile */}
        <details style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <summary style={{ cursor: 'pointer' }}>📱 Debug Info</summary>
          <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <p>User Agent: {navigator.userAgent}</p>
            <p>Cameras detected: {cameras.length}</p>
            <p>Selected camera: {selectedCamera || 'None'}</p>
            <p>HTTPS: {window.location.protocol === 'https:' ? 'Yes' : 'No (required for camera)'}</p>
          </div>
        </details>
      </div>

      {/* Location Input */}
      <div className="card mb-6">
        <div className="card-body">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'end' }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="location">Scanning Location</label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Main Gate, Library Entrance, Dormitory"
              />
            </div>
            <div>
              <button
                onClick={() => setManualMode(!manualMode)}
                className={`btn ${manualMode ? 'btn-primary' : 'btn-outline'}`}
              >
                {manualMode ? '📱 QR Mode' : '✏️ Manual Mode'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {!manualMode ? (
          /* QR Scanner Mode */
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">📱 QR Code Scanner</h3>
              {cameras.length > 1 && (
                <select
                  value={selectedCamera}
                  onChange={(e) => setSelectedCamera(e.target.value)}
                  style={{ marginTop: '0.5rem', maxWidth: '200px' }}
                  disabled={scanning}
                >
                  {cameras.map((camera) => (
                    <option key={camera.id} value={camera.id}>
                      {camera.label || `Camera ${camera.id}`}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="card-body">
              <div style={{
                position: 'relative',
                backgroundColor: '#000',
                borderRadius: '12px',
                overflow: 'hidden',
                aspectRatio: '4/3',
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                <video
                  ref={videoRef}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  playsInline
                  muted
                />
                
                {!scanning && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📱</div>
                      <p style={{ margin: 0, fontSize: '1.125rem' }}>
                        Camera is ready. Click "Start Scanning" to begin.
                      </p>
                    </div>
                  </div>
                )}

                {loading && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    color: 'white'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div className="spinner" style={{ margin: '0 auto 1rem' }} />
                      <p style={{ margin: 0 }}>Verifying QR Code...</p>
                    </div>
                  </div>
                )}
              </div>

              <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center',
                marginTop: '1.5rem'
              }}>
                {!scanning ? (
                  <button
                    onClick={startScanning}
                    className="btn btn-primary btn-lg"
                    disabled={cameras.length === 0}
                  >
                    📱 Start Scanning
                  </button>
                ) : (
                  <button
                    onClick={stopScanning}
                    className="btn btn-danger btn-lg"
                  >
                    ⏹️ Stop Scanning
                  </button>
                )}
              </div>

              {cameras.length === 0 && !error && (
                <div className="alert alert-warning" style={{ marginTop: '1rem' }}>
                  <h4>📱 Camera Setup Required</h4>
                  <p>To use QR scanning on mobile:</p>
                  <ol style={{ textAlign: 'left', marginTop: '1rem' }}>
                    <li>Allow camera permissions when prompted</li>
                    <li>Make sure you're using a supported browser (Chrome, Safari, Firefox)</li>
                    <li>Try refreshing the page</li>
                    <li>If still not working, use Manual Mode instead</li>
                  </ol>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="btn btn-outline"
                    style={{ marginTop: '1rem' }}
                  >
                    🔄 Refresh Page
                  </button>
                </div>
              )}
              
              {error && (
                <div className="alert alert-error" style={{ marginTop: '1rem' }}>
                  <h4>⚠️ Camera Issue</h4>
                  <p>{error}</p>
                  <div style={{ marginTop: '1rem' }}>
                    <button 
                      onClick={() => window.location.reload()} 
                      className="btn btn-outline btn-sm"
                      style={{ marginRight: '0.5rem' }}
                    >
                      🔄 Refresh
                    </button>
                    <button 
                      onClick={() => setManualMode(true)} 
                      className="btn btn-primary btn-sm"
                    >
                      ✏️ Use Manual Mode
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Manual Verification Mode */
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">✏️ Manual Verification</h3>
              <p className="card-subtitle">
                Use when QR code scanning is not available
              </p>
            </div>
            <div className="card-body">
              <form onSubmit={handleManualVerification}>
                <div style={{ marginBottom: '1rem' }}>
                  <label htmlFor="student_id">Student ID *</label>
                  <input
                    type="text"
                    id="student_id"
                    value={manualStudentId}
                    onChange={(e) => setManualStudentId(e.target.value)}
                    placeholder="Enter student ID (e.g., STU001)"
                    required
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label htmlFor="reason">Reason for Manual Verification *</label>
                  <select
                    id="reason"
                    value={manualReason}
                    onChange={(e) => setManualReason(e.target.value)}
                    required
                  >
                    <option value="">Select reason</option>
                    <option value="QR code damaged">QR code damaged</option>
                    <option value="Phone battery dead">Phone battery dead</option>
                    <option value="Scanner malfunction">Scanner malfunction</option>
                    <option value="Emergency access">Emergency access</option>
                    <option value="Forgot device">Forgot device</option>
                    <option value="Other technical issue">Other technical issue</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner" style={{ width: '16px', height: '16px' }} />
                      Verifying...
                    </>
                  ) : (
                    '✓ Verify Student'
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Results Display */}
        {(result || error) && (
          <div className="card">
            <div className="card-body">
              {result ? (
                <div style={{
                  textAlign: 'center',
                  padding: '2rem'
                }}>
                  <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    backgroundColor: result.accessGranted ? '#dcfce7' : '#fef2f2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    fontSize: '3rem'
                  }}>
                    {result.accessGranted ? '✅' : '❌'}
                  </div>

                  <h3 style={{
                    color: result.accessGranted ? 'var(--success-color)' : 'var(--error-color)',
                    marginBottom: '1rem'
                  }}>
                    {result.accessGranted ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
                  </h3>

                  {result.student && (
                    <div style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      marginBottom: '1.5rem',
                      textAlign: 'left'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {result.student.photo_url ? (
                          <img
                            src={result.student.photo_url}
                            alt={result.student.name}
                            style={{
                              width: '80px',
                              height: '80px',
                              borderRadius: '50%',
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            backgroundColor: '#e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2rem'
                          }}>
                            👤
                          </div>
                        )}
                        
                        <div>
                          <h4 style={{ margin: '0 0 0.5rem' }}>{result.student.name}</h4>
                          <p style={{ margin: '0.25rem 0', color: 'var(--text-muted)' }}>
                            <strong>ID:</strong> {result.student.student_id}
                          </p>
                          <p style={{ margin: '0.25rem 0', color: 'var(--text-muted)' }}>
                            <strong>Course:</strong> {result.student.course}
                          </p>
                          <p style={{ margin: '0.25rem 0', color: 'var(--text-muted)' }}>
                            <strong>Year:</strong> {result.student.year_level}
                          </p>
                          <span className={`badge ${
                            result.student.enrollment_status === 'active' ? 'badge-success' : 'badge-warning'
                          }`}>
                            {result.student.enrollment_status}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {result.reason && (
                    <div className="alert alert-warning">
                      <strong>Reason:</strong> {result.reason}
                    </div>
                  )}

                  <div style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-muted)',
                    marginBottom: '1.5rem'
                  }}>
                    <p style={{ margin: '0.25rem 0' }}>
                      <strong>Location:</strong> {result.location}
                    </p>
                    <p style={{ margin: '0.25rem 0' }}>
                      <strong>Time:</strong> {new Date(result.timestamp).toLocaleString()}
                    </p>
                    {result.verificationType && (
                      <p style={{ margin: '0.25rem 0' }}>
                        <strong>Method:</strong> {result.verificationType === 'manual' ? 'Manual Verification' : 'QR Code Scan'}
                      </p>
                    )}
                  </div>

                  <button onClick={clearResult} className="btn btn-outline">
                    ✓ Continue Scanning
                  </button>
                </div>
              ) : (
                <div className="alert alert-error">
                  <strong>Error:</strong> {error}
                  <button
                    onClick={clearResult}
                    className="btn btn-outline btn-sm"
                    style={{ marginLeft: '1rem' }}
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Scanner
