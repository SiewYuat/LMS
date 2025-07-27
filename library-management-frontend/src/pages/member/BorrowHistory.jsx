import React, { useState, useEffect } from 'react';
import borrowService from '../../services/borrowService';
import { useAuth } from '../../contexts/AuthContext';
import './BorrowHistory.css';

const BorrowHistory = () => {
  const [borrowHistory, setBorrowHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL'); // ALL, ACTIVE, RETURNED, OVERDUE
  const [sortBy, setSortBy] = useState('borrowDate'); // borrowDate, dueDate, returnDate
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
  const { user } = useAuth();
  const overdueBooks = borrowHistory.filter(b => b.status === 'OVERDUE');
  const hasOverdueBooks = overdueBooks.length > 0;

  useEffect(() => {
    if (user?.id) {
      fetchBorrowHistory();
    }
  }, [user]);

  const fetchBorrowHistory = async () => {
    try {
      setLoading(true);
      setError('');

      if (!user?.id) {
        throw new Error('User ID not found. Please log in again.');
      }

      console.log('Fetching borrow history for user ID:', user.id);
      const history = await borrowService.getBorrowsByMember(user.id);
      console.log('Borrow history received:', history);
      setBorrowHistory(history);
    } catch (err) {
      console.error('Error fetching borrow history:', err);
      
      let errorMessage = 'Failed to load borrow history';
      if (err.message.includes('Member ID not found')) {
        errorMessage = 'Member ID not found. Please log in again.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data && typeof err.response.data === 'string') {
        errorMessage = err.response.data;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

const handleRenewBook = async (borrowId) => {
      // ADD THIS CONFIRMATION DIALOG:
      const borrowItem = borrowHistory.find(b => b.borrowId === borrowId)
      const confirmRenew = window.confirm(
      `Are you sure you want to renew "${borrowItem?.bookTitle || 'this book'}"?\n\n` +
      `This will extend your due date by another 21 days.`
  )

  if (!confirmRenew) {
    return
  }
  
  
  try {
      await borrowService.renewBook(borrowId);
      await fetchBorrowHistory(); // Refresh the list
      alert('Book renewed successfully!');
    } catch (err) {
      console.error('Renew book error:', err); // For debugging
      
      let errorMessage = 'Failed to renew book';
      
      // Check different error response formats
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          // Backend sends plain string (like "Book renewal failed: Already renewed...")
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          // Backend sends JSON with message property
          errorMessage = err.response.data.message;
        } else if (err.response.data.error) {
          // Backend sends JSON with error property
          errorMessage = err.response.data.error;
        }
      } else if (err.message) {
        // Network or other errors
        errorMessage = err.message;
      }
      
      // Extract just the meaningful part of the error message
      if (errorMessage.includes('Book renewal failed:')) {
        errorMessage = errorMessage.replace('Book renewal failed: ', '');
      }
      
      alert(errorMessage);
    }
  };

  const filteredAndSortedHistory = borrowHistory
    .filter(borrow => {
      switch (filter) {
        case 'ACTIVE':
          return borrow.status === 'ACTIVE';
        case 'RETURNED':
          return borrow.status === 'RETURNED';
        case 'OVERDUE':
          return borrow.status === 'OVERDUE';
        default:
          return true;
      }
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'borrowDate':
          aValue = new Date(a.borrowDate);
          bValue = new Date(b.borrowDate);
          break;
        case 'dueDate':
          aValue = new Date(a.dueDate);
          bValue = new Date(b.dueDate);
          break;
        case 'returnDate':
          aValue = a.returnDate ? new Date(a.returnDate) : new Date(0);
          bValue = b.returnDate ? new Date(b.returnDate) : new Date(0);
          break;
        default:
          aValue = a[sortBy];
          bValue = b[sortBy];
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'status-badge status-active';
      case 'RETURNED':
        return 'status-badge status-returned';
      case 'OVERDUE':
        return 'status-badge status-overdue';
      default:
        return 'status-badge';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    return new Date(dateTimeString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDaysOverdue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (loading) {
    return (
      <div className="borrow-history">
        <div className="loading">Loading borrow history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="borrow-history">
        <div className="error-message" style={{
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          color: '#721c24',
          padding: '20px',
          borderRadius: '4px',
          textAlign: 'center',
          margin: '20px'
        }}>
          {error}
        </div>
        <div style={{ textAlign: 'center' }}>
          <button onClick={fetchBorrowHistory} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="borrow-history">
      <div className="page-header">
        <h1>My Borrowing History</h1>
        <p>Track all your borrowed books and their status</p>
      </div>

      {/* NEW: OVERDUE PREVENTION NOTICE */}
      {hasOverdueBooks && (
        <div className="overdue-prevention-notice">
          <div className="overdue-header">
            <span className="warning-icon">⚠️</span>
            <h3 className="overdue-title">
              Borrowing Restricted - Overdue Books Detected
            </h3>
          </div>
          <p className="overdue-summary">
            You currently have <strong>{overdueBooks.length}</strong> overdue book{overdueBooks.length > 1 ? 's' : ''}.
          </p>
          <p className="overdue-restriction">
            <strong>You cannot borrow new books until all overdue items are returned.</strong>
          </p>
          <div className="overdue-books-section">
            <strong>Overdue Books:</strong>
            <ul className="overdue-books-list">
              {overdueBooks.map(book => (
                <li key={book.borrowId} className="overdue-book-item">
                  <strong>{book.bookTitle}</strong> - 
                  Due: {formatDate(book.dueDate)} 
                  ({calculateDaysOverdue(book.dueDate)} days overdue)
                </li>
              ))}
            </ul>
          </div>
          <div className="next-steps-section">
            <strong>📍 Next Steps:</strong>
            <ol className="next-steps-list">
              <li>Return all overdue books to their respective libraries</li>
              <li>Pay any applicable fines</li>
              <li>Once returned, you can resume borrowing new books</li>
            </ol>
          </div>
        </div>
      )}


      {/* Controls */}
      <div className="history-controls">
        <div className="filter-section">
          <label htmlFor="filter">Filter by Status:</label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="form-select"
          >
            <option value="ALL">All Books</option>
            <option value="ACTIVE">Currently Borrowed</option>
            <option value="RETURNED">Returned Books</option>
            <option value="OVERDUE">
                Overdue Books {hasOverdueBooks ? `(${overdueBooks.length})` : ''}
            </option>
          </select>
        </div>

        <div className="sort-section">
          <label htmlFor="sortBy">Sort by:</label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="form-select"
          >
            <option value="borrowDate">Borrow Date</option>
            <option value="dueDate">Due Date</option>
            <option value="returnDate">Return Date</option>
            <option value="bookTitle">Book Title</option>
          </select>
          
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="form-select"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>

        <div className="refresh-section">
          <button
            onClick={fetchBorrowHistory}
            className="btn btn-outline-primary"
            disabled={loading}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="history-stats">
        <div className="stat-card">
          <div className="stat-number">{borrowHistory.length}</div>
          <div className="stat-label">Total Books Borrowed</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {borrowHistory.filter(b => b.status === 'ACTIVE').length}
          </div>
          <div className="stat-label">Currently Borrowed</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {borrowHistory.filter(b => b.status === 'RETURNED').length}
          </div>
          <div className="stat-label">Books Returned</div>
        </div>
  
        <div className={`stat-card ${hasOverdueBooks ? 'stat-card-warning' : ''}`}>
          <div className="stat-number" style={{
            color: hasOverdueBooks ? '#dc3545' : 'inherit'
          }}>
            {overdueBooks.length}
          </div>
          <div className="stat-label">Overdue Books</div>
        </div>
      </div>

      {/* History List */}
      {filteredAndSortedHistory.length === 0 ? (
        <div className="no-history">
          <div className="no-history-icon">📚</div>
          <h3>No borrowing history found</h3>
          <p>
            {filter === 'ALL' 
              ? "You haven't borrowed any books yet."
              : `No books found with status: ${filter.toLowerCase()}`
            }
          </p>
        </div>
      ) : (
        <div className="history-list">
          {filteredAndSortedHistory.map((borrow) => (
            <div key={borrow.borrowId} className="history-item">
              <div className="book-info">
                <h3 className="book-title">{borrow.bookTitle}</h3>
                <p className="library-name">
                  <i className="fas fa-map-marker-alt"></i>
                  {borrow.libraryName}
                </p>
              </div>

              <div className="borrow-details">
                <div className="detail-row">
                  <span className="label">Borrowed:</span>
                  <span className="value">{formatDate(borrow.borrowDate)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Due Date:</span>
                  <span className="value">{formatDate(borrow.dueDate)}</span>
                </div>
                {borrow.returnDate && (
                  <div className="detail-row">
                    <span className="label">Returned:</span>
                    <span className="value">{formatDateTime(borrow.returnDate)}</span>
                  </div>
                )}
                {borrow.fine && parseFloat(borrow.fine) > 0 && (
                  <div className="detail-row">
                    <span className="label">Fine:</span>
                    <span className="value fine-amount">${borrow.fine}</span>
                  </div>
                )}
              </div>

              <div className="status-section">
                <span className={getStatusBadgeClass(borrow.status)}>
                  {borrow.status}
                </span>
                
                {borrow.status === 'OVERDUE' && (
                  <div className="overdue-info">
                    {calculateDaysOverdue(borrow.dueDate)} days overdue
                  </div>
                )}
              </div>

              <div className="actions">
                {borrow.status === 'ACTIVE' && (
                  <button
                    onClick={() => handleRenewBook(borrow.borrowId)}
                    className="btn btn-sm btn-outline-primary"
                    disabled={loading}
                  >
                    Renew Book
                  </button>
                )}
                
                {borrow.status === 'OVERDUE' && (
                  <div className="overdue-warning">
                    <i className="fas fa-exclamation-triangle"></i>
                    Please return immediately
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BorrowHistory;