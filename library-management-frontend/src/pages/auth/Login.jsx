import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import './Auth.css'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const response = await login(formData.username, formData.password)
      
      // Redirect based on user type
      if (response.userType === 'ADMIN') {
        navigate('/admin/dashboard')
      } else {
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Login error:', error)
      
      // Handle different types of errors
      let errorMessage = 'Login failed. Please try again.'
      
      if (error.response?.data?.message) {
        // Error from backend with JSON response
        errorMessage = error.response.data.message
      } else if (error.response?.data && typeof error.response.data === 'string') {
        // Error from backend with string response
        errorMessage = error.response.data
      } else if (error.message) {
        // Network or other errors
        errorMessage = error.message
      }
      
      // Check for specific error types
      if (errorMessage.toLowerCase().includes('invalid username or password')) {
        setErrors({
          general: 'Invalid username or password. Please check your credentials and try again.'
        })
      } else if (errorMessage.toLowerCase().includes('account is not active')) {
        setErrors({
          general: 'Your account is not active. Please contact an administrator.'
        })
      } else if (errorMessage.toLowerCase().includes('status: pending')) {
        setErrors({
          general: 'Your account is pending approval. Please wait for an administrator to activate your account.'
        })
      } else {
        setErrors({
          general: errorMessage
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your library account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {errors.general && (
            <div className="error-message" style={{
              backgroundColor: '#fee',
              border: '1px solid #fcc',
              color: '#c33',
              padding: '12px',
              borderRadius: '4px',
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              {errors.general}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={errors.username ? 'error' : ''}
              placeholder="Enter your username"
              disabled={loading}
            />
            {errors.username && (
              <span className="field-error">{errors.username}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder="Enter your password"
              disabled={loading}
            />
            {errors.password && (
              <span className="field-error">{errors.password}</span>
            )}
          </div>

          <button 
            type="submit" 
            className={`btn btn-primary btn-full ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-small"></span>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">
              Register here
            </Link>
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="demo-credentials">
          <h3>Demo Credentials</h3>
          <div className="demo-accounts">
            <div className="demo-account">
              <strong>Admin Account:</strong>
              <p>Username: superadmin</p>
              <p>Password: ChangeMe123!</p>
            </div>
            <div className="demo-account">
              <strong>Member Account:</strong>
              <p>Register a new account or check with admin</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
