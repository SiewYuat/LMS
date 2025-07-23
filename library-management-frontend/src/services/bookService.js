import apiService from './apiService'

const bookService = {
  // Get all books with pagination
  getAllBooks: async (page = 0, size = 10) => {
    const response = await apiService.get(`/books?page=${page}&size=${size}`)
    return response.data
  },

  // Get book by ID
  getBookById: async (id) => {
    const response = await apiService.get(`/books/${id}`)
    return response.data
  },

  // Search books by title
  searchBooksByTitle: async (title) => {
    const response = await apiService.get(`/books/search/title?title=${encodeURIComponent(title)}`)
    return response.data
  },

  // Search books by author
  searchBooksByAuthor: async (author) => {
    const response = await apiService.get(`/books/search/author?author=${encodeURIComponent(author)}`)
    return response.data
  },

  // Search books by category
  searchBooksByCategory: async (category) => {
    const response = await apiService.get(`/books/search/category?category=${encodeURIComponent(category)}`)
    return response.data
  },

  // Get all categories
  getAllCategories: async () => {
    const response = await apiService.get('/books/categories')
    return response.data
  },

  // Get available years of publication
  getPublicationYears: async () => {
    const response = await apiService.get('/books/years')
    return response.data
  },

  // Admin: Create new book
  createBook: async (bookData) => {
    const response = await apiService.post('/books', bookData)
    return response.data
  },

  // Admin: Update book
  updateBook: async (id, bookData) => {
    const response = await apiService.put(`/books/${id}`, bookData)
    return response.data
  },

  // Admin: Delete book
  deleteBook: async (id) => {
    const response = await apiService.delete(`/books/${id}`)
    return response.data
  },

  // Get book instances for a book
  getBookInstances: async (bookId) => {
    const response = await apiService.get(`/book-instances/book/${bookId}`)
    return response.data
  },

  // Get available instances for a book
  getAvailableInstances: async (bookId) => {
    const response = await apiService.get(`/book-instances/book/${bookId}/available`)
    return response.data
  }
}

export default bookService