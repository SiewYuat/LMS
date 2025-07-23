import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const NotFound = () => {
  const { isAuthenticated, user } = useAuth()

  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '20px'
    }}>
      <div>
        <div style={{ fontSize: '6rem', marginBottom: '20px' }}>📚</div>
        <h1 style={{ fontSize: '3rem', color: '#333', marginBottom: '10px' }}>404</h1>
        <h2 style={{ color: '#666', marginBottom: '20px' }}>Page Not Found</h2>
        <p style={{ color: '#666', marginBottom: '30px', fontSize: '1.1rem' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary">
            Go Home
          </Link>
          <Link to="/books" className="btn btn-outline">
            Browse Books
          </Link>
          {isAuthenticated ? (
            <Link 
              to={user?.userType === 'ADMIN' ? '/admin/dashboard' : '/dashboard'} 
              className="btn btn-secondary"
            >
              Dashboard
            </Link>
          ) : (
            <Link to="/login" className="btn btn-secondary">
              Login
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default NotFound
