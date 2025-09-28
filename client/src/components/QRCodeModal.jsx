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

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: '500px' }}>
        <div className="card-header">
          <h3 className="card-title">QR Code Generated</h3>
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

        <div className="card-body" style={{ textAlign: 'center' }}>
          {/* Student Info */}
          <div style={{
            backgroundColor: '#f8fafc',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem'
          }}>
            <h4 style={{ margin: '0 0 0.5rem', color: 'var(--text-color)' }}>
              {qrData.student.name}
            </h4>
            <p style={{ margin: '0.25rem 0', color: 'var(--text-muted)' }}>
              <strong>Student ID:</strong> {qrData.student.student_id}
            </p>
            <p style={{ margin: '0.25rem 0', color: 'var(--text-muted)' }}>
              <strong>Course:</strong> {qrData.student.course}
            </p>
          </div>

          {/* QR Code */}
          <div style={{
            padding: '1.5rem',
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '2px dashed var(--border-color)',
            marginBottom: '1.5rem',
            display: 'inline-block'
          }}>
            <img
              src={qrData.qrCode}
              alt="Student QR Code"
              style={{
                width: '256px',
                height: '256px',
                display: 'block'
              }}
            />
          </div>

          {/* Instructions */}
          <div style={{
            backgroundColor: '#eff6ff',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            textAlign: 'left'
          }}>
            <h5 style={{ margin: '0 0 0.75rem', color: '#1e40af' }}>
              📱 How to use this QR Code:
            </h5>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#374151' }}>
              <li style={{ marginBottom: '0.5rem' }}>
                Security personnel can scan this code using the CampusQR scanner
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                The system will verify the student's enrollment status in real-time
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                Each scan is logged for security and audit purposes
              </li>
              <li>
                QR code expires after 24 hours for security reasons
              </li>
            </ul>
          </div>

          {/* Security Notice */}
          <div style={{
            backgroundColor: '#fef3c7',
            padding: '0.75rem',
            borderRadius: '6px',
            fontSize: '0.875rem',
            color: '#92400e',
            marginBottom: '1.5rem'
          }}>
            ⚠️ <strong>Security Notice:</strong> This QR code contains encrypted student data. 
            Do not share or distribute unauthorized copies.
          </div>
        </div>

        <div className="card-footer">
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              onClick={handleDownload}
              className="btn btn-outline"
            >
              💾 Download PNG
            </button>
            <button
              onClick={handlePrint}
              className="btn btn-primary"
            >
              🖨️ Print QR Code
            </button>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button
              onClick={onClose}
              className="btn btn-secondary btn-sm"
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
