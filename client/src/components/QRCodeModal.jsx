import './QRCodeModal.css'

const QRCodeModal = ({ qrData, onClose }) => {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${qrData.student.name}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: white;
            }
            .qr-card {
              text-align: center;
              border: 2px solid #ddd;
              border-radius: 10px;
              padding: 20px;
              max-width: 300px;
            }
            .qr-code {
              margin: 20px 0;
            }
            .student-info h3 {
              margin: 10px 0 5px;
              color: #333;
            }
            .student-info p {
              margin: 2px 0;
              color: #666;
            }
            @media print {
              body { background: white; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="qr-card">
            <h2>CampusQR ID</h2>
            <div class="qr-code">
              <img src="${qrData.qrCode}" alt="QR Code" style="width: 200px; height: 200px;">
            </div>
            <div class="student-info">
              <h3>${qrData.student.name}</h3>
              <p><strong>ID:</strong> ${qrData.student.student_id}</p>
              <p><strong>Course:</strong> ${qrData.student.course}</p>
              <p style="font-size: 12px; color: #999; margin-top: 15px;">
                Generated on ${new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.download = `qr-code-${qrData.student.student_id}.png`
    link.href = qrData.qrCode
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="qr-modal-overlay" onClick={handleOverlayClick}>
      <div className="qr-modal">
        <div className="qr-modal-header">
          <h3 className="qr-modal-title">QR Code Generated</h3>
          <button
            onClick={onClose}
            className="qr-modal-close"
          >
            <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="qr-modal-body">
          {/* Student Info */}
          <div className="student-info-card">
            <h4 className="student-name">
              {qrData.student.name}
            </h4>
            <p className="student-detail">
              <strong>Student ID:</strong> {qrData.student.student_id}
            </p>
            <p className="student-detail">
              <strong>Course:</strong> {qrData.student.course}
            </p>
          </div>

          <div className="qr-code-container">
            <img
              src={qrData.qrCode}
              alt="Student QR Code"
              className="qr-code-image"
            />
          </div>

          <div className="instructions-card">
            <h5 className="instructions-title">
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              How to use this QR Code:
            </h5>
            <ul className="instructions-list">
              <li>
                Security personnel can scan this code using the CampusQR scanner
              </li>
              <li>
                The system will verify the student's enrollment status in real-time
              </li>
              <li>
                Each scan is logged for security and audit purposes
              </li>
              <li>
                QR code expires after 24 hours for security reasons
              </li>
            </ul>
          </div>

          <div className="security-notice">
            <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{minWidth: '16px'}}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span>
              <strong>Security Notice:</strong> This QR code contains encrypted student data. 
              Do not share or distribute unauthorized copies.
            </span>
          </div>
        </div>

        <div className="qr-modal-footer">
          <div className="action-buttons">
            <button
              onClick={handleDownload}
              className="download-btn"
            >
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PNG
            </button>
            <button
              onClick={handlePrint}
              className="print-btn"
            >
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print QR Code
            </button>
          </div>
          
          <div className="close-container">
            <button
              onClick={onClose}
              className="close-btn"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QRCodeModal
