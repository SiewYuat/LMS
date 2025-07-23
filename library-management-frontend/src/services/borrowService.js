import apiService from './apiService'

const borrowService = {
  // Borrow a book
  borrowBook: async (memberId, bookInstanceId) => {
    const response = await apiService.post('/borrows/borrow', null, {
      params: {
        memberId,
        bookInstanceId
      }
    })
    return response.data
  },

  // Return a book
  returnBook: async (borrowId) => {
    const response = await apiService.put(`/borrows/${borrowId}/return`)
    return response.data
  },

  // Get all borrows
  getAllBorrows: async () => {
    const response = await apiService.get('/borrows')
    return response.data
  },

  // Get borrow by ID
  getBorrowById: async (id) => {
    const response = await apiService.get(`/borrows/${id}`)
    return response.data
  },

  // Get borrows by member ID (matches frontend expectation)
  getBorrowsByMember: async (memberId) => {
    const response = await apiService.get(`/borrows/member/${memberId}`)
    return response.data
  },

  // Alternative method name for backwards compatibility
  getBorrowsByMemberId: async (memberId) => {
    const response = await apiService.get(`/borrows/member/${memberId}`)
    return response.data
  },

  // Get active borrows by member ID
  getActiveBorrowsByMember: async (memberId) => {
    const response = await apiService.get(`/borrows/member/${memberId}/active`)
    return response.data
  },

  // Get overdue borrows
  getOverdueBorrows: async () => {
    const response = await apiService.get('/borrows/overdue')
    return response.data
  },

  // Get overdue borrows by member
  getOverdueBorrowsByMember: async (memberId) => {
    const response = await apiService.get(`/borrows/member/${memberId}/overdue`)
    return response.data
  },

  // Get member borrowing statistics
  getMemberBorrowStats: async (memberId) => {
    const response = await apiService.get(`/borrows/member/${memberId}/stats`)
    return response.data
  },

  // Renew a book (if this endpoint exists)
  renewBook: async (borrowId) => {
    const response = await apiService.put(`/borrows/${borrowId}/renew`)
    return response.data
  },

  // Admin: Update borrow record
  updateBorrow: async (id, borrowData) => {
    const response = await apiService.put(`/borrows/${id}`, borrowData)
    return response.data
  },

  // Admin: Delete borrow record
  deleteBorrow: async (id) => {
    const response = await apiService.delete(`/borrows/${id}`)
    return response.data
  }
}

export default borrowService