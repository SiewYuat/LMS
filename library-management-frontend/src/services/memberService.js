import apiService from './apiService'

const memberService = {
  // Get all members (Admin only)
  getAllMembers: async () => {
    const response = await apiService.get('/members')
    return response.data
  },

  // Get member by ID
  getMemberById: async (id) => {
    const response = await apiService.get(`/members/${id}`)
    return response.data
  },

    // Admin: Create new member (Admin only)
  createMemberByAdmin: async (memberData) => {
    const response = await apiService.post('/members/admin/create', memberData)
    return response.data
  },
  
  // Update member profile
  updateMember: async (id, memberData) => {
    const response = await apiService.put(`/members/${id}`, memberData)
    return response.data
  },

  // Change member password
  changePassword: async (id, passwordData) => {
    const response = await apiService.put(`/members/${id}/change-password`, passwordData)
    return response.data
  },

  // Search members by name (Admin only)
  searchMembersByName: async (name) => {
    const response = await apiService.get(`/members/search?name=${encodeURIComponent(name)}`)
    return response.data
  },

  // Get members by status (Admin only)
  getMembersByStatus: async (status) => {
    const response = await apiService.get(`/members/status/${status}`)
    return response.data
  },

  // Admin: Approve member
  approveMember: async (id) => {
    const response = await apiService.put(`/members/${id}/approve`)
    return response.data
  },

  // Admin: Suspend member
  suspendMember: async (id) => {
    const response = await apiService.put(`/members/${id}/suspend`)
    return response.data
  },

  // Admin: Activate member
  activateMember: async (id) => {
    const response = await apiService.put(`/members/${id}/activate`)
    return response.data
  },

  // Admin: Delete member
  deleteMember: async (id) => {
    const response = await apiService.delete(`/members/${id}`)
    return response.data
  },

  // Check member borrowing eligibility
  checkBorrowingEligibility: async (id) => {
    const response = await apiService.get(`/members/${id}/eligibility`)
    return response.data
  },

  // Get member statistics
  getMemberStats: async (id) => {
    const response = await apiService.get(`/members/${id}/stats`)
    return response.data
  }
}

export default memberService