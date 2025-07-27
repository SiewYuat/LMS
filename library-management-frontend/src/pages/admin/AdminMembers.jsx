import React, { useState, useEffect } from 'react';
import memberService from '../../services/memberService';
import borrowService from '../../services/borrowService';
import { useAuth } from '../../contexts/AuthContext';
import './AdminMembers.css';

const AdminMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('firstName');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberDetails, setShowMemberDetails] = useState(false);
  const [showCreateMember, setShowCreateMember] = useState(false);
  const [memberBorrows, setMemberBorrows] = useState([]);
  const [createMemberData, setCreateMemberData] = useState({
    firstName: '',
    lastName: '',
    userName: '',
    email: '',
    phone: '',
    password: ''
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showEditMember, setShowEditMember] = useState(false);
  const [editMemberData, setEditMemberData] = useState({
    memberId: '',
    firstName: '',
    lastName: '',
    userName: '',
    email: '',
    phone: '',
    memberStatus: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editValidationErrors, setEditValidationErrors] = useState({});
    
  const { user } = useAuth();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError('');
      const membersData = await memberService.getAllMembers();
      setMembers(membersData);
    } catch (err) {
      setError('Failed to load members: ' + err.message);
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMember = async (e) => {
    e.preventDefault();
    
    // Reset previous errors
    setValidationErrors({});
    
    // Basic validation
    const errors = {};
    if (!createMemberData.firstName.trim()) errors.firstName = 'First name is required';
    if (!createMemberData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!createMemberData.userName.trim()) errors.userName = 'Username is required';
    if (!createMemberData.email.trim()) errors.email = 'Email is required';
    if (!createMemberData.password.trim()) errors.password = 'Password is required';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (createMemberData.email && !emailRegex.test(createMemberData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      setCreateLoading(true);
      await memberService.createMemberByAdmin(createMemberData);
      
      // Reset form and close modal
      setCreateMemberData({
        firstName: '',
        lastName: '',
        userName: '',
        email: '',
        phone: '',
        password: ''
      });
      setShowCreateMember(false);
      
      // Refresh members list
      await fetchMembers();
      
      alert('Member created successfully!');
    } catch (err) {
      if (err.message.includes('Username') && err.message.includes('already taken')) {
        setValidationErrors({ userName: 'Username is already taken' });
      } else if (err.message.includes('Email') && err.message.includes('already registered')) {
        setValidationErrors({ email: 'Email is already registered' });
      } else {
        setValidationErrors({ general: 'Failed to create member: ' + err.message });
      }
    } finally {
      setCreateLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCreateMemberData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleEditMember = async (e) => {
    e.preventDefault();
    setEditValidationErrors({});
    
    const errors = {};
    if (!editMemberData.firstName.trim()) errors.firstName = 'First name is required';
    if (!editMemberData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!editMemberData.userName.trim()) errors.userName = 'Username is required';
    if (!editMemberData.email.trim()) errors.email = 'Email is required';
    if (!editMemberData.memberStatus.trim()) errors.memberStatus = 'Status is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (editMemberData.email && !emailRegex.test(editMemberData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (Object.keys(errors).length > 0) {
      setEditValidationErrors(errors);
      return;
    }

    try {
      setEditLoading(true);
      await memberService.updateMember(editMemberData.memberId, editMemberData);
      setShowEditMember(false);
      await fetchMembers();
      alert('Member updated successfully!');
    } catch (err) {
      if (err.message.includes('Username') && err.message.includes('already taken')) {
        setEditValidationErrors({ userName: 'Username is already taken' });
      } else if (err.message.includes('Email') && err.message.includes('already registered')) {
        setEditValidationErrors({ email: 'Email is already registered' });
      } else {
        setEditValidationErrors({ general: 'Failed to update member: ' + err.message });
      }
    } finally {
      setEditLoading(false);
    }
  };

  const openEditMemberModal = (member) => {
    setEditMemberData({
      memberId: member.memberId,
      firstName: member.firstName,
      lastName: member.lastName,
      userName: member.userName,
      email: member.email,
      phone: member.phone || '',
      memberStatus: member.memberStatus
    });
    setEditValidationErrors({});
    setShowEditMember(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditMemberData(prev => ({ ...prev, [name]: value }));
    if (editValidationErrors[name]) {
      setEditValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };


  const handleApproveMember = async (memberId) => {
    try {
      await memberService.approveMember(memberId);
      await fetchMembers();
      alert('Member approved successfully!');
    } catch (err) {
      alert('Failed to approve member: ' + err.message);
    }
  };

  const handleSuspendMember = async (memberId) => {
    if (window.confirm('Are you sure you want to suspend this member?')) {
      try {
        await memberService.suspendMember(memberId);
        await fetchMembers();
        alert('Member suspended successfully!');
      } catch (err) {
        alert('Failed to suspend member: ' + err.message);
      }
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (window.confirm('Are you sure you want to delete this member? This action cannot be undone.')) {
      try {
        await memberService.deleteMember(memberId);
        await fetchMembers();
        alert('Member deleted successfully!');
      } catch (err) {
        alert('Failed to delete member: ' + err.message);
      }
    }
  };

  const viewMemberDetails = async (member) => {
    try {
      setSelectedMember(member);
      const borrows = await borrowService.getBorrowsByMemberId(member.memberId);
      setMemberBorrows(borrows);
      setShowMemberDetails(true);
    } catch (err) {
      alert('Failed to load member details: ' + err.message);
    }
  };

  const filteredAndSortedMembers = members
    .filter(member => {
      const matchesSearch = member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || member.memberStatus === statusFilter;
      return matchesSearch && matchesStatus;
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

  const getStatusCounts = () => {
    const counts = {};
    members.forEach(member => {
      counts[member.memberStatus] = (counts[member.memberStatus] || 0) + 1;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'status-badge status-active';
      case 'PENDING':
        return 'status-badge status-pending';
      case 'SUSPENDED':
        return 'status-badge status-suspended';
      case 'INACTIVE':
        return 'status-badge status-inactive';
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

  if (loading) {
    return (
      <div className="admin-members">
        <div className="loading">Loading members...</div>
      </div>
    );
  }

  return (
    <div className="admin-members">
      <div className="page-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Member Management</h1>
            <p>Manage library members and their accounts</p>
          </div>
          <button
            onClick={() => setShowCreateMember(true)}
            className="btn btn-primary"
          >
            <i className="fas fa-plus"></i>
            Create New Member
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={fetchMembers} className="btn btn-sm btn-outline-primary">
            Retry
          </button>
        </div>
      )}

      {/* Member Statistics */}
      <div className="members-stats">
        <div className="stat-card stat-total">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <div className="stat-number">{members.length}</div>
            <div className="stat-label">Total Members</div>
          </div>
        </div>
        <div className="stat-card stat-active">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-number">{statusCounts.ACTIVE || 0}</div>
            <div className="stat-label">Active Members</div>
          </div>
        </div>
        <div className="stat-card stat-pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <div className="stat-number">{statusCounts.PENDING || 0}</div>
            <div className="stat-label">Pending Approval</div>
          </div>
        </div>
        <div className="stat-card stat-suspended">
          <div className="stat-icon">⛔</div>
          <div className="stat-info">
            <div className="stat-number">{statusCounts.SUSPENDED || 0}</div>
            <div className="stat-label">Suspended</div>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="members-controls">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search by name, username, or email..."
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
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        <div className="sort-section">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="form-select"
          >
            <option value="firstName">Sort by First Name</option>
            <option value="lastName">Sort by Last Name</option>
            <option value="userName">Sort by Username</option>
            <option value="email">Sort by Email</option>
            <option value="memberStatus">Sort by Status</option>
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
          onClick={fetchMembers}
          className="btn btn-outline-primary"
          disabled={loading}
        >
          <i className="fas fa-refresh"></i>
          Refresh
        </button>
      </div>

      {/* Members List */}
      {filteredAndSortedMembers.length === 0 ? (
        <div className="no-members">
          <div className="no-members-icon">👥</div>
          <h3>No members found</h3>
          <p>
            {searchTerm || statusFilter
              ? 'Try adjusting your search criteria.'
              : 'No members are registered in the system.'
            }
          </p>
        </div>
      ) : (
        <div className="members-list">
          {filteredAndSortedMembers.map((member) => (
            <div key={member.memberId} className="member-card">
              <div className="member-header">
                <div className="member-info">
                  <h3 className="member-name">
                    {member.firstName} {member.lastName}
                  </h3>
                  <p className="member-username">@{member.userName}</p>
                </div>
                <span className={getStatusBadgeClass(member.memberStatus)}>
                  {member.memberStatus}
                </span>
              </div>

              <div className="member-details">
                <div className="detail-row">
                  <span className="label">Email:</span>
                  <span className="value">{member.email}</span>
                </div>
                {member.phone && (
                  <div className="detail-row">
                    <span className="label">Phone:</span>
                    <span className="value">{member.phone}</span>
                  </div>
                )}
                <div className="detail-row">
                  <span className="label">Member ID:</span>
                  <span className="value">#{member.memberId}</span>
                </div>
                {member.activeBorrowCount !== undefined && (
                  <div className="detail-row">
                    <span className="label">Active Borrows:</span>
                    <span className="value">{member.activeBorrowCount}</span>
                  </div>
                )}
              </div>

              <div className="member-actions">
                <button
                  onClick={() => viewMemberDetails(member)}
                  className="btn btn-sm btn-outline-primary"
                  title="View details"
                >
                  <i className="fas fa-eye"></i>
                  View
                </button>

                <button
                  onClick={() => openEditMemberModal(member)}
                  className="btn btn-sm btn-primary"
                  title="Edit member"
                >
                  <i className="fas fa-edit"></i>
                  Edit
                </button>  

                {member.memberStatus === 'PENDING' && (
                  <button
                    onClick={() => handleApproveMember(member.memberId)}
                    className="btn btn-sm btn-success"
                    title="Approve member"
                  >
                    <i className="fas fa-check"></i>
                    Approve
                  </button>
                )}

                {member.memberStatus === 'ACTIVE' && (
                  <button
                    onClick={() => handleSuspendMember(member.memberId)}
                    className="btn btn-sm btn-warning"
                    title="Suspend member"
                  >
                    <i className="fas fa-pause"></i>
                    Suspend
                  </button>
                )}

                <button
                  onClick={() => handleDeleteMember(member.memberId)}
                  className="btn btn-sm btn-outline-danger"
                  title="Delete member"
                >
                  <i className="fas fa-trash"></i>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Member Modal */}
      {showCreateMember && (
        <div className="modal-overlay" onClick={() => setShowCreateMember(false)}>
          <div className="modal-content create-member-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Member</h2>
              <button
                onClick={() => setShowCreateMember(false)}
                className="btn btn-sm btn-outline-secondary"
                disabled={createLoading}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              {validationErrors.general && (
                <div className="error-message mb-3">
                  {validationErrors.general}
                </div>
              )}
              
              <form onSubmit={handleCreateMember} className="create-member-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name *</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={createMemberData.firstName}
                      onChange={handleInputChange}
                      className={`form-input ${validationErrors.firstName ? 'error' : ''}`}
                      placeholder="Enter first name"
                      disabled={createLoading}
                    />
                    {validationErrors.firstName && (
                      <span className="error-text">{validationErrors.firstName}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastName">Last Name *</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={createMemberData.lastName}
                      onChange={handleInputChange}
                      className={`form-input ${validationErrors.lastName ? 'error' : ''}`}
                      placeholder="Enter last name"
                      disabled={createLoading}
                    />
                    {validationErrors.lastName && (
                      <span className="error-text">{validationErrors.lastName}</span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="userName">Username *</label>
                  <input
                    type="text"
                    id="userName"
                    name="userName"
                    value={createMemberData.userName}
                    onChange={handleInputChange}
                    className={`form-input ${validationErrors.userName ? 'error' : ''}`}
                    placeholder="Enter username"
                    disabled={createLoading}
                  />
                  {validationErrors.userName && (
                    <span className="error-text">{validationErrors.userName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={createMemberData.email}
                    onChange={handleInputChange}
                    className={`form-input ${validationErrors.email ? 'error' : ''}`}
                    placeholder="Enter email address"
                    disabled={createLoading}
                  />
                  {validationErrors.email && (
                    <span className="error-text">{validationErrors.email}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={createMemberData.phone}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter phone number (optional)"
                    disabled={createLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password *</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={createMemberData.password}
                    onChange={handleInputChange}
                    className={`form-input ${validationErrors.password ? 'error' : ''}`}
                    placeholder="Enter password"
                    disabled={createLoading}
                  />
                  {validationErrors.password && (
                    <span className="error-text">{validationErrors.password}</span>
                  )}
                </div>

                <div className="form-note">
                  <p><strong>Note:</strong> Members created by admin will have ACTIVE status immediately.</p>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => setShowCreateMember(false)}
                    className="btn btn-outline-secondary"
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
                        <i className="fas fa-spinner fa-spin"></i>
                        Creating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-plus"></i>
                        Create Member
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

       {/* Member EDIT Modal */}
      {showEditMember && (
            <div className="modal-overlay" onClick={() => setShowEditMember(false)}>
              <div className="modal-content edit-member-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Edit Member</h2>
                  <button onClick={() => setShowEditMember(false)} className="btn btn-sm btn-outline-secondary" disabled={editLoading}>
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                
                <div className="modal-body">
                  {editValidationErrors.general && (
                    <div className="error-message mb-3">{editValidationErrors.general}</div>
                  )}
                  
                  <form onSubmit={handleEditMember} className="edit-member-form">
                    <div className="form-group">
                      <label htmlFor="editMemberId">Member ID</label>
                      <input type="text" id="editMemberId" value={`#${editMemberData.memberId}`} className="form-input" disabled style={{ backgroundColor: '#f5f5f5' }} />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="editFirstName">First Name *</label>
                        <input type="text" id="editFirstName" name="firstName" value={editMemberData.firstName} onChange={handleEditInputChange} className={`form-input ${editValidationErrors.firstName ? 'error' : ''}`} placeholder="Enter first name" disabled={editLoading} />
                        {editValidationErrors.firstName && <span className="error-text">{editValidationErrors.firstName}</span>}
                      </div>
                      <div className="form-group">
                        <label htmlFor="editLastName">Last Name *</label>
                        <input type="text" id="editLastName" name="lastName" value={editMemberData.lastName} onChange={handleEditInputChange} className={`form-input ${editValidationErrors.lastName ? 'error' : ''}`} placeholder="Enter last name" disabled={editLoading} />
                        {editValidationErrors.lastName && <span className="error-text">{editValidationErrors.lastName}</span>}
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="editUserName">Username *</label>
                      <input type="text" id="editUserName" name="userName" value={editMemberData.userName} onChange={handleEditInputChange} className={`form-input ${editValidationErrors.userName ? 'error' : ''}`} placeholder="Enter username" disabled={editLoading} />
                      {editValidationErrors.userName && <span className="error-text">{editValidationErrors.userName}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="editEmail">Email Address *</label>
                      <input type="email" id="editEmail" name="email" value={editMemberData.email} onChange={handleEditInputChange} className={`form-input ${editValidationErrors.email ? 'error' : ''}`} placeholder="Enter email address" disabled={editLoading} />
                      {editValidationErrors.email && <span className="error-text">{editValidationErrors.email}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="editPhone">Phone Number</label>
                      <input type="tel" id="editPhone" name="phone" value={editMemberData.phone} onChange={handleEditInputChange} className="form-input" placeholder="Enter phone number (optional)" disabled={editLoading} />
                    </div>

                    <div className="form-group">
                      <label htmlFor="editMemberStatus">Member Status *</label>
                      <select id="editMemberStatus" name="memberStatus" value={editMemberData.memberStatus} onChange={handleEditInputChange} className={`form-select ${editValidationErrors.memberStatus ? 'error' : ''}`} disabled={editLoading}>
                        <option value="">Select Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="PENDING">Pending</option>
                        <option value="SUSPENDED">Suspended</option>
                        <option value="INACTIVE">Inactive</option>
                      </select>
                      {editValidationErrors.memberStatus && <span className="error-text">{editValidationErrors.memberStatus}</span>}
                    </div>

                    <div className="form-note">
                      <p><strong>Note:</strong> As an admin, you can modify all member fields including status and username.</p>
                    </div>

                    <div className="form-actions">
                      <button type="button" onClick={() => setShowEditMember(false)} className="btn btn-outline-secondary" disabled={editLoading}>Cancel</button>
                      <button type="submit" className="btn btn-primary" disabled={editLoading}>
                        {editLoading ? (<><i className="fas fa-spinner fa-spin"></i> Updating...</>) : (<><i className="fas fa-save"></i> Update Member</>)}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

      {/* Member Details Modal */}
      {showMemberDetails && selectedMember && (
        <div className="modal-overlay" onClick={() => setShowMemberDetails(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Member Details</h2>
              <button
                onClick={() => setShowMemberDetails(false)}
                className="btn btn-sm btn-outline-secondary"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="member-profile">
                <div className="profile-section">
                  <h3>Personal Information</h3>
                  <div className="profile-details">
                    <div className="detail-item">
                      <label>Full Name:</label>
                      <span>{selectedMember.firstName} {selectedMember.lastName}</span>
                    </div>
                    <div className="detail-item">
                      <label>Username:</label>
                      <span>{selectedMember.userName}</span>
                    </div>
                    <div className="detail-item">
                      <label>Email:</label>
                      <span>{selectedMember.email}</span>
                    </div>
                    {selectedMember.phone && (
                      <div className="detail-item">
                        <label>Phone:</label>
                        <span>{selectedMember.phone}</span>
                      </div>
                    )}
                    <div className="detail-item">
                      <label>Status:</label>
                      <span className={getStatusBadgeClass(selectedMember.memberStatus)}>
                        {selectedMember.memberStatus}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Member ID:</label>
                      <span>#{selectedMember.memberId}</span>
                    </div>
                  </div>
                </div>

                <div className="borrowing-section">
                  <h3>Borrowing History</h3>
                  {memberBorrows.length === 0 ? (
                    <p className="no-borrows">No borrowing history found.</p>
                  ) : (
                    <div className="borrows-list">
                      {memberBorrows.slice(0, 10).map((borrow) => (
                        <div key={borrow.borrowId} className="borrow-item">
                          <div className="borrow-info">
                            <div className="book-title">{borrow.bookTitle}</div>
                            <div className="borrow-dates">
                              Borrowed: {formatDate(borrow.borrowDate)} | 
                              Due: {formatDate(borrow.dueDate)}
                              {borrow.returnDate && (
                                <span> | Returned: {formatDate(borrow.returnDate)}</span>
                              )}
                            </div>
                          </div>
                          <span className={`status-badge status-${borrow.status.toLowerCase()}`}>
                            {borrow.status}
                          </span>
                        </div>
                      ))}
                      {memberBorrows.length > 10 && (
                        <p className="more-borrows">
                          And {memberBorrows.length - 10} more...
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMembers;