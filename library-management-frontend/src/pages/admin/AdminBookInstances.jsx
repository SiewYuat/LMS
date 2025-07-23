import React, { useState, useEffect } from 'react';
import bookInstanceService from '../../services/bookInstanceService';
import bookService from '../../services/bookService';
import libraryService from '../../services/libraryService';
import { useAuth } from '../../contexts/AuthContext';
import './AdminBookInstances.css';

const AdminBookInstances = () => {
  const [bookInstances, setBookInstances] = useState([]);
  const [books, setBooks] = useState([]);
  const [libraries, setLibraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [libraryFilter, setLibraryFilter] = useState('');
  
  // Forms
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState(null);
  const [selectedInstances, setSelectedInstances] = useState([]);
  
  const [instanceForm, setInstanceForm] = useState({
    bookId: '',
    libraryId: '',
    bkStatus: 'AVAILABLE',
    bkCondition: 'NEW',
    acquisitionDate: new Date().toISOString().split('T')[0]
  });

  const [transferForm, setTransferForm] = useState({
    targetLibraryId: '',
    reason: ''
  });

  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [instancesData, booksData, librariesData] = await Promise.all([
        bookInstanceService.getAllBookInstances(),
        bookService.getAllBooks(),
        libraryService.getAllLibraries()
      ]);
      setBookInstances(instancesData);
      setBooks(booksData);
      setLibraries(librariesData);
    } catch (err) {
      setError('Failed to load data: ' + err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInstance = async (e) => {
    e.preventDefault();
    try {
      await bookInstanceService.createBookInstance(instanceForm);
      await fetchData();
      setShowAddForm(false);
      resetForm();
      alert('Book instance added successfully!');
    } catch (err) {
      alert('Failed to add book instance: ' + err.message);
    }
  };

  const handleEditInstance = async (e) => {
    e.preventDefault();
    try {
      await bookInstanceService.updateBookInstance(selectedInstance.bkInstanceId, instanceForm);
      await fetchData();
      setShowEditForm(false);
      setSelectedInstance(null);
      resetForm();
      alert('Book instance updated successfully!');
    } catch (err) {
      alert('Failed to update book instance: ' + err.message);
    }
  };

  const handleDeleteInstance = async (instanceId) => {
    if (window.confirm('Are you sure you want to delete this book instance?')) {
      try {
        await bookInstanceService.deleteBookInstance(instanceId);
        await fetchData();
        alert('Book instance deleted successfully!');
      } catch (err) {
        alert('Failed to delete book instance: ' + err.message);
      }
    }
  };

  const handleTransferInstances = async (e) => {
    e.preventDefault();
    try {
      if (selectedInstances.length === 1) {
        await bookInstanceService.transferBookToLibrary(
          selectedInstances[0], 
          transferForm.targetLibraryId
        );
      } else {
        await bookInstanceService.transferMultipleBooksToLibrary(
          selectedInstances, 
          transferForm.targetLibraryId
        );
      }
      await fetchData();
      setShowTransferForm(false);
      setSelectedInstances([]);
      setTransferForm({ targetLibraryId: '', reason: '' });
      alert(`${selectedInstances.length} book instance(s) transferred successfully!`);
    } catch (err) {
      alert('Failed to transfer book instances: ' + err.message);
    }
  };

  const openEditForm = (instance) => {
    setSelectedInstance(instance);
    setInstanceForm({
      bookId: instance.bookId,
      libraryId: instance.libraryId,
      bkStatus: instance.bkStatus,
      bkCondition: instance.bkCondition,
      acquisitionDate: instance.acquisitionDate || new Date().toISOString().split('T')[0]
    });
    setShowEditForm(true);
  };

  const openTransferForm = () => {
    if (selectedInstances.length === 0) {
      alert('Please select at least one book instance to transfer.');
      return;
    }
    setShowTransferForm(true);
  };

  const resetForm = () => {
    setInstanceForm({
      bookId: '',
      libraryId: '',
      bkStatus: 'AVAILABLE',
      bkCondition: 'NEW',
      acquisitionDate: new Date().toISOString().split('T')[0]
    });
  };

  const toggleInstanceSelection = (instanceId) => {
    setSelectedInstances(prev => 
      prev.includes(instanceId)
        ? prev.filter(id => id !== instanceId)
        : [...prev, instanceId]
    );
  };

  const toggleSelectAll = () => {
    const visibleInstanceIds = filteredAndSortedInstances.map(instance => instance.bkInstanceId);
    if (selectedInstances.length === visibleInstanceIds.length) {
      setSelectedInstances([]);
    } else {
      setSelectedInstances(visibleInstanceIds);
    }
  };

  // Filter and search logic
  const filteredAndSortedInstances = bookInstances.filter(instance => {
    const matchesSearch = instance.bookTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         instance.libraryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         instance.bkInstanceId?.toString().includes(searchTerm);
    const matchesStatus = !statusFilter || instance.bkStatus === statusFilter;
    const matchesCondition = !conditionFilter || instance.bkCondition === conditionFilter;
    const matchesLibrary = !libraryFilter || instance.libraryId?.toString() === libraryFilter;
    
    return matchesSearch && matchesStatus && matchesCondition && matchesLibrary;
  });

  const getBook = (bookId) => books.find(book => book.bookId === bookId);
  const getLibrary = (libraryId) => libraries.find(library => library.libraryId === libraryId);

  if (loading) {
    return (
      <div className="admin-book-instances">
        <div className="loading">Loading book instances...</div>
      </div>
    );
  }

  return (
    <div className="admin-book-instances">
      <div className="page-header">
        <h1>Book Instance Management</h1>
        <div className="header-actions">
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary"
          >
            <i className="fas fa-plus"></i>
            Add Book Instance
          </button>
          <button
            onClick={openTransferForm}
            className="btn btn-outline-primary"
            disabled={selectedInstances.length === 0}
          >
            <i className="fas fa-exchange-alt"></i>
            Transfer Selected ({selectedInstances.length})
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={fetchData} className="btn btn-sm btn-outline-primary">
            Retry
          </button>
        </div>
      )}

      {/* Filters and Search */}
      <div className="instances-controls">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search by book title, library, or instance ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input search-input"
          />
        </div>

        <div className="filter-section">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select"
          >
            <option value="">All Statuses</option>
            {bookInstanceService.getBookStatuses().map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
            className="form-select"
          >
            <option value="">All Conditions</option>
            {bookInstanceService.getBookConditions().map(condition => (
              <option key={condition} value={condition}>{condition}</option>
            ))}
          </select>

          <select
            value={libraryFilter}
            onChange={(e) => setLibraryFilter(e.target.value)}
            className="form-select"
          >
            <option value="">All Libraries</option>
            {libraries.map(library => (
              <option key={library.libraryId} value={library.libraryId}>
                {library.libraryName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Statistics */}
      <div className="instances-stats">
        <div className="stat-item">
          <span className="stat-number">{bookInstances.length}</span>
          <span className="stat-label">Total Instances</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{filteredAndSortedInstances.length}</span>
          <span className="stat-label">Filtered Results</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{selectedInstances.length}</span>
          <span className="stat-label">Selected</span>
        </div>
      </div>

      {/* Book Instances Table */}
      <div className="instances-table-container">
        <table className="instances-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedInstances.length === filteredAndSortedInstances.length && filteredAndSortedInstances.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th>Instance ID</th>
              <th>Book Title</th>
              <th>Library</th>
              <th>Status</th>
              <th>Condition</th>
              <th>Acquisition Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedInstances.map((instance) => (
              <tr key={instance.bkInstanceId}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedInstances.includes(instance.bkInstanceId)}
                    onChange={() => toggleInstanceSelection(instance.bkInstanceId)}
                  />
                </td>
                <td>#{instance.bkInstanceId}</td>
                <td>{instance.bookTitle || 'Unknown Book'}</td>
                <td>{instance.libraryName || 'Unknown Library'}</td>
                <td>
                  <span className={`status-badge status-${instance.bkStatus?.toLowerCase()}`}>
                    {instance.bkStatus}
                  </span>
                </td>
                <td>
                  <span className={`condition-badge condition-${instance.bkCondition?.toLowerCase()}`}>
                    {instance.bkCondition}
                  </span>
                </td>
                <td>{instance.acquisitionDate || 'N/A'}</td>
                <td>
                  <div className="table-actions">
                    <button
                      onClick={() => openEditForm(instance)}
                      className="btn btn-sm btn-outline-primary"
                      title="Edit instance"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      onClick={() => handleDeleteInstance(instance.bkInstanceId)}
                      className="btn btn-sm btn-outline-danger"
                      title="Delete instance"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredAndSortedInstances.length === 0 && (
          <div className="no-instances">
            <div className="no-instances-icon">📚</div>
            <h3>No book instances found</h3>
            <p>
              {searchTerm || statusFilter || conditionFilter || libraryFilter
                ? 'Try adjusting your search criteria.'
                : 'Start by adding book instances to the library.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Add Instance Modal */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Book Instance</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="btn btn-sm btn-outline-secondary"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleAddInstance} className="instance-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="bookId">Book *</label>
                  <select
                    id="bookId"
                    value={instanceForm.bookId}
                    onChange={(e) => setInstanceForm({...instanceForm, bookId: e.target.value})}
                    className="form-select"
                    required
                  >
                    <option value="">Select a book</option>
                    {books.map(book => (
                      <option key={book.bookId} value={book.bookId}>
                        {book.title} - {book.author}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="libraryId">Library *</label>
                  <select
                    id="libraryId"
                    value={instanceForm.libraryId}
                    onChange={(e) => setInstanceForm({...instanceForm, libraryId: e.target.value})}
                    className="form-select"
                    required
                  >
                    <option value="">Select a library</option>
                    {libraries.map(library => (
                      <option key={library.libraryId} value={library.libraryId}>
                        {library.libraryName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="bkStatus">Status</label>
                  <select
                    id="bkStatus"
                    value={instanceForm.bkStatus}
                    onChange={(e) => setInstanceForm({...instanceForm, bkStatus: e.target.value})}
                    className="form-select"
                  >
                    {bookInstanceService.getBookStatuses().map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="bkCondition">Condition</label>
                  <select
                    id="bkCondition"
                    value={instanceForm.bkCondition}
                    onChange={(e) => setInstanceForm({...instanceForm, bkCondition: e.target.value})}
                    className="form-select"
                  >
                    {bookInstanceService.getBookConditions().map(condition => (
                      <option key={condition} value={condition}>{condition}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="acquisitionDate">Acquisition Date</label>
                  <input
                    type="date"
                    id="acquisitionDate"
                    value={instanceForm.acquisitionDate}
                    onChange={(e) => setInstanceForm({...instanceForm, acquisitionDate: e.target.value})}
                    className="form-input"
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
                  Add Instance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Instance Modal */}
      {showEditForm && selectedInstance && (
        <div className="modal-overlay" onClick={() => setShowEditForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Book Instance #{selectedInstance.bkInstanceId}</h2>
              <button
                onClick={() => setShowEditForm(false)}
                className="btn btn-sm btn-outline-secondary"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleEditInstance} className="instance-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="edit-bookId">Book *</label>
                  <select
                    id="edit-bookId"
                    value={instanceForm.bookId}
                    onChange={(e) => setInstanceForm({...instanceForm, bookId: e.target.value})}
                    className="form-select"
                    required
                  >
                    <option value="">Select a book</option>
                    {books.map(book => (
                      <option key={book.bookId} value={book.bookId}>
                        {book.title} - {book.author}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="edit-libraryId">Library *</label>
                  <select
                    id="edit-libraryId"
                    value={instanceForm.libraryId}
                    onChange={(e) => setInstanceForm({...instanceForm, libraryId: e.target.value})}
                    className="form-select"
                    required
                  >
                    <option value="">Select a library</option>
                    {libraries.map(library => (
                      <option key={library.libraryId} value={library.libraryId}>
                        {library.libraryName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="edit-bkStatus">Status</label>
                  <select
                    id="edit-bkStatus"
                    value={instanceForm.bkStatus}
                    onChange={(e) => setInstanceForm({...instanceForm, bkStatus: e.target.value})}
                    className="form-select"
                  >
                    {bookInstanceService.getBookStatuses().map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="edit-bkCondition">Condition</label>
                  <select
                    id="edit-bkCondition"
                    value={instanceForm.bkCondition}
                    onChange={(e) => setInstanceForm({...instanceForm, bkCondition: e.target.value})}
                    className="form-select"
                  >
                    {bookInstanceService.getBookConditions().map(condition => (
                      <option key={condition} value={condition}>{condition}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="edit-acquisitionDate">Acquisition Date</label>
                  <input
                    type="date"
                    id="edit-acquisitionDate"
                    value={instanceForm.acquisitionDate}
                    onChange={(e) => setInstanceForm({...instanceForm, acquisitionDate: e.target.value})}
                    className="form-input"
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
                  Update Instance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferForm && (
        <div className="modal-overlay" onClick={() => setShowTransferForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Transfer Book Instances</h2>
              <button
                onClick={() => setShowTransferForm(false)}
                className="btn btn-sm btn-outline-secondary"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleTransferInstances} className="transfer-form">
              <div className="form-group">
                <label>Selected Instances ({selectedInstances.length})</label>
                <div className="selected-instances">
                  {selectedInstances.map(instanceId => {
                    const instance = bookInstances.find(bi => bi.bkInstanceId === instanceId);
                    return (
                      <div key={instanceId} className="selected-instance">
                        #{instanceId} - {instance?.bookTitle || 'Unknown'} ({instance?.libraryName || 'Unknown'})
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="targetLibraryId">Target Library *</label>
                <select
                  id="targetLibraryId"
                  value={transferForm.targetLibraryId}
                  onChange={(e) => setTransferForm({...transferForm, targetLibraryId: e.target.value})}
                  className="form-select"
                  required
                >
                  <option value="">Select target library</option>
                  {libraries.map(library => (
                    <option key={library.libraryId} value={library.libraryId}>
                      {library.libraryName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="reason">Transfer Reason (Optional)</label>
                <textarea
                  id="reason"
                  value={transferForm.reason}
                  onChange={(e) => setTransferForm({...transferForm, reason: e.target.value})}
                  className="form-input"
                  rows="3"
                  placeholder="e.g., High demand at target location, redistribution, etc."
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowTransferForm(false)}
                  className="btn btn-outline-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Transfer {selectedInstances.length} Instance(s)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookInstances;