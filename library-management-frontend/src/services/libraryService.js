import apiService from './apiService'

const libraryService = {
  // Get all libraries
  getAllLibraries: async () => {
    const response = await apiService.get('/libraries/public')
    return response.data
  },

  // Get library by ID
  getLibraryById: async (id) => {
    const response = await apiService.get(`/libraries/${id}`)
    return response.data
  },

 // Get library statistics (NEW - for enhanced UI features)
  getLibraryStats: async (id) => {
    const response = await apiService.get(`/libraries/${id}/stats`)
    return response.data
  },

  // Search libraries by name 
  searchLibrariesByName: async (name) => {
    const response = await apiService.get('/libraries/search', {
      params: { name }  // Better than manual URL encoding
    })
    return response.data
  },

  // Admin: Create new library
  createLibrary: async (libraryData) => {
    const response = await apiService.post('/libraries', libraryData)
    return response.data
  },

  // Admin: Update library
  updateLibrary: async (id, libraryData) => {
    const response = await apiService.put(`/libraries/${id}`, libraryData)
    return response.data
  },

  // Admin: Delete library
  deleteLibrary: async (id) => {
    const response = await apiService.delete(`/libraries/${id}`)
    return response.data
  }
}

export default libraryService