import apiService from './apiService'

const bookInstanceService = {
  // Get all book instances
  getAllBookInstances: async () => {
    const response = await apiService.get('/book-instances')
    return response.data
  },

  // Get book instance by ID
  getBookInstanceById: async (id) => {
    const response = await apiService.get(`/book-instances/${id}`)
    return response.data
  },

  // Get book instances by book ID
  getInstancesByBookId: async (bookId) => {
    const response = await apiService.get(`/book-instances/book/${bookId}`)
    return response.data
  },

  // Get book instances by library ID
  getInstancesByLibraryId: async (libraryId) => {
    const response = await apiService.get(`/book-instances/library/${libraryId}`)
    return response.data
  },

  // Get available book instances by book ID
  getAvailableInstancesByBookId: async (bookId) => {
    const response = await apiService.get(`/book-instances/book/${bookId}/available`)
    return response.data
  },

  // Admin: Create new book instance
  createBookInstance: async (instanceData) => {
    const response = await apiService.post('/book-instances', instanceData)
    return response.data
  },

  // Admin: Update book instance (condition, status, etc.)
  updateBookInstance: async (id, instanceData) => {
    const response = await apiService.put(`/book-instances/${id}`, instanceData)
    return response.data
  },

  // Admin: Delete book instance
  deleteBookInstance: async (id) => {
    const response = await apiService.delete(`/book-instances/${id}`)
    return response.data
  },

  // Admin: Transfer book instance to different library - FIXED!
  transferBookToLibrary: async (bookInstanceId, newLibraryId) => {
    const response = await apiService.put(`/book-instances/${bookInstanceId}/transfer`, {
      newLibraryId: newLibraryId  // ← Send in request body, not URL
    })
    return response.data
  },

  // Admin: Transfer multiple books to library - FIXED!
  transferMultipleBooksToLibrary: async (bookInstanceIds, newLibraryId) => {
    const response = await apiService.put('/book-instances/transfer-multiple', {
      bookInstanceIds: bookInstanceIds,
      newLibraryId: newLibraryId
    })
    return response.data
  },

  // Get available book statuses
  getBookStatuses: () => {
    return ['AVAILABLE', 'BORROWED', 'RESERVED', 'MAINTENANCE', 'LOST', 'DAMAGED']
  },

  // Get available book conditions
  getBookConditions: () => {
    return ['NEW', 'EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']
  }
}

export default bookInstanceService