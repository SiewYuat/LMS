import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import MemberDashboard from './pages/member/MemberDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import BookCatalog from './pages/books/BookCatalog'
import BookDetails from './pages/books/BookDetails'
import BorrowHistory from './pages/member/BorrowHistory'
import Notifications from './pages/member/Notifications'
import AdminBooks from './pages/admin/AdminBooks'
import AdminMembers from './pages/admin/AdminMembers'
import AdminLibraries from './pages/admin/AdminLibraries'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'
import './App.css'
import AdminBookInstances from './pages/admin/AdminBookInstances'
import AdminAdministrators from './pages/admin/AdminAdministrators'
import AdminNotifications from './pages/admin/AdminNotifications'

// Protected Route Component - Must be inside AuthProvider
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, isAuthenticated } = useAuth()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  if (requireAdmin && user?.userType !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />
  }
  
  return children
}

// Public Route Component - Must be inside AuthProvider
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth()
  
  if (isAuthenticated) {
    return <Navigate to={user?.userType === 'ADMIN' ? '/admin/dashboard' : '/dashboard'} replace />
  }
  
  return children
}

// App Routes Component - Contains all routes that need auth context
const AppRoutes = () => {
  return (
    <>
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/books" element={<BookCatalog />} />
          <Route path="/books/:id" element={<BookDetails />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          
          {/* Member Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <MemberDashboard />
            </ProtectedRoute>
          } />
          <Route path="/borrow-history" element={
            <ProtectedRoute>
              <BorrowHistory />
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          {/* Admin Protected Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/books" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminBooks />
            </ProtectedRoute>
          } />
          <Route path="/admin/members" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminMembers />
            </ProtectedRoute>
          } />
          <Route path="/admin/libraries" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLibraries />
            </ProtectedRoute>
          } />          
          <Route path="/admin/book-instances" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminBookInstances />
            </ProtectedRoute>
          } />

          <Route path="/admin/administrators" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminAdministrators />
            </ProtectedRoute>
          } />

          <Route path="/admin/notifications" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminNotifications />
            </ProtectedRoute>
          } />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

// Main App Component
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App