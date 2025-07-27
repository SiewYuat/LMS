import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import borrowService from '../../services/borrowService'
import notificationService from '../../services/notificationService'
import bookService from '../../services/bookService'
import './MemberDashboard.css'

const MemberDashboard = () => {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState({
    activeBorrows: [],
    recentNotifications: [],
    borrowStats: null,
    featuredBooks: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Fetch active borrows
        const activeBorrows = await borrowService.getActiveBorrowsByMember(user.id)
        
        // Fetch recent notifications
        const notifications = await notificationService.getNotificationsByMember(user.id)
        const recentNotifications = notifications.slice(0, 5) // Get latest 5
        
        // Fetch borrowing statistics
        const borrowStats = await borrowService.getMemberBorrowStats(user.id)
        
        // Fetch some featured books
        const featuredBooks = await bookService.getAllBooks(0, 4)
        
        setDashboardData({
          activeBorrows,
          recentNotifications,
          borrowStats,
          featuredBooks
        })
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      fetchDashboardData()
    }
  }, [user])

  const handleReturnBook = async (borrowId) => {
      // ADD THIS for confirmation dialog:
      const borrowItem = dashboardData.activeBorrows.find(b => b.borrowId === borrowId)
      const confirmReturn = window.confirm(
        `Are you sure you want to return "${borrowItem?.bookTitle || 'this book'}"?\n\n` +
        `Please make sure you have the physical book with you to return to the library.`
      )

      if (!confirmReturn) {
        return
      }

    
    try {
      await borrowService.returnBook(borrowId)
      // Refresh active borrows
      const activeBorrows = await borrowService.getActiveBorrowsByMember(user.id)
      setDashboardData(prev => ({ ...prev, activeBorrows }))
    } catch (error) {
      console.error('Error returning book:', error)
      alert('Failed to return book: ' + (error.userMessage || error.message))
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getDaysUntilDue = (dueDate) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getStatusBadge = (daysUntilDue) => {
    if (daysUntilDue < 0) {
      return <span className="status-badge overdue">Overdue</span>
    } else if (daysUntilDue <= 3) {
      return <span className="status-badge due-soon">Due Soon</span>
    } else {
      return <span className="status-badge on-time">On Time</span>
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h2>Error Loading Dashboard</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="member-dashboard">
      <div className="dashboard-container">
        {/* Welcome Header */}
        <div className="dashboard-header">
          <h1>Welcome back, {user?.fullName || user?.username}!</h1>
          <p>Here's what's happening with your library account</p>
        </div>

        {/* Quick Stats */}
        <div className="quick-stats">
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <div className="stat-number">{dashboardData.activeBorrows.length}</div>
              <div className="stat-label">Currently Borrowed</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📖</div>
            <div className="stat-content">
              <div className="stat-number">{dashboardData.borrowStats?.totalBorrows || 0}</div>
              <div className="stat-label">Total Books Read</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔔</div>
            <div className="stat-content">
              <div className="stat-number">{dashboardData.recentNotifications.length}</div>
              <div className="stat-label">New Notifications</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="dashboard-grid">
          {/* Currently Borrowed Books */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Currently Borrowed Books</h2>
              <Link to="/borrow-history" className="section-link">View All</Link>
            </div>
            
            {dashboardData.activeBorrows.length > 0 ? (
              <div className="borrowed-books">
                {dashboardData.activeBorrows.map((borrow) => {
                  const daysUntilDue = getDaysUntilDue(borrow.dueDate)
                  return (
                    <div key={borrow.borrowId} className="borrowed-book-card">
                      <div className="book-info">
                        <h4>{borrow.bookTitle}</h4>
                        <p className="library-info">From: {borrow.libraryName}</p>
                        <p className="due-date">Due: {formatDate(borrow.dueDate)}</p>
                        {getStatusBadge(daysUntilDue)}
                      </div>
                      <div className="book-actions">
                        <button 
                          onClick={() => handleReturnBook(borrow.borrowId)}
                          className="btn btn-sm btn-outline"
                        >
                          Return Book
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="empty-state">
                <p>You haven't borrowed any books yet.</p>
                <Link to="/books" className="btn btn-primary">Browse Books</Link>
              </div>
            )}
          </div>

          {/* Recent Notifications */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Recent Notifications</h2>
              <Link to="/notifications" className="section-link">View All</Link>
            </div>
            
            {dashboardData.recentNotifications.length > 0 ? (
              <div className="notifications-list">
                {dashboardData.recentNotifications.map((notification) => (
                  <div key={notification.notificationId} className="notification-item">
                    <div className="notification-content">
                      <p>{notification.ntfMessage}</p>
                      <span className="notification-date">
                        {formatDate(notification.ntfSentDate)}
                      </span>
                    </div>
                    <div className="notification-type">
                      {notification.ntfType === 'OVERDUE' && '⚠️'}
                      {notification.ntfType === 'REMINDER' && '🔔'}
                      {notification.ntfType === 'WELCOME' && '👋'}
                      {notification.ntfType === 'GENERAL' && 'ℹ️'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No new notifications.</p>
              </div>
            )}
          </div>

          {/* Featured Books */}
          <div className="dashboard-section featured-section">
            <div className="section-header">
              <h2>Featured Books</h2>
              <Link to="/books" className="section-link">Browse All</Link>
            </div>
            
            <div className="featured-books-grid">
              {dashboardData.featuredBooks.map((book) => (
                <div key={book.bookId} className="featured-book-card">
                  <div className="book-cover-small">📖</div>
                  <div className="book-details">
                    <h4>{book.title}</h4>
                    <p>{book.author}</p>
                    <span className={`availability ${book.availableCopies > 0 ? 'available' : 'unavailable'}`}>
                      {book.availableCopies > 0 ? 'Available' : 'Not Available'}
                    </span>
                  </div>
                  <Link to={`/books/${book.bookId}`} className="btn btn-sm btn-outline">
                    View
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Quick Actions</h2>
            </div>
            
            <div className="quick-actions">
              <Link to="/books" className="action-card">
                <div className="action-icon">🔍</div>
                <div className="action-content">
                  <h3>Browse Books</h3>
                  <p>Discover new books to read</p>
                </div>
              </Link>
              
              <Link to="/borrow-history" className="action-card">
                <div className="action-icon">📚</div>
                <div className="action-content">
                  <h3>My Books</h3>
                  <p>View borrowing history</p>
                </div>
              </Link>
              
              <Link to="/profile" className="action-card">
                <div className="action-icon">👤</div>
                <div className="action-content">
                  <h3>Profile</h3>
                  <p>Update your information</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MemberDashboard