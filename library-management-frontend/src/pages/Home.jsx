import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import bookService from '../services/bookService'
import './Home.css'

const Home = () => {
  const { isAuthenticated, user } = useAuth()
  const [featuredBooks, setFeaturedBooks] = useState([])
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalMembers: 0,
    activeLoans: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        // Fetch featured books (first 6 books)
        const booksResponse = await bookService.getAllBooks(0, 6)
        setFeaturedBooks(booksResponse)
        
        // Set some sample stats (you can implement these endpoints in backend)
        setStats({
          totalBooks: 152523,
          totalMembers: 4752,
          activeLoans: 2521
        })
      } catch (error) {
        console.error('Error fetching home data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHomeData()
  }, [])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to Your Digital Library</h1>
          <p>Discover, borrow, and enjoy thousands of books at your fingertips</p>
          
          {!isAuthenticated ? (
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary">
                Get Started
              </Link>
              <Link to="/books" className="btn btn-secondary">
                Browse Books
              </Link>
            </div>
          ) : (
            <div className="hero-actions">
              <Link 
                to={user?.userType === 'ADMIN' ? '/admin/dashboard' : '/dashboard'} 
                className="btn btn-primary"
              >
                Go to Dashboard
              </Link>
              <Link to="/books" className="btn btn-secondary">
                Browse Books
              </Link>
            </div>
          )}
        </div>
        
        <div className="hero-image">
          <div className="hero-illustration">
            📚📖📕📗📘📙
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📚</div>
              <div className="stat-number">{stats.totalBooks.toLocaleString()}</div>
              <div className="stat-label">Total Books</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-number">{stats.totalMembers.toLocaleString()}</div>
              <div className="stat-label">Members</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📖</div>
              <div className="stat-number">{stats.activeLoans.toLocaleString()}</div>
              <div className="stat-label">Active Loans</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="featured-books">
        <div className="container">
          <h2>Featured Books</h2>
          <div className="books-grid">
            {featuredBooks.length > 0 ? (
              featuredBooks.map((book) => (
                <div key={book.bookId} className="book-card">
                  <div className="book-cover">
                    <div className="book-placeholder">📖</div>
                  </div>
                  <div className="book-info">
                    <h3>{book.title}</h3>
                    <p className="book-author">by {book.author}</p>
                    <p className="book-category">{book.category}</p>
                    <div className="book-availability">
                      <span className={`availability-badge ${book.availableCopies > 0 ? 'available' : 'unavailable'}`}>
                        {book.availableCopies > 0 ? 'Available' : 'Not Available'}
                      </span>
                      <span className="copies-info">
                        {book.availableCopies}/{book.totalCopies} copies
                      </span>
                    </div>
                    <Link to={`/books/${book.bookId}`} className="btn btn-outline">
                      View Details
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-books">
                <p>No featured books available at the moment.</p>
              </div>
            )}
          </div>
          
          <div className="view-all-books">
            <Link to="/books" className="btn btn-primary">
              View All Books
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2>Why Choose Our Library?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Easy Search</h3>
              <p>Find books quickly by title, author, category, or ISBN with our advanced search system.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Digital Access</h3>
              <p>Access your account, browse books, and manage loans anytime, anywhere on any device.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔔</div>
              <h3>Smart Notifications</h3>
              <p>Get reminded about due dates, new arrivals, and important library updates.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Personal Dashboard</h3>
              <p>Track your borrowing history, current loans, and discover new reading recommendations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      {!isAuthenticated && (
        <section className="cta-section">
          <div className="container">
            <div className="cta-content">
              <h2>Ready to Start Reading?</h2>
              <p>Join thousands of book lovers and get access to our extensive collection today.</p>
              <Link to="/register" className="btn btn-primary btn-large">
                Register Now - It's Free!
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default Home