import axios from 'axios'

// Create axios instance with base configuration
const apiService = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
apiService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle common errors
apiService.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    
    // Handle different error types
    const errorMessage = error.response?.data || error.message || 'An error occurred'
    
    // Attach formatted error message
    error.userMessage = typeof errorMessage === 'string' 
      ? errorMessage 
      : errorMessage.message || 'Request failed'
    
    return Promise.reject(error)
  }
)

export default apiService