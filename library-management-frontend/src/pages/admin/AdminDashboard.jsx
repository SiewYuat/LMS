import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import bookService from '../../services/bookService';
import memberService from '../../services/memberService';
import borrowService from '../../services/borrowService';
import libraryService from '../../services/libraryService';
import { useAuth } from '../../contexts/AuthContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalBooks: 0,
    totalMembers: 0,
    totalLibraries: 0,
    activeBorrows: 0,
    overdueBorrows: 0,
    pendingMembers: 0,
    recentBorrows: [],
    overdueBooks: [],
    recentNotifications: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch all dashboard data in parallel
      const [
        books,
        members,
        libraries,
        allBorrows,
        overdueBorrows,
        pendingMembers,
      ] = await Promise.all([
        bookService.getAllBooks(),
        memberService.getAllMembers(),
        libraryService.getAllLibraries(),
        borrowService.getAllBorrows(),
        borrowService.getOverdueBorrows(),
        memberService.getMembersByStatus('PENDING'),
      ]);

      // Calculate statistics
      const activeBorrows = allBorrows.filter(b => b.status === 'ACTIVE').length;
      const recentBorrows = allBorrows
        .sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate))
        .slice(0, 10);

      setDashboardData({
        totalBooks: books.length,
        totalMembers: members.length,
        totalLibraries: libraries.length,
        activeBorrows,
        overdueBorrows: overdueBorrows.length,
        pendingMembers: pendingMembers.length,
        recentBorrows,
        overdueBooks: overdueBorrows.slice(0, 10),
        recentNotifications: []
      });
    } catch (err) {
      setError('Failed to load dashboard data: ' + err.message);
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateTimeString) => {
    return new Date(dateTimeString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error-message">{error}</div>
        <button onClick={fetchDashboardData} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back, {user?.fullName || 'Administrator'}</p>
        <button
          onClick={fetchDashboardData}
          className="btn btn-outline-primary refresh-btn"
          disabled={loading}
        >
          <i className="fas fa-refresh"></i>
          Refresh
        </button>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card stat-books">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <div className="stat-number">{dashboardData.totalBooks}</div>
            <div className="stat-label">Total Books</div>
          </div>
          <Link to="/admin/books" className="stat-link">
            Manage Books →
          </Link>
        </div>

        <div className="stat-card stat-members">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <div className="stat-number">{dashboardData.totalMembers}</div>
            <div className="stat-label">Total Members</div>
          </div>
          <Link to="/admin/members" className="stat-link">
            Manage Members →
          </Link>
        </div>

        <div className="stat-card stat-libraries">
          <div className="stat-icon">🏢</div>
          <div className="stat-info">
            <div className="stat-number">{dashboardData.totalLibraries}</div>
            <div className="stat-label">Libraries</div>
          </div>
          <Link to="/admin/libraries" className="stat-link">
            Manage Libraries →
          </Link>
        </div>

        <div className="stat-card stat-borrows">
          <div className="stat-icon">📖</div>
          <div className="stat-info">
            <div className="stat-number">{dashboardData.activeBorrows}</div>
            <div className="stat-label">Active Borrows</div>
          </div>
        </div>
      </div>

      {/* Alert Cards */}
      <div className="alert-cards">
        {dashboardData.overdueBorrows > 0 && (
          <div className="alert-card alert-danger">
            <div className="alert-icon">⚠️</div>
            <div className="alert-content">
              <h3>Overdue Books Alert</h3>
              <p>{dashboardData.overdueBorrows} books are overdue and need immediate attention.</p>
            </div>
          </div>
        )}

        {dashboardData.pendingMembers > 0 && (
          <div className="alert-card alert-warning">
            <div className="alert-icon">👤</div>
            <div className="alert-content">
              <h3>Pending Member Approvals</h3>
              <p>{dashboardData.pendingMembers} members are waiting for approval.</p>
            </div>
            <Link to="/admin/members?status=PENDING" className="btn btn-sm btn-warning">
              Review
            </Link>
          </div>
        )}
      </div>

      {/* Dashboard Content Grid */}
      <div className="dashboard-grid">
        {/* Recent Borrows */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Borrows</h2>
            <span className="section-count">{dashboardData.recentBorrows.length}</span>
          </div>
          <div className="section-content">
            {dashboardData.recentBorrows.length === 0 ? (
              <p className="no-data">No recent borrows found.</p>
            ) : (
              <div className="items-list">
                {dashboardData.recentBorrows.map((borrow) => (
                  <div key={borrow.borrowId} className="list-item">
                    <div className="item-info">
                      <div className="item-title">{borrow.bookTitle}</div>
                      <div className="item-subtitle">
                        {borrow.memberName} • {borrow.libraryName}
                      </div>
                    </div>
                    <div className="item-meta">
                      <div className="item-date">{formatDate(borrow.borrowDate)}</div>
                      <span className={`status-badge status-${borrow.status.toLowerCase()}`}>
                        {borrow.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Overdue Books */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Overdue Books</h2>
            <span className="section-count">{dashboardData.overdueBooks.length}</span>
          </div>
          <div className="section-content">
            {dashboardData.overdueBooks.length === 0 ? (
              <p className="no-data">No overdue books. Great job!</p>
            ) : (
              <div className="items-list">
                {dashboardData.overdueBooks.map((borrow) => (
                  <div key={borrow.borrowId} className="list-item list-item-urgent">
                    <div className="item-info">
                      <div className="item-title">{borrow.bookTitle}</div>
                      <div className="item-subtitle">
                        {borrow.memberName} • Due: {formatDate(borrow.dueDate)}
                      </div>
                    </div>
                    <div className="item-meta">
                      {borrow.fine && (
                        <div className="fine-amount">${borrow.fine}</div>
                      )}
                      <span className="status-badge status-overdue">
                        OVERDUE
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

     {/* Admin Welcome Section */}
    <div className="dashboard-section">
      <div className="section-header">
        <h2>Welcome, {user?.fullName || 'Administrator'}!</h2>
      </div>
      <div className="section-content">
        <div className="welcome-content">
          <div className="welcome-message">
            <h3>🎉 Welcome to the Library Management System</h3>
            <p>You're logged in as an administrator. Here's what you can do:</p>
            
            <div className="admin-capabilities">
              <div className="capability-item">
                <span className="capability-icon">📚</span>
                <span className="capability-text">Manage Books & Inventory</span>
              </div>
              <div className="capability-item">
                <span className="capability-icon">👥</span>
                <span className="capability-text">Approve & Manage Members</span>
              </div>
              <div className="capability-item">
                <span className="capability-icon">🏢</span>
                <span className="capability-text">Oversee Library Locations</span>
              </div>
              <div className="capability-item">
                <span className="capability-icon">📊</span>
                <span className="capability-text">Monitor System Activity</span>
              </div>
            </div>

            <div className="quick-stats">
              <p>
                <strong>System Status:</strong> 
                {dashboardData.totalBooks} books across {dashboardData.totalLibraries} libraries, 
                serving {dashboardData.totalMembers} members.
              </p>
              {dashboardData.pendingMembers > 0 && (
                <p className="attention-needed">
                  ⚠️ <strong>{dashboardData.pendingMembers} members</strong> awaiting approval.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>

        {/* Quick Actions */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="section-content">
            <div className="quick-actions">
              <Link to="/admin/books/add" className="action-card">
                <div className="action-icon">➕</div>
                <div className="action-label">Add New Book</div>
              </Link>
              <Link to="/admin/members/pending" className="action-card">
                <div className="action-icon">✅</div>
                <div className="action-label">Approve Members</div>
              </Link>
              <Link to="/admin/libraries/add" className="action-card">
                <div className="action-icon">🏢</div>
                <div className="action-label">Add Library</div>
              </Link>
              <Link to="/admin/reports" className="action-card">
                <div className="action-icon">📊</div>
                <div className="action-label">View Reports</div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;