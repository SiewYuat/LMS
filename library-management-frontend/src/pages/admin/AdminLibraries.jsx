import React, { useState, useEffect } from 'react';
import libraryService from '../../services/libraryService';
import { useAuth } from '../../contexts/AuthContext';
import './AdminLibraries.css';

const AdminLibraries = () => {
  const [libraries, setLibraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('libraryName');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedLibrary, setSelectedLibrary] = useState(null);
  const [libraryForm, setLibraryForm] = useState({
    libraryName: '',
    lbAddress: '',
    lbPhone: '',
    lbOperatingHour: ''
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchLibraries();
  }, []);

  const fetchLibraries = async () => {
    try {
      setLoading(true);
      setError('');
      const librariesData = await libraryService.getAllLibraries();
      setLibraries(librariesData);
    } catch (err) {
      setError('Failed to load libraries: ' + err.message);
      console.error('Error fetching libraries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLibrary = async (e) => {
    e.preventDefault();
    try {
      await libraryService.createLibrary(libraryForm);
      await fetchLibraries();
      setShowAddForm(false);
      resetForm();
      alert('Library added successfully!');
    } catch (err) {
      alert('Failed to add library: ' + err.message);
    }
  };

  const handleEditLibrary = async (e) => {
    e.preventDefault();
    try {
      await libraryService.updateLibrary(selectedLibrary.libraryId, libraryForm);
      await fetchLibraries();
      setShowEditForm(false);
      setSelectedLibrary(null);
      resetForm();
      alert('Library updated successfully!');
    } catch (err) {
      alert('Failed to update library: ' + err.message);
    }
  };

  const handleDeleteLibrary = async (libraryId) => {
    if (window.confirm('Are you sure you want to delete this library? This action cannot be undone.')) {
      try {
        await libraryService.deleteLibrary(libraryId);
        await fetchLibraries();
        alert('Library deleted successfully!');
      } catch (err) {
        alert('Failed to delete library: ' + err.message);
      }
    }
  };

  const openEditForm = (library) => {
    setSelectedLibrary(library);
    setLibraryForm({
      libraryName: library.libraryName,
      lbAddress: library.lbAddress,
      lbPhone: library.lbPhone,
      lbOperatingHour: library.lbOperatingHour
    });
    setShowEditForm(true);
  };

  const resetForm = () => {
    setLibraryForm({
      libraryName: '',
      lbAddress: '',
      lbPhone: '',
      lbOperatingHour: ''
    });
  };

  const filteredAndSortedLibraries = libraries
    .filter(library => {
      return library.libraryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             library.lbAddress.toLowerCase().includes(searchTerm.toLowerCase());
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

  const getTotalBooks = () => {
    return libraries.reduce((total, library) => total + (library.totalBooks || 0), 0);
  };

  const getTotalAvailableBooks = () => {
    return libraries.reduce((total, library) => total + (library.availableBooks || 0), 0);
  };

  if (loading) {
    return (
      <div className="admin-libraries">
        <div className="loading">Loading libraries...</div>
      </div>
    );
  }

  return (
    <div className="admin-libraries">
      <div className="page-header">
        <h1>Library Management</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn btn-primary"
        >
          <i className="fas fa-plus"></i>
          Add New Library
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={fetchLibraries} className="btn btn-sm btn-outline-primary">
            Retry
          </button>
        </div>
      )}

      {/* Library Statistics */}
      <div className="libraries-stats">
        <div className="stat-card">
          <div className="stat-icon">🏢</div>
          <div className="stat-info">
            <div className="stat-number">{libraries.length}</div>
            <div className="stat-label">Total Libraries</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <div className="stat-number">{getTotalBooks()}</div>
            <div className="stat-label">Total Books</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-number">{getTotalAvailableBooks()}</div>
            <div className="stat-label">Available Books</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📖</div>
          <div className="stat-info">
            <div className="stat-number">{getTotalBooks() - getTotalAvailableBooks()}</div>
            <div className="stat-label">Books in Use</div>
          </div>
        </div>
      </div>

      {/* Search and Sort Controls */}
      <div className="libraries-controls">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search by library name or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input search-input"
          />
        </div>

        <div className="sort-section">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="form-select"
          >
            <option value="libraryName">Sort by Name</option>
            <option value="lbAddress">Sort by Address</option>
            <option value="totalBooks">Sort by Total Books</option>
            <option value="availableBooks">Sort by Available Books</option>
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

        <button
          onClick={fetchLibraries}
          className="btn btn-outline-primary"
          disabled={loading}
        >
          <i className="fas fa-refresh"></i>
          Refresh
        </button>
      </div>

      {/* Libraries List */}
      {filteredAndSortedLibraries.length === 0 ? (
        <div className="no-libraries">
          <div className="no-libraries-icon">🏢</div>
          <h3>No libraries found</h3>
          <p>
            {searchTerm
              ? 'Try adjusting your search criteria.'
              : 'Start by adding your first library location.'
            }
          </p>
        </div>
      ) : (
        <div className="libraries-grid">
          {filteredAndSortedLibraries.map((library) => (
            <div key={library.libraryId} className="library-card">
              <div className="library-header">
                <h3 className="library-name">{library.libraryName}</h3>
                <div className="library-actions">
                  <button
                    onClick={() => openEditForm(library)}
                    className="btn btn-sm btn-outline-primary"
                    title="Edit library"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    onClick={() => handleDeleteLibrary(library.libraryId)}
                    className="btn btn-sm btn-outline-danger"
                    title="Delete library"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>

              <div className="library-details">
                <div className="detail-row">
                  <span className="label">
                    <i className="fas fa-map-marker-alt"></i>
                    Address:
                  </span>
                  <span className="value">{library.lbAddress}</span>
                </div>
                <div className="detail-row">
                  <span className="label">
                    <i className="fas fa-phone"></i>
                    Phone:
                  </span>
                  <span className="value">{library.lbPhone}</span>
                </div>
                <div className="detail-row">
                  <span className="label">
                    <i className="fas fa-clock"></i>
                    Hours:
                  </span>
                  <span className="value">{library.lbOperatingHour}</span>
                </div>
                <div className="detail-row">
                  <span className="label">
                    <i className="fas fa-hashtag"></i>
                    Library ID:
                  </span>
                  <span className="value">#{library.libraryId}</span>
                </div>
              </div>

              <div className="library-stats">
                <div className="stat">
                  <span className="stat-value">{library.totalBooks || 0}</span>
                  <span className="stat-label">Total Books</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{library.availableBooks || 0}</span>
                  <span className="stat-label">Available</span>
                </div>
                <div className="stat">
                  <span className="stat-value">
                    {((library.availableBooks || 0) / (library.totalBooks || 1) * 100).toFixed(0)}%
                  </span>
                  <span className="stat-label">Availability</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Library Modal */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Library</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="btn btn-sm btn-outline-secondary"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleAddLibrary} className="library-form">
              <div className="form-group">
                <label htmlFor="libraryName">Library Name *</label>
                <input
                  type="text"
                  id="libraryName"
                  value={libraryForm.libraryName}
                  onChange={(e) => setLibraryForm({...libraryForm, libraryName: e.target.value})}
                  className="form-input"
                  required
                  placeholder="e.g., Central Library"
                />
              </div>
              <div className="form-group">
                <label htmlFor="lbAddress">Address *</label>
                <textarea
                  id="lbAddress"
                  value={libraryForm.lbAddress}
                  onChange={(e) => setLibraryForm({...libraryForm, lbAddress: e.target.value})}
                  className="form-textarea"
                  required
                  placeholder="Enter complete address"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label htmlFor="lbPhone">Phone Number</label>
                <input
                  type="tel"
                  id="lbPhone"
                  value={libraryForm.lbPhone}
                  onChange={(e) => setLibraryForm({...libraryForm, lbPhone: e.target.value})}
                  className="form-input"
                  placeholder="e.g., (555) 123-4567"
                />
              </div>
              <div className="form-group">
                <label htmlFor="lbOperatingHour">Operating Hours</label>
                <input
                  type="text"
                  id="lbOperatingHour"
                  value={libraryForm.lbOperatingHour}
                  onChange={(e) => setLibraryForm({...libraryForm, lbOperatingHour: e.target.value})}
                  className="form-input"
                  placeholder="e.g., Mon-Fri: 9AM-8PM, Sat-Sun: 10AM-6PM"
                />
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
                  Add Library
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Library Modal */}
      {showEditForm && selectedLibrary && (
        <div className="modal-overlay" onClick={() => setShowEditForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Library</h2>
              <button
                onClick={() => setShowEditForm(false)}
                className="btn btn-sm btn-outline-secondary"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleEditLibrary} className="library-form">
              <div className="form-group">
                <label htmlFor="edit-libraryName">Library Name *</label>
                <input
                  type="text"
                  id="edit-libraryName"
                  value={libraryForm.libraryName}
                  onChange={(e) => setLibraryForm({...libraryForm, libraryName: e.target.value})}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-lbAddress">Address *</label>
                <textarea
                  id="edit-lbAddress"
                  value={libraryForm.lbAddress}
                  onChange={(e) => setLibraryForm({...libraryForm, lbAddress: e.target.value})}
                  className="form-textarea"
                  required
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-lbPhone">Phone Number</label>
                <input
                  type="tel"
                  id="edit-lbPhone"
                  value={libraryForm.lbPhone}
                  onChange={(e) => setLibraryForm({...libraryForm, lbPhone: e.target.value})}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-lbOperatingHour">Operating Hours</label>
                <input
                  type="text"
                  id="edit-lbOperatingHour"
                  value={libraryForm.lbOperatingHour}
                  onChange={(e) => setLibraryForm({...libraryForm, lbOperatingHour: e.target.value})}
                  className="form-input"
                />
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
                  Update Library
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLibraries;