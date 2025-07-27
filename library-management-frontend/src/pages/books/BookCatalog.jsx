import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import bookService from '../../services/bookService'
import borrowService from '../../services/borrowService'
import libraryService from '../../services/libraryService'
import './BookCatalog.css'

const BookCatalog = () => {
  const { user, isAuthenticated } = useAuth()
  const [books, setBooks] = useState([])
  const [filteredBooks, setFilteredBooks] = useState([])
  const [categories, setCategories] = useState([])
  const [libraries, setLibraries] = useState([])
  const [loading, setLoading] = useState(true)
  const [borrowing, setBorrowing] = useState({})
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedLibrary, setSelectedLibrary] = useState('')
  const [searchType, setSearchType] = useState('title')
  const [showAvailableOnly, setShowAvailableOnly] = useState(false)

  useEffect(() => {
    fetchBooks()
    fetchCategories()
    fetchLibraries()
  }, [])

  useEffect(() => {
    filterBooks()
  }, [books, searchTerm, selectedCategory, selectedLibrary, searchType, showAvailableOnly])

  const fetchBooks = async () => {
    try {
      setLoading(true)
      const response = await bookService.getAllBooks(0, 100)
      
      // Enhance books with library-specific availability
      const booksWithLibraryInfo = await Promise.all(
        response.map(async (book) => {
          try {
            const instances = await bookService.getBookInstances(book.bookId)
            
            // Group instances by library
            const libraryInstances = {}
            instances.forEach(instance => {
              if (!libraryInstances[instance.libraryId]) {
                libraryInstances[instance.libraryId] = {
                  libraryId: instance.libraryId,
                  libraryName: instance.libraryName,
                  totalCopies: 0,
                  availableCopies: 0,
                  instances: []
                }
              }
              
              libraryInstances[instance.libraryId].totalCopies++
              libraryInstances[instance.libraryId].instances.push(instance)
              
              // Only count instances with "AVAILABLE" status as available
              if (instance.bkStatus === 'AVAILABLE') {
                libraryInstances[instance.libraryId].availableCopies++
              }
            })
            
            return {
              ...book,
              libraryInstances: Object.values(libraryInstances),
              instances: instances
            }
          } catch (error) {
            console.error(`Error fetching instances for book ${book.bookId}:`, error)
            return {
              ...book,
              libraryInstances: [],
              instances: []
            }
          }
        })
      )
      
      setBooks(booksWithLibraryInfo)
    } catch (error) {
      console.error('Error fetching books:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await bookService.getAllCategories()
      setCategories(response)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchLibraries = async () => {
    try {
      const response = await libraryService.getAllLibraries()
      setLibraries(response)
    } catch (error) {
      console.error('Error fetching libraries:', error)
    }
  }

  const filterBooks = () => {
    let filtered = [...books]

    // Text search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(book => {
        switch (searchType) {
          case 'title':
            return book.title.toLowerCase().includes(searchTerm.toLowerCase())
          case 'author':
            return book.author.toLowerCase().includes(searchTerm.toLowerCase())
          case 'isbn':
            return book.isbn && book.isbn.toLowerCase().includes(searchTerm.toLowerCase())
          default:
            return book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   book.author.toLowerCase().includes(searchTerm.toLowerCase())
        }
      })
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(book => book.category === selectedCategory)
    }

    // Library filter - filter books that have available copies at selected library
    if (selectedLibrary) {
      filtered = filtered.filter(book => {
        return book.libraryInstances.some(lib => 
          lib.libraryId.toString() === selectedLibrary && lib.availableCopies > 0
        )
      })
    }

    // Availability filter - only show books with available copies
    if (showAvailableOnly) {
      filtered = filtered.filter(book => book.availableCopies > 0)
    }

    setFilteredBooks(filtered)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    // The filtering happens automatically via useEffect
  }

  const handleBorrowBook = async (bookId, preferredLibraryId = null) => {
    if (!isAuthenticated) {
      alert('Please login to borrow books')
      return
    }

    if (user?.userType !== 'MEMBER') {
      alert('Only members can borrow books')
      return
    }

    try {
      const book = books.find(b => b.bookId === bookId)
      if (!book) {
        alert('Book not found')
        return
      }

      // Find available instance from preferred library only
      let selectedInstance = null
      let selectedLibraryName = ''
      
      if (preferredLibraryId) {
        // Only try to find available instance from the specified library
        const preferredLibrary = book.libraryInstances.find(lib => 
          lib.libraryId.toString() === preferredLibraryId.toString()
        )
        
        if (preferredLibrary && preferredLibrary.availableCopies > 0) {
          selectedInstance = preferredLibrary.instances.find(instance => 
            instance.bkStatus === 'AVAILABLE'
          )
          selectedLibraryName = preferredLibrary.libraryName
        }
      }

      if (!selectedInstance) {
        alert('No available copies of this book at the selected library')
        return
      }

      // ADD CONFIRMATION DIALOG BEFORE BORROWING
      const confirmBorrow = window.confirm(
        `Are you sure you want to borrow "${book.title}" from ${selectedLibraryName}?\n\n` +
        `This book will be due in 21 days and you will be responsible for returning it on time to the library.`
      )

      if (!confirmBorrow) {
        return // User cancelled the borrow operation
      }

      setBorrowing(prev => ({ ...prev, [bookId]: true }))

      // Borrow the selected instance
      await borrowService.borrowBook(user.id, selectedInstance.bkInstanceId)
      
      alert(`Book borrowed successfully from ${selectedLibraryName}!`)
      
      // Refresh books to update availability
      await fetchBooks()
      
    } catch (error) {
      console.error('Error borrowing book:', error)
      
      // // Enhanced error messages
      // let errorMessage = 'Failed to borrow book'
      // if (error.response?.data) {
      //   if (typeof error.response.data === 'string') {
      //     errorMessage = error.response.data
      //   } else if (error.response.data.message) {
      //     errorMessage = error.response.data.message
      //   }
      // } else if (error.message) {
      //   errorMessage = error.message
      // }
      // ENHANCED ERROR HANDLING FOR OVERDUE PREVENTION
      let errorMessage = 'Failed to borrow book'
      let isOverdueError = false
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      // Check if error is due to overdue books
      if (errorMessage.toLowerCase().includes('overdue') || 
          errorMessage.toLowerCase().includes('return overdue books')) {
        isOverdueError = true
      }
      
      // ENHANCED ERROR DISPLAY FOR OVERDUE PREVENTION
      if (isOverdueError) {
        const viewHistoryAction = window.confirm(
          `${errorMessage}\n\nWould you like to view your borrowing history to see which books are overdue?`
        )
        
        if (viewHistoryAction) {
          alert('Please check "My Books" section in the navigation menu to view your borrowing history.')
        }
      } else {

        // Regular error handling for other types of errors      
      alert(errorMessage)
      } 
    }finally {
      setBorrowing(prev => ({ ...prev, [bookId]: false }))
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setSelectedLibrary('')
    setSearchType('title')
    setShowAvailableOnly(false)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading books...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="book-catalog">
      <div className="catalog-container">
        {/* Header */}
        <div className="catalog-header">
          <h1>Book Catalog</h1>
          <p>Discover and borrow from our extensive collection</p>
        </div>

        {/* Search and Filters */}
        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-group">
              <select 
                value={searchType} 
                onChange={(e) => setSearchType(e.target.value)}
                className="search-type-select"
              >
                <option value="title">Title</option>
                <option value="author">Author</option>
                <option value="isbn">ISBN</option>
                <option value="all">All Fields</option>
              </select>
              
              <input
                type="text"
                placeholder={`Search by ${searchType}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              
              <button type="submit" className="search-btn">
                🔍 Search
              </button>
            </div>
          </form>

          <div className="filters">
            <div className="filter-group">
              <label>Category:</label>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-select"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Library:</label>
              <select 
                value={selectedLibrary} 
                onChange={(e) => setSelectedLibrary(e.target.value)}
                className="filter-select"
              >
                <option value="">All Libraries</option>
                {libraries.map(library => (
                  <option key={library.libraryId} value={library.libraryId}>
                    {library.libraryName}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={showAvailableOnly}
                  onChange={(e) => setShowAvailableOnly(e.target.checked)}
                />
                Available books only
              </label>
            </div>

            <button onClick={clearFilters} className="btn btn-outline btn-sm">
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="results-summary">
          <p>
            Showing {filteredBooks.length} of {books.length} books
            {searchTerm && ` for "${searchTerm}"`}
            {selectedCategory && ` in "${selectedCategory}"`}
            {selectedLibrary && ` available at ${libraries.find(lib => lib.libraryId.toString() === selectedLibrary)?.libraryName}`}
          </p>
        </div>

        {/* Books Grid */}
        {filteredBooks.length > 0 ? (
          <div className="books-grid">
            {filteredBooks.map((book) => (
              <div key={book.bookId} className="book-card">
                <div className="book-cover">
                  <div className="book-placeholder">📖</div>
                </div>
                
                <div className="book-info">
                  <h3>{book.title}</h3>
                  <p className="book-author">by {book.author}</p>
                  <p className="book-category">{book.category}</p>
                  {book.isbn && <p className="book-isbn">ISBN: {book.isbn}</p>}
                  {book.yearOfPublished && <p className="book-year">Published: {book.yearOfPublished}</p>}
                  
                  <div className="book-availability">
                    <span className={`availability-badge ${book.availableCopies > 0 ? 'available' : 'unavailable'}`}>
                      {book.availableCopies > 0 ? 'Available' : 'Not Available'}
                    </span>
                    <span className="copies-info">
                      {book.availableCopies}/{book.totalCopies} copies
                    </span>
                  </div>

                  {/* Library-specific availability */}
                  {book.libraryInstances && book.libraryInstances.length > 0 && (
                    <div className="library-availability">
                      <h4>Available at:</h4>
                      <div className="library-list">
                        {book.libraryInstances
                          .filter(lib => lib.availableCopies > 0)
                          .map(library => (
                            <div key={library.libraryId} className="library-item">
                              <span className="library-name">{library.libraryName}</span>
                              <span className="library-copies">({library.availableCopies}/{library.totalCopies})</span>
                              {isAuthenticated && user?.userType === 'MEMBER' && (
                                <button 
                                  onClick={() => handleBorrowBook(book.bookId, library.libraryId)}
                                  disabled={borrowing[book.bookId]}
                                  className="btn btn-sm btn-primary library-borrow-btn"
                                  title={`Borrow from ${library.libraryName}`}
                                >
                                  {borrowing[book.bookId] ? (
                                    <span className="spinner-small"></span>
                                  ) : (
                                    'Borrow'
                                  )}
                                </button>
                              )}
                            </div>
                          ))}
                      </div>
                      
                      {book.libraryInstances.filter(lib => lib.availableCopies === 0).length > 0 && (
                        <div className="unavailable-libraries">
                          <small>
                            Not available at: {book.libraryInstances
                              .filter(lib => lib.availableCopies === 0)
                              .map(lib => lib.libraryName)
                              .join(', ')}
                          </small>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="book-actions">
                    <Link to={`/books/${book.bookId}`} className="btn btn-outline btn-sm">
                      View Details
                    </Link>
                    
                    {/* COMPLETELY REMOVED: "Borrow from Any Library" button */}
                    {/* Users can only borrow from specific libraries above */}
                    
                    {!isAuthenticated && (
                      <Link to="/login" className="btn btn-primary btn-sm">
                        Login to Borrow
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <div className="no-results-content">
              <h3>No books found</h3>
              <p>
                {searchTerm || selectedCategory || selectedLibrary ? (
                  <>
                    No books match your current filters. Try adjusting your search terms or 
                    <button onClick={clearFilters} className="link-button">clear all filters</button>.
                  </>
                ) : (
                  'No books are currently available in the catalog.'
                )}
              </p>
              {!isAuthenticated && (
                <div className="login-prompt">
                  <p>
                    <Link to="/login" className="btn btn-primary">Login</Link> or 
                    <Link to="/register" className="btn btn-outline">Register</Link> to access more features
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BookCatalog