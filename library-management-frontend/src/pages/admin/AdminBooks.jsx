import React, { useState, useEffect } from 'react';
import bookService from '../../services/bookService';
import libraryService from '../../services/libraryService';
import { useAuth } from '../../contexts/AuthContext';
import './AdminBooks.css';

const AdminBooks = () => {
  const [books, setBooks] = useState([]);
  const [libraries, setLibraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    language: 'English',
    publisher: '',
    yearOfPublished: new Date().getFullYear()
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchBooks();
    fetchLibraries();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError('');
      const booksData = await bookService.getAllBooks();
      setBooks(booksData);
    } catch (err) {
      setError('Failed to load books: ' + err.message);
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLibraries = async () => {
    try {
      const librariesData = await libraryService.getAllLibraries();
      setLibraries(librariesData);
    } catch (err) {
      console.error('Error fetching libraries:', err);
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      await bookService.createBook(bookForm);
      await fetchBooks();
      setShowAddForm(false);
      resetForm();
      alert('Book added successfully!');
    } catch (err) {
      alert('Failed to add book: ' + err.message);
    }
  };

  const handleEditBook = async (e) => {
    e.preventDefault();
    try {
      await bookService.updateBook(selectedBook.bookId, bookForm);
      await fetchBooks();
      setShowEditForm(false);
      setSelectedBook(null);
      resetForm();
      alert('Book updated successfully!');
    } catch (err) {
      alert('Failed to update book: ' + err.message);
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await bookService.deleteBook(bookId);
        await fetchBooks();
        alert('Book deleted successfully!');
      } catch (err) {
        alert('Failed to delete book: ' + err.message);
      }
    }
  };

  const openEditForm = (book) => {
    setSelectedBook(book);
    setBookForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      language: book.language,
      publisher: book.publisher,
      yearOfPublished: book.yearOfPublished
    });
    setShowEditForm(true);
  };

  const resetForm = () => {
    setBookForm({
      title: '',
      author: '',
      isbn: '',
      category: '',
      language: 'English',
      publisher: '',
      yearOfPublished: new Date().getFullYear()
    });
  };

  const filteredAndSortedBooks = books
    .filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           book.isbn.includes(searchTerm);
      const matchesCategory = !categoryFilter || book.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const categories = [...new Set(books.map(book => book.category))].filter(Boolean);

  if (loading) {
    return (
      <div className="admin-books">
        <div className="loading">Loading books...</div>
      </div>
    );
  }

  return (
    <div className="admin-books">
      <div className="page-header">
        <h1>Book Management</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn btn-primary"
        >
          <i className="fas fa-plus"></i>
          Add New Book
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={fetchBooks} className="btn btn-sm btn-outline-primary">
            Retry
          </button>
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="books-controls">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search by title, author, or ISBN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input search-input"
          />
        </div>

        <div className="filter-section">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="form-select"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="sort-section">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="form-select"
          >
            <option value="title">Sort by Title</option>
            <option value="author">Sort by Author</option>
            <option value="yearOfPublished">Sort by Year</option>
            <option value="category">Sort by Category</option>
          </select>
          
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="form-select"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      {/* Books Statistics */}
      <div className="books-stats">
        <div className="stat-item">
          <span className="stat-number">{books.length}</span>
          <span className="stat-label">Total Books</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{filteredAndSortedBooks.length}</span>
          <span className="stat-label">Filtered Results</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{categories.length}</span>
          <span className="stat-label">Categories</span>
        </div>
      </div>

      {/* Books List */}
      {filteredAndSortedBooks.length === 0 ? (
        <div className="no-books">
          <div className="no-books-icon">📚</div>
          <h3>No books found</h3>
          <p>
            {searchTerm || categoryFilter
              ? 'Try adjusting your search criteria.'
              : 'Start by adding your first book to the library.'
            }
          </p>
        </div>
      ) : (
        <div className="books-grid">
          {filteredAndSortedBooks.map((book) => (
            <div key={book.bookId} className="book-card">
              <div className="book-header">
                <h3 className="book-title">{book.title}</h3>
                <div className="book-actions">
                  <button
                    onClick={() => openEditForm(book)}
                    className="btn btn-sm btn-outline-primary"
                    title="Edit book"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    onClick={() => handleDeleteBook(book.bookId)}
                    className="btn btn-sm btn-outline-danger"
                    title="Delete book"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>

              <div className="book-details">
                <div className="detail-row">
                  <span className="label">Author:</span>
                  <span className="value">{book.author}</span>
                </div>
                <div className="detail-row">
                  <span className="label">ISBN:</span>
                  <span className="value">{book.isbn}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Category:</span>
                  <span className="value">{book.category}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Language:</span>
                  <span className="value">{book.language}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Publisher:</span>
                  <span className="value">{book.publisher}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Year:</span>
                  <span className="value">{book.yearOfPublished}</span>
                </div>
              </div>

              <div className="book-stats">
                <div className="stat">
                  <span className="stat-value">{book.totalCopies || 0}</span>
                  <span className="stat-label">Total Copies</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{book.availableCopies || 0}</span>
                  <span className="stat-label">Available</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Book Modal */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Book</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="btn btn-sm btn-outline-secondary"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleAddBook} className="book-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="title">Title *</label>
                  <input
                    type="text"
                    id="title"
                    value={bookForm.title}
                    onChange={(e) => setBookForm({...bookForm, title: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="author">Author *</label>
                  <input
                    type="text"
                    id="author"
                    value={bookForm.author}
                    onChange={(e) => setBookForm({...bookForm, author: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="isbn">ISBN *</label>
                  <input
                    type="text"
                    id="isbn"
                    value={bookForm.isbn}
                    onChange={(e) => setBookForm({...bookForm, isbn: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <input
                    type="text"
                    id="category"
                    value={bookForm.category}
                    onChange={(e) => setBookForm({...bookForm, category: e.target.value})}
                    className="form-input"
                    placeholder="e.g., Fiction, Science, History"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="language">Language</label>
                  <select
                    id="language"
                    value={bookForm.language}
                    onChange={(e) => setBookForm({...bookForm, language: e.target.value})}
                    className="form-select"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Chinese">Chinese</option>
                    <option value="Japanese">Japanese</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="publisher">Publisher</label>
                  <input
                    type="text"
                    id="publisher"
                    value={bookForm.publisher}
                    onChange={(e) => setBookForm({...bookForm, publisher: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="yearOfPublished">Year Published</label>
                  <input
                    type="number"
                    id="yearOfPublished"
                    value={bookForm.yearOfPublished}
                    onChange={(e) => setBookForm({...bookForm, yearOfPublished: parseInt(e.target.value)})}
                    className="form-input"
                    min="1000"
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="btn btn-outline-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Book Modal */}
      {showEditForm && selectedBook && (
        <div className="modal-overlay" onClick={() => setShowEditForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Book</h2>
              <button
                onClick={() => setShowEditForm(false)}
                className="btn btn-sm btn-outline-secondary"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleEditBook} className="book-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="edit-title">Title *</label>
                  <input
                    type="text"
                    id="edit-title"
                    value={bookForm.title}
                    onChange={(e) => setBookForm({...bookForm, title: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-author">Author *</label>
                  <input
                    type="text"
                    id="edit-author"
                    value={bookForm.author}
                    onChange={(e) => setBookForm({...bookForm, author: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-isbn">ISBN *</label>
                  <input
                    type="text"
                    id="edit-isbn"
                    value={bookForm.isbn}
                    onChange={(e) => setBookForm({...bookForm, isbn: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-category">Category</label>
                  <input
                    type="text"
                    id="edit-category"
                    value={bookForm.category}
                    onChange={(e) => setBookForm({...bookForm, category: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-language">Language</label>
                  <select
                    id="edit-language"
                    value={bookForm.language}
                    onChange={(e) => setBookForm({...bookForm, language: e.target.value})}
                    className="form-select"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Chinese">Chinese</option>
                    <option value="Japanese">Japanese</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="edit-publisher">Publisher</label>
                  <input
                    type="text"
                    id="edit-publisher"
                    value={bookForm.publisher}
                    onChange={(e) => setBookForm({...bookForm, publisher: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-yearOfPublished">Year Published</label>
                  <input
                    type="number"
                    id="edit-yearOfPublished"
                    value={bookForm.yearOfPublished}
                    onChange={(e) => setBookForm({...bookForm, yearOfPublished: parseInt(e.target.value)})}
                    className="form-input"
                    min="1000"
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowEditForm(false)}
                  className="btn btn-outline-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBooks;