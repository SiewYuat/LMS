import React, { useState, useEffect } from 'react';
import notificationService from '../../services/notificationService';
import { useAuth } from '../../contexts/AuthContext';
import './Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL'); // ALL, OVERDUE, REMINDER, GENERAL, WELCOME
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError('');

      if (!user?.id) {
        throw new Error('User ID not found. Please log in again.');
      }

      console.log('Fetching notifications for user ID:', user.id);
      const memberNotifications = await notificationService.getNotificationsByMember(user.id);
      console.log('Notifications received:', memberNotifications);
      setNotifications(memberNotifications);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      
      let errorMessage = 'Failed to load notifications';
      if (err.message.includes('Member ID not found')) {
        errorMessage = 'Member ID not found. Please log in again.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data && typeof err.response.data === 'string') {
        errorMessage = err.response.data;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(notifications.filter(n => n.notificationId !== notificationId));
    } catch (err) {
      let errorMessage = 'Failed to delete notification';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      alert(errorMessage);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'ALL') return true;
    return notification.ntfType === filter;
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'OVERDUE':
        return '⚠️';
      case 'REMINDER':
        return '⏰';
      case 'GENERAL':
        return '📢';
      case 'WELCOME':
        return '👋';
      default:
        return '📨';
    }
  };

  const getNotificationClass = (type) => {
    switch (type) {
      case 'OVERDUE':
        return 'notification-item notification-overdue';
      case 'REMINDER':
        return 'notification-item notification-reminder';
      case 'GENERAL':
        return 'notification-item notification-general';
      case 'WELCOME':
        return 'notification-item notification-welcome';
      default:
        return 'notification-item';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNotificationsByType = (type) => {
    return notifications.filter(n => n.ntfType === type).length;
  };

  if (loading) {
    return (
      <div className="notifications">
        <div className="loading">Loading notifications...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notifications">
        <div className="error-message" style={{
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          color: '#721c24',
          padding: '20px',
          borderRadius: '4px',
          textAlign: 'center',
          margin: '20px'
        }}>
          {error}
        </div>
        <div style={{ textAlign: 'center' }}>
          <button onClick={fetchNotifications} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications">
      <div className="page-header">
        <h1>My Notifications</h1>
        <p>Stay updated with your library activities</p>
      </div>

      {/* Notification Statistics */}
      <div className="notification-stats">
        <div className="stat-card">
          <div className="stat-icon">📨</div>
          <div className="stat-info">
            <div className="stat-number">{notifications.length}</div>
            <div className="stat-label">Total Notifications</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <div className="stat-number">{getNotificationsByType('OVERDUE')}</div>
            <div className="stat-label">Overdue Notices</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏰</div>
          <div className="stat-info">
            <div className="stat-number">{getNotificationsByType('REMINDER')}</div>
            <div className="stat-label">Reminders</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📢</div>
          <div className="stat-info">
            <div className="stat-number">{getNotificationsByType('GENERAL')}</div>
            <div className="stat-label">General</div>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="notification-controls">
        <div className="filter-section">
          <label htmlFor="filter">Filter by Type:</label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="form-select"
          >
            <option value="ALL">All Notifications</option>
            <option value="OVERDUE">Overdue Notices</option>
            <option value="REMINDER">Reminders</option>
            <option value="GENERAL">General</option>
            <option value="WELCOME">Welcome</option>
          </select>
        </div>
        <div className="refresh-section">
          <button
            onClick={fetchNotifications}
            className="btn btn-outline-primary"
            disabled={loading}
          >
            <i className="fas fa-refresh"></i>
            Refresh
          </button>
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="no-notifications">
          <div className="no-notifications-icon">🔔</div>
          <h3>No notifications found</h3>
          <p>
            {filter === 'ALL' 
              ? "You don't have any notifications yet."
              : `No ${filter.toLowerCase()} notifications found.`
            }
          </p>
        </div>
      ) : (
        <div className="notifications-list">
          {filteredNotifications.map((notification) => (
            <div key={notification.notificationId} className={getNotificationClass(notification.ntfType)}>
              <div className="notification-header">
                <div className="notification-type">
                  <span className="notification-icon">
                    {getNotificationIcon(notification.ntfType)}
                  </span>
                  <span className="notification-type-label">
                    {notification.ntfType.charAt(0) + notification.ntfType.slice(1).toLowerCase()}
                  </span>
                </div>
                <div className="notification-date">
                  {formatDate(notification.ntfSentDate)}
                </div>
              </div>
              
              <div className="notification-content">
                <p className="notification-message">{notification.ntfMessage}</p>
              </div>
              
              <div className="notification-actions">
                <button
                  onClick={() => handleDeleteNotification(notification.notificationId)}
                  className="btn btn-sm btn-outline-danger"
                  title="Delete notification"
                >
                  <i className="fas fa-trash"></i>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;