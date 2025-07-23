import apiService from './apiService'

const authService = {
  // Login user
  login: async (username, password) => {
    const response = await apiService.post('/auth/login', {
      userName: username,
      password: password
    })
    return response.data
  },

  // Register new member
  register: async (registrationData) => {
    const response = await apiService.post('/auth/register', {
      firstName: registrationData.firstName,
      lastName: registrationData.lastName,
      userName: registrationData.username,
      email: registrationData.email,
      password: registrationData.password,
      phone: registrationData.phone
    })
    return response.data
  },

  // Logout user
  logout: async () => {
    const response = await apiService.post('/auth/logout')
    return response.data
  },

  // Get current user info
  getCurrentUser: async () => {
    const response = await apiService.get('/auth/me')
    return response.data
  },

  // Check registration status
  checkRegistrationStatus: async (username) => {
    const response = await apiService.get(`/auth/status/${username}`)
    return response.data
  },

  // Health check
  healthCheck: async () => {
    const response = await apiService.get('/auth/health')
    return response.data
  }
}

export default authService