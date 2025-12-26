import { useState, useEffect, useRef } from 'react';
import { scannerService } from '../services/api';
import QrScanner from 'qr-scanner';
import './Scanner.css';

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
  const [showResultDialog, setShowResultDialog] = useState(false)

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

        // Request camera permission first, preferring back camera
        try {
          // Try to request back camera first
          try {
            await navigator.mediaDevices.getUserMedia({ 
              video: { facingMode: 'environment' } 
            })
            console.log('Back camera permission granted')
          } catch (backCamError) {
            // Fallback to any camera
            await navigator.mediaDevices.getUserMedia({ video: true })
            console.log('Camera permission granted (fallback)')
          }
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
          // Enhanced back camera detection for mobile scanning
          const backCamera = availableCameras.find(camera => {
            const label = camera.label.toLowerCase()
            return (
              label.includes('back') || 
              label.includes('environment') ||
              label.includes('rear') ||
              label.includes('facing back') ||
              // Check if facingMode is available and is 'environment'
              (camera.facingMode && camera.facingMode === 'environment')
            )
          })
          
          // If no back camera found by label, try to find one by device ID patterns
          const fallbackBackCamera = !backCamera ? availableCameras.find(camera => {
            // Some devices have back cameras with specific ID patterns
            return camera.id && (camera.id.includes('back') || camera.id.includes('1'))
          }) : null
          
          const defaultCamera = backCamera || fallbackBackCamera || availableCameras[0]
          setSelectedCamera(defaultCamera.id)
          
          console.log('Available cameras:', availableCameras.map(c => ({ id: c.id, label: c.label })))
          console.log('Default camera selected:', defaultCamera.label || defaultCamera.id)
          console.log('Back camera found:', !!backCamera)
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
      setLoading(false)
      
      // Stop existing scanner if running
      if (qrScanner) {
        try {
          qrScanner.stop()
          qrScanner.destroy()
        } catch (e) {
          console.warn('Error cleaning up existing scanner:', e)
        }
        setQrScanner(null)
      }
      
      // Ensure scanning state is reset
      setScanning(false)
      
      // Small delay to ensure camera is fully released
      await new Promise(resolve => setTimeout(resolve, 100))

      // Mobile-specific configuration
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      
      // Find the selected camera info for better constraints
      const selectedCameraInfo = cameras.find(cam => cam.id === selectedCamera)
      const isBackCamera = selectedCameraInfo && (
        selectedCameraInfo.label.toLowerCase().includes('back') || 
        selectedCameraInfo.label.toLowerCase().includes('environment') ||
        selectedCameraInfo.label.toLowerCase().includes('rear')
      )
      
      const scanner = new QrScanner(
        videoRef.current,
        (result) => handleScanResult(result.data),
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          // Use the specific camera ID or fallback to facingMode
          preferredCamera: selectedCamera || (isBackCamera || isMobile ? 'environment' : 'user'),
          maxScansPerSecond: 2, // Reduce for mobile performance
          returnDetailedScanResult: false
        }
      )

      console.log('Starting scanner with camera:', selectedCamera, selectedCameraInfo?.label)
      
      // Try to set the specific camera
      if (selectedCamera) {
        try {
          await scanner.setCamera(selectedCamera)
          console.log('Successfully set camera:', selectedCamera)
        } catch (cameraError) {
          console.warn('Failed to set specific camera, using default constraints:', cameraError)
          // If setting specific camera fails, try with facingMode constraint
          if (isBackCamera || isMobile) {
            await scanner.setCamera('environment')
          }
        }
      }
      
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
      try {
        qrScanner.stop()
        qrScanner.destroy()
      } catch (error) {
        console.warn('Error stopping scanner:', error)
      }
      setQrScanner(null)
    }
    setScanning(false)
  }

  const switchCamera = async (cameraId) => {
    const selectedCameraInfo = cameras.find(cam => cam.id === cameraId)
    console.log('Switching to camera:', cameraId, selectedCameraInfo?.label)
    setSelectedCamera(cameraId)
    
    if (scanning && qrScanner) {
      // If currently scanning, restart with new camera
      try {
        console.log('Attempting to switch camera while scanning...')
        await qrScanner.setCamera(cameraId)
        console.log('Camera switched successfully to:', selectedCameraInfo?.label || cameraId)
      } catch (error) {
        console.error('Failed to switch camera, restarting scanner:', error)
        // Fallback: restart scanner with new camera
        stopScanning()
        setTimeout(() => {
          console.log('Restarting scanner with new camera')
          startScanning()
        }, 1000) // Increased delay for better stability
      }
    }
  }

  const handleScanResult = async (qrData) => {
    if (!qrData || loading) return

    console.log('=== Scanner Frontend Debug ===');
    console.log('QR Data scanned:', qrData);
    console.log('QR Data length:', qrData?.length);
    console.log('QR Data type:', typeof qrData);
    console.log('Location:', location);

    setLoading(true)
    setError('') // Clear any previous errors
    try {
      console.log('Sending to API...');
      const response = await scannerService.verifyQR(qrData, location)
      console.log('Raw API Response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', Object.keys(response || {}));
      console.log('Response.data:', response.data);
      console.log('Response.data type:', typeof response.data);
      
      // The API interceptor returns the whole response body: { success, message, data }
      // We need the nested data object which contains { student, accessGranted, etc }
      if (response && response.data) {
        console.log('✅ Setting result to response.data:', response.data);
        setResult(response.data)
        setShowResultDialog(true)
      } else {
        console.error('❌ Unexpected response structure:', response);
        throw new Error('Invalid response structure');
      }
      stopScanning()
    } catch (error) {
      console.error('❌ QR verification failed:', error)
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || error.message || 'QR code verification failed';
      setError(errorMessage)
      setResult({
        accessGranted: false,
        reason: errorMessage
      })
      stopScanning()
      setShowResultDialog(true)
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
      setShowResultDialog(true)
    } catch (error) {
      console.error('Manual verification failed:', error)
      setError(error.response?.data?.message || 'Manual verification failed')
      setResult({
        accessGranted: false,
        reason: error.response?.data?.message || 'Manual verification failed'
      })
      setShowResultDialog(true)
    } finally {
      setLoading(false)
    }
  }

  const clearResult = () => {
    setResult(null)
    setError('')
    setShowResultDialog(false)
  }

  const startNewScan = () => {
    clearResult()
    if (!manualMode) {
      // Ensure scanner is completely stopped before restarting
      if (qrScanner) {
        try {
          qrScanner.stop()
          qrScanner.destroy()
        } catch (e) {
          console.warn('Error cleaning up scanner:', e)
        }
        setQrScanner(null)
      }
      setScanning(false)
      
      // Small delay to ensure camera is fully released
      setTimeout(() => {
        startScanning()
      }, 300)
    }
  }

  return (
    <div className="scanner-container">
      <div className="location-card">
        <div className="location-controls">
          <div className="location-input-group">
            <label htmlFor="location">
              <svg className="icon icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Scanning Location
            </label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Main Gate, Library Entrance, Dormitory"
            />
          </div>
          <button
            onClick={() => setManualMode(!manualMode)}
            className={`mode-toggle-btn ${manualMode ? 'active' : ''}`}
          >
            <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {manualMode ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              )}
            </svg>
            {manualMode ? 'QR Mode' : 'Manual Mode'}
          </button>
        </div>
      </div>

      <div className="scanner-grid">
        {!manualMode ? (
          /* QR Scanner Mode */
          <div className="scanner-card">
            <div className="scanner-card-header">
              <h3 className="scanner-card-title">
                <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                QR Code Scanner
              </h3>
              {/* {cameras.length > 1 && (
                <div className="camera-selector">
                  <label>Camera:</label>
                  <select
                    value={selectedCamera}
                    onChange={(e) => switchCamera(e.target.value)}
                  >
                    {cameras.map((camera) => {
                      const isBack = camera.label.toLowerCase().includes('back') || 
                                   camera.label.toLowerCase().includes('environment') || 
                                   camera.label.toLowerCase().includes('rear')
                      const displayName = camera.label || `Camera ${camera.id}`
                      return (
                        <option key={camera.id} value={camera.id}>
                          {displayName} {isBack ? '(Back)' : '(Front)'}
                        </option>
                      )
                    })}
                  </select>

                </div>
              )} */}
            </div>
            <div className="scanner-card-body">
              <div className="video-container">
                <video
                  ref={videoRef}
                  className="video-element"
                  playsInline
                  muted
                />
                
                {!scanning && (
                  <div className="video-overlay">
                    <div className="video-overlay-content">
                      <svg className="video-overlay-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                      <p className="video-overlay-text">
                        Camera is ready. Click "Start Scanning" to begin.
                      </p>
                    </div>
                  </div>
                )}

                {loading && (
                  <div className="video-overlay loading-overlay">
                    <div className="video-overlay-content">
                      <div className="spinner" />
                      <p className="video-overlay-text">Verifying QR Code...</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="scanner-controls">
                {!scanning ? (
                  <button
                    onClick={startScanning}
                    className="scanner-btn scanner-btn-primary"
                    disabled={cameras.length === 0}
                  >
                    <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Start Scanning
                  </button>
                ) : (
                  <button
                    onClick={stopScanning}
                    className="scanner-btn scanner-btn-danger"
                  >
                    <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                    </svg>
                    Stop Scanning
                  </button>
                )}
              </div>

              {cameras.length === 0 && !error && (
                <div className="scanner-alert scanner-alert-warning">
                  <h4>
                    <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Camera Setup Required
                  </h4>
                  <p>To use QR scanning on mobile:</p>
                  <ol>
                    <li><strong>HTTPS Required:</strong> Camera access requires HTTPS connection. Access via https://your-ip:5173</li>
                    <li><strong>Allow Permissions:</strong> Grant camera permission when prompted by your browser</li>
                    <li><strong>Supported Browsers:</strong> Use Chrome, Safari, or Firefox (latest versions)</li>
                    <li><strong>Current Protocol:</strong> {window.location.protocol === 'https:' ? '✓ HTTPS (Good)' : '⚠️ HTTP (Camera may not work)'}</li>
                    <li>If camera still doesn't work, try refreshing or use Manual Mode</li>
                  </ol>
                  <div className="alert-actions">
                    <button 
                      onClick={() => window.location.reload()} 
                      className="alert-btn alert-btn-primary"
                    >
                      <svg className="icon icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh Page
                    </button>
                  </div>
                </div>
              )}
              
              {error && !showResultDialog && (
                <div className="scanner-alert scanner-alert-error" style={{ marginTop: '1rem' }}>
                  <h4>
                    <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Camera Issue
                  </h4>
                  <p>{error}</p>
                  <div className="alert-actions">
                    <button 
                      onClick={() => window.location.reload()} 
                      className="alert-btn alert-btn-primary"
                    >
                      <svg className="icon icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh
                    </button>
                    <button 
                      onClick={() => setManualMode(true)} 
                      className="alert-btn alert-btn-primary"
                    >
                      <svg className="icon icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Use Manual Mode
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Manual Verification Mode */
          <div className="scanner-card">
            <div className="scanner-card-header">
              <h3 className="scanner-card-title">
                <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Manual Verification
              </h3>
              <p className="scanner-card-subtitle">
                Use when QR code scanning is not available
              </p>
            </div>
            <div className="scanner-card-body">
              <form onSubmit={handleManualVerification} className="manual-form">
                <div className="form-group">
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

                <div className="form-group">
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
                  className="form-submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner" style={{ width: '20px', height: '20px' }} />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Verify Student
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Result Dialog Modal */}
        {showResultDialog && (
          <div className="result-modal-overlay">
            <div className="result-modal">
              {result ? (
                <div className="result-modal-content">
                  <div className={`result-icon ${result.accessGranted ? 'granted' : 'denied'}`}>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {result.accessGranted ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      )}
                    </svg>
                  </div>

                  <h3 className={`result-title ${result.accessGranted ? 'granted' : 'denied'}`}>
                    {result.accessGranted ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
                  </h3>

                  {result.student && (
                    <div className="student-info-card">
                      <div className="student-info-header">
                        {result.student.photo_url ? (
                          <img
                            src={result.student.photo_url}
                            alt={result.student.name}
                            className="student-avatar"
                          />
                        ) : (
                          <div className="student-avatar-placeholder">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                        
                        <div className="student-details">
                          <h4>{result.student.name}</h4>
                          <p><strong>ID:</strong> {result.student.student_id}</p>
                          <p><strong>Course:</strong> {result.student.course}</p>
                          <p><strong>Year:</strong> {result.student.year_level}</p>
                          <span className={`student-status-badge ${result.student.enrollment_status}`}>
                            {result.student.enrollment_status}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {result.reason && (
                    <div className="scanner-alert scanner-alert-warning" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                      <strong>Reason:</strong> {result.reason}
                    </div>
                  )}

                  <div className="result-metadata">
                    <p>
                      <svg className="icon icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <strong>Location:</strong> {result.location}
                    </p>
                    <p>
                      <svg className="icon icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <strong>Time:</strong> {new Date(result.timestamp).toLocaleString()}
                    </p>
                    {result.verificationType && (
                      <p>
                        <svg className="icon icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <strong>Method:</strong> {result.verificationType === 'manual' ? 'Manual Verification' : 'QR Code Scan'}
                      </p>
                    )}
                  </div>

                  <div className="result-actions">
                    <button onClick={startNewScan} className="result-btn result-btn-primary">
                      <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                      Scan Again
                    </button>
                    <button onClick={clearResult} className="result-btn result-btn-outline">
                      <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <div className="result-modal-content">
                  <div className="result-icon denied">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  
                  <h3 className="result-title denied">
                    Scan Failed
                  </h3>
                  
                  <div className="scanner-alert scanner-alert-error" style={{ marginBottom: '2rem' }}>
                    {error}
                  </div>

                  <div className="result-actions">
                    <button onClick={startNewScan} className="result-btn result-btn-primary">
                      <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Try Again
                    </button>
                    <button onClick={clearResult} className="result-btn result-btn-outline">
                      <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Done
                    </button>
                  </div>
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
