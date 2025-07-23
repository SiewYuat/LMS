import apiService from './apiService'

const adminService = {
  // Get admin profile by ID
  getAdminById: async (id) => {
    const response = await apiService.get(`/administrators/${id}`)
    return response.data
  },

  // Update admin profile  
  updateAdmin: async (id, adminData) => {
    const response = await apiService.put(`/administrators/${id}`, adminData)
    return response.data
  },

  // Change admin password
  changePassword: async (id, passwordData) => {
    const response = await apiService.put(`/administrators/${id}/change-password`, passwordData)
    return response.data
  },

  // Get all administrators (for super admin)
  getAllAdmins: async () => {
    const response = await apiService.get('/administrators')
    return response.data
  },

  // Create new administrator 
  createAdmin: async (adminData, temporaryPassword) => {
    const response = await apiService.post('/administrators', {
      administratorDTO: adminData,
      temporaryPassword: temporaryPassword
    })
    return response.data
  },

  // Create admin with auto-generated password
  createAdminWithAutoPassword: async (adminData) => {
    const response = await apiService.post('/administrators/auto-password', adminData)
    return response.data
  },

  // Delete administrator
  deleteAdmin: async (id) => {
    const response = await apiService.delete(`/administrators/${id}`)
    return response.data
  },

  // Search administrators by name
  searchAdmins: async (name) => {
    const response = await apiService.get(`/administrators/search?name=${encodeURIComponent(name)}`)
    return response.data
  },

  // Reset admin password (super admin only)
  resetPassword: async (id, newPassword) => {
    const response = await apiService.put(`/administrators/${id}/reset-password`, {
      newPassword: newPassword
    })
    return response.data
  },

  // Get admin statistics
  getAdminStats: async () => {
    const response = await apiService.get('/administrators/stats')
    return response.data
  }
}

export default adminService
