import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import bookService from '../../services/bookService'
import borrowService from '../../services/borrowService'

const BookDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [borrowing, setBorrowing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchBookDetails()
  }, [id])

  const fetchBookDetails = async () => {
    try {
      setLoading(true)
      const response = await bookService.getBookById(id)
      setBook(response)
    } catch (error) {
      console.error('Error fetching book details:', error)
      setError('Book not found')
    } finally {
      setLoading(false)
    }
  }

  const handleBorrowBook = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    if (user?.userType !== 'MEMBER') {
      alert('Only members can borrow books')
      return
    }

    try {
      setBorrowing(true)
      
      // Get available instances for this book
      const availableInstances = await bookService.getAvailableInstances(book.bookId)
      
      if (availableInstances.length === 0) {
        alert('No available copies of this book')
        return
      }

      // Borrow the first available instance
      const bookInstanceId = availableInstances[0].bkInstanceId
      await borrowService.borrowBook(user.id, bookInstanceId)
      
      alert('Book borrowed successfully!')
      
      // Refresh book details to update availability
      await fetchBookDetails()
      
    } catch (error) {
      console.error('Error borrowing book:', error)
      alert('Failed to borrow book: ' + (error.userMessage || error.message))
    } finally {
      setBorrowing(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading book details...</p>
        </div>
      </div>
    )
  }

  if (error || !book) {
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
          <h2 style={{ color: '#dc3545', marginBottom: '15px' }}>Book Not Found</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>{error}</p>
          <Link to="/books" className="btn btn-primary">Back to Catalog</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '20px 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Back Navigation */}
        <div style={{ marginBottom: '30px' }}>
          <button 
            onClick={() => navigate(-1)} 
            className="btn btn-outline"
            style={{ marginRight: '15px' }}
          >
            ← Back
          </button>
          <Link to="/books" className="btn btn-outline">Browse All Books</Link>
        </div>

        {/* Book Details Card */}
        <div className="card">
          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '40px', padding: '40px' }}>
            
            {/* Book Cover */}
            <div>
              <div style={{
                height: '400px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '4rem',
                color: 'white',
                marginBottom: '20px'
              }}>
                📖
              </div>
              
              {/* Availability Badge */}
              <div style={{ textAlign: 'center' }}>
                <span className={`badge ${book.availableCopies > 0 ? 'badge-success' : 'badge-danger'}`}>
                  {book.availableCopies > 0 ? 'Available' : 'Not Available'}
                </span>
                <p style={{ marginTop: '10px', color: '#666' }}>
                  {book.availableCopies} of {book.totalCopies} copies available
                </p>
              </div>
            </div>

            {/* Book Information */}
            <div>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '15px', color: '#333' }}>
                {book.title}
              </h1>
              
              <div style={{ fontSize: '1.3rem', color: '#666', marginBottom: '20px' }}>
                by <strong>{book.author}</strong>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div>
                  <strong>Category:</strong>
                  <p style={{ margin: '5px 0', color: '#667eea' }}>{book.category}</p>
                </div>
                
                {book.isbn && (
                  <div>
                    <strong>ISBN:</strong>
                    <p style={{ margin: '5px 0', fontFamily: 'monospace' }}>{book.isbn}</p>
                  </div>
                )}
                
                {book.publisher && (
                  <div>
                    <strong>Publisher:</strong>
                    <p style={{ margin: '5px 0' }}>{book.publisher}</p>
                  </div>
                )}
                
                {book.yearOfPublished && (
                  <div>
                    <strong>Year Published:</strong>
                    <p style={{ margin: '5px 0' }}>{book.yearOfPublished}</p>
                  </div>
                )}
                
                {book.language && (
                  <div>
                    <strong>Language:</strong>
                    <p style={{ margin: '5px 0' }}>{book.language}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                {isAuthenticated && user?.userType === 'MEMBER' && book.availableCopies > 0 && (
                  <button 
                    onClick={handleBorrowBook}
                    disabled={borrowing}
                    className={`btn btn-primary btn-lg ${borrowing ? 'loading' : ''}`}
                  >
                    {borrowing ? (
                      <>
                        <span className="spinner-small"></span>
                        Borrowing...
                      </>
                    ) : (
                      '📚 Borrow This Book'
                    )}
                  </button>
                )}

                {!isAuthenticated && (
                  <Link to="/login" className="btn btn-primary btn-lg">
                    Login to Borrow
                  </Link>
                )}

                {isAuthenticated && user?.userType === 'MEMBER' && book.availableCopies === 0 && (
                  <button className="btn btn-outline btn-lg" disabled>
                    Not Available
                  </button>
                )}
              </div>

              {/* Library Instances */}
              {book.instances && book.instances.length > 0 && (
                <div style={{ marginTop: '40px' }}>
                  <h3 style={{ marginBottom: '20px' }}>Available Locations</h3>
                  <div style={{ display: 'grid', gap: '15px' }}>
                    {book.instances.map((instance) => (
                      <div 
                        key={instance.bkInstanceId}
                        style={{
                          padding: '15px',
                          border: '1px solid #e9ecef',
                          borderRadius: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <strong>{instance.libraryName}</strong>
                          <p style={{ margin: '5px 0', color: '#666', fontSize: '0.9rem' }}>
                            Condition: {instance.bkCondition}
                          </p>
                        </div>
                        <span className={`badge ${instance.bkStatus === 'AVAILABLE' ? 'badge-success' : 'badge-danger'}`}>
                          {instance.bkStatus}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <p style={{ color: '#666' }}>
            Need help finding this book? Contact your local library or visit our{' '}
            <Link to="/books" style={{ color: '#667eea' }}>book catalog</Link> for more options.
          </p>
        </div>
      </div>
    </div>
  )
}

export default BookDetails