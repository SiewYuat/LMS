import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import memberService from '../services/memberService'
import adminService from '../services/adminService'
import Modal from '../components/Modal'

const Profile = () => {
  const { user, updateUser } = useAuth()
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    userName: '',
    email: '',
    phone: ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successModalData, setSuccessModalData] = useState({
    title: '',
    message: ''
  })
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorModalData, setErrorModalData] = useState({
    title: '',
    message: ''
  })

  // Determine if current user is admin
  const isAdmin = user?.userType === 'ADMIN'

  useEffect(() => {
    if (user?.id) {
      fetchProfileData()
    } else {
      setLoading(false)
    }
  }, [user])

  const showSuccess = (title, message) => {
    setSuccessModalData({ title, message })
    setShowSuccessModal(true)
  }

  const showError = (title, message) => {
    setErrorModalData({ title, message })
    setShowErrorModal(true)
  }

  const fetchProfileData = async () => {
    try {
      setLoading(true)
      setErrors({})
      
      console.log('Fetching profile for user:', { id: user.id, type: user.userType })
      
      let response
      if (isAdmin) {
        response = await adminService.getAdminById(user.id)
      } else {
        response = await memberService.getMemberById(user.id)
      }
      
      console.log('Profile data received:', response)
      
      setProfileData({
        firstName: response.firstName || '',
        lastName: response.lastName || '',
        userName: response.userName || user.username || '',
        email: response.email || '',
        phone: response.phone || ''
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
      
      let errorMessage = 'Failed to load profile data'
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data && typeof error.response.data === 'string') {
        errorMessage = error.response.data
      } else if (error.message) {
        errorMessage = error.message
      }
      
      showError('Profile Loading Failed', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({ ...prev, [name]: value }))
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateProfile = () => {
    const newErrors = {}

    if (!profileData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!profileData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!profileData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validatePassword = () => {
    const newErrors = {}

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required'
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters'
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password'
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    
    if (!validateProfile()) {
      return
    }

    setUpdating(true)
    setErrors({})

    try {
      console.log('Updating profile for user:', { id: user.id, type: user.userType })
      console.log('Profile data to update:', profileData)
      
   // Prepare the data to send - ensure all required fields are included
  const updateData = {
    firstName: profileData.firstName.trim(),
    lastName: profileData.lastName.trim(), 
    userName: profileData.userName || user.username, // ✅ INCLUDE USERNAME
    email: profileData.email.trim(),
    phone: profileData.phone ? profileData.phone.trim() : ''
  }

      let response
      if (isAdmin) {
        response = await adminService.updateAdmin(user.id, updateData)
      } else {
        response = await memberService.updateMember(user.id, updateData)
      }
      
      console.log('Profile update response:', response)
      
      // Update user context with new full name
      updateUser({
        fullName: `${response.firstName} ${response.lastName}`
      })
      
      showSuccess('Profile Updated', 'Your profile information has been updated successfully!')
      
    } catch (error) {
      console.error('Error updating profile:', error)
      
      let errorMessage = 'Failed to update profile'
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data && typeof error.response.data === 'string') {
        errorMessage = error.response.data
      } else if (error.message) {
        errorMessage = error.message
      }
      
      showError('Update Failed', errorMessage)
    } finally {
      setUpdating(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    
    if (!validatePassword()) {
      return
    }

    setChangingPassword(true)
    setErrors({})

    try {
      console.log('Changing password for user:', { id: user.id, type: user.userType })
      
      const passwordRequest = {
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }
      
      if (isAdmin) {
        await adminService.changePassword(user.id, passwordRequest)
      } else {
        await memberService.changePassword(user.id, passwordRequest)
      }
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      
      showSuccess('Password Changed', 'Your password has been changed successfully!')
      
    } catch (error) {
      console.error('Error changing password:', error)
      
      let errorMessage = 'Failed to change password'
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data && typeof error.response.data === 'string') {
        errorMessage = error.response.data
      } else if (error.message) {
        errorMessage = error.message
      }
      
      showError('Password Change Failed', errorMessage)
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Please log in to view your profile</h2>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '20px 0' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#333', marginBottom: '10px' }}>
            My Profile
          </h1>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>
            Manage your account information and settings
          </p>
          {isAdmin && (
            <div style={{ 
              backgroundColor: '#e3f2fd', 
              padding: '8px 16px', 
              borderRadius: '20px', 
              display: 'inline-block',
              marginTop: '10px',
              color: '#1565c0',
              fontSize: '0.9rem',
              fontWeight: 'bold'
            }}>
              👨‍💼 Administrator Account
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gap: '30px' }}>
          
          {/* Profile Information */}
          <div className="card">
            <div className="card-header">
              <h2 style={{ margin: 0 }}>Profile Information</h2>
            </div>
            <div className="card-body">
              <form onSubmit={handleUpdateProfile}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleProfileChange}
                      className={`form-control ${errors.firstName ? 'error' : ''}`}
                      disabled={updating}
                    />
                    {errors.firstName && (
                      <span style={{ color: '#dc3545', fontSize: '0.8rem' }}>{errors.firstName}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleProfileChange}
                      className={`form-control ${errors.lastName ? 'error' : ''}`}
                      disabled={updating}
                    />
                    {errors.lastName && (
                      <span style={{ color: '#dc3545', fontSize: '0.8rem' }}>{errors.lastName}</span>
                    )}
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    name="userName"
                    value={profileData.userName}
                    className="form-control"
                    disabled
                    style={{ backgroundColor: '#f8f9fa', color: '#666' }}
                  />
                  <small style={{ color: '#666' }}>Username cannot be changed</small>
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    className={`form-control ${errors.email ? 'error' : ''}`}
                    disabled={updating}
                  />
                  {errors.email && (
                    <span style={{ color: '#dc3545', fontSize: '0.8rem' }}>{errors.email}</span>
                  )}
                </div>

                <div className="form-group" style={{ marginBottom: '30px' }}>
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    className="form-control"
                    placeholder="Optional"
                    disabled={updating}
                  />
                </div>

                <button 
                  type="submit" 
                  className={`btn btn-primary ${updating ? 'loading' : ''}`}
                  disabled={updating}
                >
                  {updating ? (
                    <>
                      <span className="spinner-small"></span>
                      Updating...
                    </>
                  ) : (
                    'Update Profile'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Change Password */}
          <div className="card">
            <div className="card-header">
              <h2 style={{ margin: 0 }}>Change Password</h2>
            </div>
            <div className="card-body">
              <form onSubmit={handleChangePassword}>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label">Current Password *</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className={`form-control ${errors.currentPassword ? 'error' : ''}`}
                    disabled={changingPassword}
                  />
                  {errors.currentPassword && (
                    <span style={{ color: '#dc3545', fontSize: '0.8rem' }}>{errors.currentPassword}</span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                  <div className="form-group">
                    <label className="form-label">New Password *</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className={`form-control ${errors.newPassword ? 'error' : ''}`}
                      disabled={changingPassword}
                    />
                    {errors.newPassword && (
                      <span style={{ color: '#dc3545', fontSize: '0.8rem' }}>{errors.newPassword}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirm New Password *</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
                      disabled={changingPassword}
                    />
                    {errors.confirmPassword && (
                      <span style={{ color: '#dc3545', fontSize: '0.8rem' }}>{errors.confirmPassword}</span>
                    )}
                  </div>
                </div>

                <button 
                  type="submit" 
                  className={`btn btn-primary ${changingPassword ? 'loading' : ''}`}
                  disabled={changingPassword}
                >
                  {changingPassword ? (
                    <>
                      <span className="spinner-small"></span>
                      Changing Password...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Account Information */}
          <div className="card">
            <div className="card-header">
              <h2 style={{ margin: 0 }}>Account Information</h2>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div>
                  <strong>Account Type:</strong>
                  <p style={{ margin: '5px 0', color: '#667eea' }}>
                    {isAdmin ? 'Administrator' : 'Library Member'}
                  </p>
                </div>
                <div>
                  <strong>{isAdmin ? 'Admin ID' : 'Member ID'}:</strong>
                  <p style={{ margin: '5px 0', fontFamily: 'monospace' }}>{user?.id}</p>
                </div>
                <div>
                  <strong>Account Status:</strong>
                  <span className="badge badge-success" style={{ 
                    marginTop: '5px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={successModalData.title}
        message={successModalData.message}
        type="success"
      />

      {/* Error Modal */}
      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title={errorModalData.title}
        message={errorModalData.message}
        type="error"
      />
    </div>
  )
}

export default Profile
