const LoadingSpinner = ({ size = 'medium', message = 'Loading...' }) => {
  const sizes = {
    small: { width: '20px', height: '20px', borderWidth: '2px' },
    medium: { width: '40px', height: '40px', borderWidth: '4px' },
    large: { width: '60px', height: '60px', borderWidth: '6px' }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      gap: '1rem'
    }}>
      <div 
        className="spinner"
        style={{
          ...sizes[size],
          border: `${sizes[size].borderWidth} solid var(--border-color)`,
          borderTop: `${sizes[size].borderWidth} solid var(--primary-color)`
        }}
      />
      {message && (
        <p style={{ 
          margin: 0, 
          color: 'var(--text-muted)', 
          fontSize: '0.875rem' 
        }}>
          {message}
        </p>
      )}
    </div>
  )
}

export default LoadingSpinner
