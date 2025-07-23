import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import adminService from '../../services/adminService'
import FormModal from '../../components/FormModal'
import './AdminAdministrators.css'

const AdminAdministrators = () => {
  const { user } = useAuth()
  const [administrators, setAdministrators] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredAdmins, setFilteredAdmins] = useState([])

  // Create Admin Modal States
  const [showCreateAdmin, setShowCreateAdmin] = useState(false)
  const [createAdminData, setCreateAdminData] = useState({
    firstName: '',
    lastName: '',
    userName: '',
    email: '',
    temporaryPassword: ''
  })
  const [createLoading, setCreateLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})

  // Admin Details Modal States
  const [showAdminDetails, setShowAdminDetails] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState(null)

  // Statistics States
  const [stats, setStats] = useState({
    totalAdmins: 0,
    activeAdmins: 0,
    recentAdmins: 0
  })

  // Load administrators
  useEffect(() => {
    loadAdministrators()
  }, [])

  // Filter administrators based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredAdmins(administrators)
    } else {
      const filtered = administrators.filter(admin =>
        admin.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admin.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admin.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admin.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredAdmins(filtered)
    }
  }, [administrators, searchQuery])

  const loadAdministrators = async () => {
    try {
      setLoading(true)
      const [adminList, adminStats] = await Promise.all([
        adminService.getAllAdmins(),
        adminService.getAdminStats().catch(() => ({ totalAdmins: 0, activeAdmins: 0, recentAdmins: 0 }))
      ])
      
      setAdministrators(adminList)
      setStats({
        totalAdmins: adminList.length,
        activeAdmins: adminList.length, // Assuming all fetched admins are active
        recentAdmins: adminList.filter(admin => {
          // Count admins created in last 30 days (if we had createdDate)
          return true // For now, we'll just show total
        }).length
      })
      setError(null)
    } catch (err) {
      console.error('Error loading administrators:', err)
      setError('Failed to load administrators')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAdmin = async () => {
    try {
      // Reset validation errors
      setValidationErrors({})

      // Validate form
      const errors = {}
      if (!createAdminData.firstName.trim()) errors.firstName = 'First name is required'
      if (!createAdminData.lastName.trim()) errors.lastName = 'Last name is required'
      if (!createAdminData.userName.trim()) errors.userName = 'Username is required'
      if (!createAdminData.email.trim()) errors.email = 'Email is required'
      if (!createAdminData.temporaryPassword.trim()) errors.temporaryPassword = 'Temporary password is required'
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (createAdminData.email && !emailRegex.test(createAdminData.email)) {
        errors.email = 'Please enter a valid email address'
      }

      // Password validation
      if (createAdminData.temporaryPassword && createAdminData.temporaryPassword.length < 8) {
        errors.temporaryPassword = 'Password must be at least 8 characters long'
      }

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors)
        return
      }

      setCreateLoading(true)

      // Prepare admin data (excluding password)
      const adminDTO = {
        firstName: createAdminData.firstName.trim(),
        lastName: createAdminData.lastName.trim(),
        userName: createAdminData.userName.trim(),
        email: createAdminData.email.trim()
      }

      // Create the administrator
      await adminService.createAdmin(adminDTO, createAdminData.temporaryPassword)

      // Success feedback
      alert('Administrator created successfully!')

      // Reset form and close modal
      setCreateAdminData({
        firstName: '',
        lastName: '',
        userName: '',
        email: '',
        temporaryPassword: ''
      })
      setShowCreateAdmin(false)

      // Reload administrators list
      loadAdministrators()

    } catch (err) {
      console.error('Error creating administrator:', err)
      
      // Handle specific errors
      if (err.response?.status === 400) {
        const errorMessage = err.response.data
        if (errorMessage.includes('Username already exists')) {
          setValidationErrors({ userName: 'Username already exists' })
        } else if (errorMessage.includes('Email already exists')) {
          setValidationErrors({ email: 'Email already exists' })
        } else {
          alert('Error creating administrator: ' + errorMessage)
        }
      } else {
        alert('Failed to create administrator. Please try again.')
      }
    } finally {
      setCreateLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setCreateAdminData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleViewAdmin = (admin) => {
    setSelectedAdmin(admin)
    setShowAdminDetails(true)
  }

  const handleDeleteAdmin = async (adminId) => {
    if (!window.confirm('Are you sure you want to delete this administrator?')) {
      return
    }

    try {
      await adminService.deleteAdmin(adminId)
      alert('Administrator deleted successfully!')
      loadAdministrators()
    } catch (err) {
      console.error('Error deleting administrator:', err)
      alert('Failed to delete administrator. Please try again.')
    }
  }

  const handleResetPassword = async (adminId) => {
    const newPassword = prompt('Enter new temporary password (minimum 8 characters):')
    if (!newPassword || newPassword.length < 8) {
      alert('Password must be at least 8 characters long')
      return
    }

    try {
      await adminService.resetPassword(adminId, newPassword)
      alert('Password reset successfully!')
    } catch (err) {
      console.error('Error resetting password:', err)
      alert('Failed to reset password. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="admin-administrators">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading administrators...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-administrators">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={loadAdministrators} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-administrators">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Administrator Management</h1>
            <p>Manage system administrators and their accounts</p>
          </div>
          <button 
            onClick={() => setShowCreateAdmin(true)} 
            className="btn btn-primary"
          >
            <i className="fas fa-plus"></i>
            Create New Admin
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="admin-stats">
        <div className="stat-card stat-total">
          <div className="stat-content">
            <div className="stat-number">{stats.totalAdmins}</div>
            <div className="stat-label">Total Administrators</div>
          </div>
          <div className="stat-icon">
            <i className="fas fa-users-cog"></i>
          </div>
        </div>
        <div className="stat-card stat-active">
          <div className="stat-content">
            <div className="stat-number">{stats.activeAdmins}</div>
            <div className="stat-label">Active Administrators</div>
          </div>
          <div className="stat-icon">
            <i className="fas fa-user-check"></i>
          </div>
        </div>
        <div className="stat-card stat-recent">
          <div className="stat-content">
            <div className="stat-number">{stats.recentAdmins}</div>
            <div className="stat-label">Recently Added</div>
          </div>
          <div className="stat-icon">
            <i className="fas fa-user-plus"></i>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="admin-controls">
        <div className="search-section">
          <div className="search-input-container">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              placeholder="Search administrators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      {/* Administrators List */}
      <div className="admin-list-container">
        <div className="admin-list-header">
          <h2>Administrators ({filteredAdmins.length})</h2>
        </div>

        {filteredAdmins.length === 0 ? (
          <div className="no-admins">
            <i className="fas fa-users-slash"></i>
            <h3>No administrators found</h3>
            <p>
              {searchQuery ? 'Try adjusting your search criteria.' : 'No administrators have been created yet.'}
            </p>
          </div>
        ) : (
          <div className="admin-grid">
            {filteredAdmins.map((admin) => (
              <div key={admin.adminId} className="admin-card">
                <div className="admin-card-header">
                  <div className="admin-info">
                    <h3>{admin.firstName} {admin.lastName}</h3>
                    <p className="admin-username">@{admin.userName}</p>
                    <p className="admin-email">{admin.email}</p>
                  </div>
                  <div className="admin-avatar">
                    <i className="fas fa-user-shield"></i>
                  </div>
                </div>
                
                <div className="admin-card-actions">
                  <button
                    onClick={() => handleViewAdmin(admin)}
                    className="btn btn-outline btn-small"
                  >
                    <i className="fas fa-eye"></i>
                    View Details
                  </button>
                  <button
                    onClick={() => handleResetPassword(admin.adminId)}
                    className="btn btn-warning btn-small"
                  >
                    <i className="fas fa-key"></i>
                    Reset Password
                  </button>
                  {admin.adminId !== user?.id && (
                    <button
                      onClick={() => handleDeleteAdmin(admin.adminId)}
                      className="btn btn-danger btn-small"
                    >
                      <i className="fas fa-trash"></i>
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Admin Modal */}
      {showCreateAdmin && (
        <FormModal
          title="Create New Administrator"
          onClose={() => setShowCreateAdmin(false)}
          size="medium"
        >
          <form onSubmit={(e) => { e.preventDefault(); handleCreateAdmin(); }}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="firstName">First Name *</label>
                <input
                  type="text"
                  id="firstName"
                  value={createAdminData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={validationErrors.firstName ? 'error' : ''}
                  required
                />
                {validationErrors.firstName && (
                  <span className="error-message">{validationErrors.firstName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name *</label>
                <input
                  type="text"
                  id="lastName"
                  value={createAdminData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={validationErrors.lastName ? 'error' : ''}
                  required
                />
                {validationErrors.lastName && (
                  <span className="error-message">{validationErrors.lastName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="userName">Username *</label>
                <input
                  type="text"
                  id="userName"
                  value={createAdminData.userName}
                  onChange={(e) => handleInputChange('userName', e.target.value)}
                  className={validationErrors.userName ? 'error' : ''}
                  required
                />
                {validationErrors.userName && (
                  <span className="error-message">{validationErrors.userName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  value={createAdminData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={validationErrors.email ? 'error' : ''}
                  required
                />
                {validationErrors.email && (
                  <span className="error-message">{validationErrors.email}</span>
                )}
              </div>

              <div className="form-group full-width">
                <label htmlFor="temporaryPassword">Temporary Password *</label>
                <input
                  type="password"
                  id="temporaryPassword"
                  value={createAdminData.temporaryPassword}
                  onChange={(e) => handleInputChange('temporaryPassword', e.target.value)}
                  className={validationErrors.temporaryPassword ? 'error' : ''}
                  placeholder="Enter temporary password (min 8 characters)"
                  required
                />
                {validationErrors.temporaryPassword && (
                  <span className="error-message">{validationErrors.temporaryPassword}</span>
                )}
                <small className="form-help">
                  The new administrator will need to change this password on first login.
                </small>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                onClick={() => setShowCreateAdmin(false)}
                className="btn btn-outline"
                disabled={createLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={createLoading}
              >
                {createLoading ? (
                  <>
                    <div className="loading-spinner small"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus"></i>
                    Create Administrator
                  </>
                )}
              </button>
            </div>
          </form>
        </FormModal>
      )}

      {/* Admin Details Modal */}
      {showAdminDetails && selectedAdmin && (
        <FormModal
          title="Administrator Details"
          onClose={() => setShowAdminDetails(false)}
          size="medium"
        >
          <div className="admin-details">
            <div className="admin-details-header">
              <div className="admin-avatar large">
                <i className="fas fa-user-shield"></i>
              </div>
              <div className="admin-info">
                <h2>{selectedAdmin.firstName} {selectedAdmin.lastName}</h2>
                <p className="admin-username">@{selectedAdmin.userName}</p>
                <p className="admin-email">{selectedAdmin.email}</p>
              </div>
            </div>

            <div className="admin-details-content">
              <div className="detail-section">
                <h4>Account Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Administrator ID</label>
                    <span>{selectedAdmin.adminId}</span>
                  </div>
                  <div className="detail-item">
                    <label>Username</label>
                    <span>{selectedAdmin.userName}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email</label>
                    <span>{selectedAdmin.email}</span>
                  </div>
                  <div className="detail-item">
                    <label>Full Name</label>
                    <span>{selectedAdmin.firstName} {selectedAdmin.lastName}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                onClick={() => setShowAdminDetails(false)}
                className="btn btn-outline"
              >
                Close
              </button>
              <button
                onClick={() => handleResetPassword(selectedAdmin.adminId)}
                className="btn btn-warning"
              >
                <i className="fas fa-key"></i>
                Reset Password
              </button>
              {selectedAdmin.adminId !== user?.id && (
                <button
                  onClick={() => {
                    setShowAdminDetails(false)
                    handleDeleteAdmin(selectedAdmin.adminId)
                  }}
                  className="btn btn-danger"
                >
                  <i className="fas fa-trash"></i>
                  Delete Administrator
                </button>
              )}
            </div>
          </div>
        </FormModal>
      )}
    </div>
  )
}

export default AdminAdministrators