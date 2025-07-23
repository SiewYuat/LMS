import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import './Navbar.css'

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo */}
        <Link to="/" className="nav-logo" onClick={closeMenu}>
          📚 Library Management
        </Link>

        {/* Mobile menu button */}
        <button 
          className={`nav-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation Menu */}
        <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          {/* Public Links */}
          <li className="nav-item">
            <Link to="/" className="nav-link" onClick={closeMenu}>
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/books" className="nav-link" onClick={closeMenu}>
              Books
            </Link>
          </li>

          {/* Authenticated User Links */}
          {isAuthenticated ? (
            <>
              {/* Member Links */}
              {user?.userType === 'MEMBER' && (
                <>
                  <li className="nav-item">
                    <Link to="/dashboard" className="nav-link" onClick={closeMenu}>
                      Dashboard
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/borrow-history" className="nav-link" onClick={closeMenu}>
                      My Books
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/notifications" className="nav-link" onClick={closeMenu}>
                      Notifications
                    </Link>
                  </li>
                </>
              )}

              {/* Admin Links */}
              {user?.userType === 'ADMIN' && (
                <>
                  <li className="nav-item">
                    <Link to="/admin/dashboard" className="nav-link" onClick={closeMenu}>
                      Admin Dashboard
                    </Link>
                  </li>
                  <li className="nav-item dropdown">
                    <span className="nav-link dropdown-toggle">Manage</span>
                    <ul className="dropdown-menu">
                      <li>
                        <Link to="/admin/books" className="dropdown-link" onClick={closeMenu}>
                          Books
                        </Link>
                      </li>
                      <li>
                        <Link to="/admin/members" className="dropdown-link" onClick={closeMenu}>
                          Members
                        </Link>
                      </li>
                      <li>
                        <Link to="/admin/libraries" className="dropdown-link" onClick={closeMenu}>
                          Libraries
                        </Link>
                      </li>
                      <li>
                        <Link to="/admin/book-instances" className="dropdown-link" onClick={closeMenu}>
                          Book Instances
                        </Link>
                      </li>
                      <li>
                      <Link to="/admin/administrators" className="dropdown-link" onClick={closeMenu}>
                        Administrators
                      </Link>
                    </li>
                      <li>
                      <Link to="/admin/notifications" className="dropdown-link" onClick={closeMenu}>
                        📧 Notifications
                      </Link>
                      </li>
                    </ul>
                  </li>
                </>
              )}

              {/* User Profile Dropdown */}
              <li className="nav-item dropdown">
                <span className="nav-link dropdown-toggle">
                  👤 {user?.fullName || user?.username}
                </span>
                <ul className="dropdown-menu">
                  <li>
                    <Link to="/profile" className="dropdown-link" onClick={closeMenu}>
                      Profile
                    </Link>
                  </li>
                  <li>
                    <button 
                      className="dropdown-link logout-btn" 
                      onClick={() => {
                        handleLogout()
                        closeMenu()
                      }}
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </li>
            </>
          ) : (
            /* Guest Links */
            <>
              <li className="nav-item">
                <Link to="/login" className="nav-link" onClick={closeMenu}>
                  Login
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/register" className="nav-link register-btn" onClick={closeMenu}>
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  )
}

export default Navbar