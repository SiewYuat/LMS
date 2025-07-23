import React, { useState, useEffect } from 'react';
import notificationService from '../../services/notificationService';
import memberService from '../../services/memberService';
import FormModal from '../../components/FormModal';
import { useAuth } from '../../contexts/AuthContext';
import './AdminNotifications.css';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSendModal, setShowSendModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [selectedMember, setSelectedMember] = useState('');
  const [notificationType, setNotificationType] = useState('GENERAL');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [bulkMessage, setBulkMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  // Predefined message templates
  const messageTemplates = {
    GENERAL: '',
    WELCOME: 'Welcome to the library! Your account has been approved and you can now start borrowing books.',
    REMINDER: 'This is a friendly reminder about your borrowed books. Please check your due dates.',
    OVERDUE: 'You have overdue books. Please return them as soon as possible to avoid late fees.',
    MAINTENANCE: 'The library will be closed for maintenance. Please check our website for updates.',
    NEW_BOOKS: 'New books have been added to our collection. Visit us to check out the latest arrivals!',
    HOLIDAY: 'Please note our holiday hours. The library schedule may be different during holidays.',
    EVENT: 'Join us for upcoming library events and programs. Check the events calendar for details.'
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [notificationsData, membersData] = await Promise.all([
        notificationService.getAllNotifications(),
        memberService.getAllMembers()
      ]);
      
      setNotifications(notificationsData);
      setMembers(membersData);
    } catch (err) {
      console.error('Error fetching data:', err);
      let errorMessage = 'Failed to load data';
      if (err.response?.data?.message) {
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

  const handleSendNotification = async (e) => {
    e.preventDefault();
    
    if (!selectedMember || !notificationMessage.trim()) {
      alert('Please select a member and enter a message.');
      return;
    }

    try {
      setSending(true);
      
      const member = members.find(m => m.memberId === parseInt(selectedMember));
      if (!member) {
        throw new Error('Selected member not found');
      }

      let response;
      
      switch (notificationType) {
        case 'WELCOME':
          response = await notificationService.sendWelcomeNotification(
            member.memberId, 
            `${member.firstName} ${member.lastName}`
          );
          break;
        case 'OVERDUE':
          response = await notificationService.sendOverdueNotification(
            member.memberId, 
            'Book Title', // This would be dynamic in real usage
            5 // This would be calculated days overdue
          );
          break;
        case 'REMINDER':
          response = await notificationService.sendReminderNotification(
            member.memberId,
            'Book Title', // This would be dynamic in real usage
            new Date().toISOString().split('T')[0] // Today's date as due date
          );
          break;
        default:
          response = await notificationService.sendGeneralNotification(
            member.memberId,
            notificationMessage
          );
      }

      // Refresh notifications list
      await fetchData();
      
      // Reset form and close modal
      setSelectedMember('');
      setNotificationType('GENERAL');
      setNotificationMessage('');
      setShowSendModal(false);
      
      alert('Notification sent successfully!');
    } catch (err) {
      console.error('Error sending notification:', err);
      let errorMessage = 'Failed to send notification';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data && typeof err.response.data === 'string') {
        errorMessage = err.response.data;
      } else if (err.message) {
        errorMessage = err.message;
      }
      alert(errorMessage);
    } finally {
      setSending(false);
    }
  };

  const handleBulkNotification = async (e) => {
    e.preventDefault();
    
    if (!bulkMessage.trim()) {
      alert('Please enter a message for the bulk notification.');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to send this notification to all active members?\n\n"${bulkMessage}"`
    );
    
    if (!confirmed) return;

    try {
      setSending(true);
      
      await notificationService.sendBulkNotification(bulkMessage);
      
      // Refresh notifications list
      await fetchData();
      
      // Reset form and close modal
      setBulkMessage('');
      setShowBulkModal(false);
      
      alert('Bulk notification sent successfully to all active members!');
    } catch (err) {
      console.error('Error sending bulk notification:', err);
      let errorMessage = 'Failed to send bulk notification';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data && typeof err.response.data === 'string') {
        errorMessage = err.response.data;
      } else if (err.message) {
        errorMessage = err.message;
      }
      alert(errorMessage);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    const confirmed = window.confirm('Are you sure you want to delete this notification?');
    if (!confirmed) return;

    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(notifications.filter(n => n.notificationId !== notificationId));
      alert('Notification deleted successfully!');
    } catch (err) {
      console.error('Error deleting notification:', err);
      let errorMessage = 'Failed to delete notification';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      alert(errorMessage);
    }
  };

  const handleTemplateChange = (type) => {
    setNotificationType(type);
    if (messageTemplates[type]) {
      setNotificationMessage(messageTemplates[type]);
    } else {
      setNotificationMessage('');
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'ALL' || notification.ntfType === filter;
    const matchesSearch = !searchTerm || 
      notification.ntfMessage.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.memberName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.ntfType.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getNotificationIcon = (type) => {
    const icons = {
      'OVERDUE': '⚠️',
      'REMINDER': '⏰',
      'GENERAL': '📢',
      'WELCOME': '👋',
      'MAINTENANCE': '🔧',
      'NEW_BOOKS': '📚',
      'HOLIDAY': '🎉',
      'EVENT': '📅'
    };
    return icons[type] || '📨';
  };

  const getNotificationClass = (type) => {
    const baseClass = 'notification-item';
    const typeClass = `notification-${type.toLowerCase()}`;
    return `${baseClass} ${typeClass}`;
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

  // Filter active members for the dropdown
  const activeMembers = members.filter(member => member.memberStatus === 'ACTIVE');

  if (loading) {
    return (
      <div className="admin-notifications">
        <div className="loading">Loading notifications...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-notifications">
        <div className="error-message">
          {error}
        </div>
        <div style={{ textAlign: 'center' }}>
          <button onClick={fetchData} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-notifications">
      <div className="page-header">
        <h1>Notification Management</h1>
        <p>Send and manage notifications to library members</p>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button 
          className="btn btn-primary"
          onClick={() => setShowSendModal(true)}
        >
          <i className="fas fa-paper-plane"></i>
          Send to Member
        </button>
        <button 
          className="btn btn-warning"
          onClick={() => setShowBulkModal(true)}
        >
          <i className="fas fa-broadcast-tower"></i>
          Send to All
        </button>
        <button 
          className="btn btn-outline-secondary"
          onClick={fetchData}
        >
          <i className="fas fa-refresh"></i>
          Refresh
        </button>
      </div>

      {/* Notification Statistics */}
      <div className="notification-stats">
        <div className="stat-card">
          <div className="stat-icon">📨</div>
          <div className="stat-info">
            <div className="stat-number">{notifications.length}</div>
            <div className="stat-label">Total Sent</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <div className="stat-number">{getNotificationsByType('OVERDUE')}</div>
            <div className="stat-label">Overdue</div>
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
        <div className="stat-card">
          <div className="stat-icon">👋</div>
          <div className="stat-info">
            <div className="stat-number">{getNotificationsByType('WELCOME')}</div>
            <div className="stat-label">Welcome</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <div className="stat-number">{activeMembers.length}</div>
            <div className="stat-label">Active Members</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="notification-controls">
        <div className="filter-section">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="form-select"
          >
            <option value="ALL">All Types</option>
            <option value="OVERDUE">Overdue</option>
            <option value="REMINDER">Reminders</option>
            <option value="GENERAL">General</option>
            <option value="WELCOME">Welcome</option>
          </select>
        </div>
        <div className="search-section">
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
          />
          <i className="fas fa-search search-icon"></i>
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="no-notifications">
          <div className="no-notifications-icon">🔔</div>
          <h3>No notifications found</h3>
          <p>
            {filter === 'ALL' 
              ? "No notifications have been sent yet."
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
                    {notification.ntfType}
                  </span>
                </div>
                <div className="notification-meta">
                  <span className="notification-member">
                    To: {notification.memberName || `Member #${notification.memberId}`}
                  </span>
                  <span className="notification-date">
                    {formatDate(notification.ntfSentDate)}
                  </span>
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

      {/* Send Notification Modal */}
      <FormModal 
        show={showSendModal} 
        onHide={() => setShowSendModal(false)}
        title="Send Notification to Member"
        size="medium"
      >
        <form onSubmit={handleSendNotification}>
          <div className="form-group">
            <label htmlFor="member-select">Select Member *</label>
            <select
              id="member-select"
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="form-select"
              required
            >
              <option value="">Choose a member...</option>
              {activeMembers.map((member) => (
                <option key={member.memberId} value={member.memberId}>
                  {member.firstName} {member.lastName} ({member.userName})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="notification-type">Notification Type</label>
            <select
              id="notification-type"
              value={notificationType}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="form-select"
            >
              <option value="GENERAL">General</option>
              <option value="WELCOME">Welcome</option>
              <option value="REMINDER">Reminder</option>
              <option value="OVERDUE">Overdue</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="NEW_BOOKS">New Books</option>
              <option value="HOLIDAY">Holiday Notice</option>
              <option value="EVENT">Event</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="notification-message">Message *</label>
            <textarea
              id="notification-message"
              value={notificationMessage}
              onChange={(e) => setNotificationMessage(e.target.value)}
              className="form-textarea"
              rows="4"
              placeholder="Enter your message here..."
              required
            />
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              onClick={() => setShowSendModal(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={sending}
            >
              {sending ? 'Sending...' : 'Send Notification'}
            </button>
          </div>
        </form>
      </FormModal>

      {/* Bulk Notification Modal */}
      <FormModal 
        show={showBulkModal} 
        onHide={() => setShowBulkModal(false)}
        title="Send Bulk Notification to All Active Members"
        size="medium"
      >
        <form onSubmit={handleBulkNotification}>
          <div className="alert alert-warning">
            <i className="fas fa-exclamation-triangle"></i>
            This notification will be sent to all <strong>{activeMembers.length}</strong> active members.
          </div>

          <div className="form-group">
            <label htmlFor="bulk-message">Message *</label>
            <textarea
              id="bulk-message"
              value={bulkMessage}
              onChange={(e) => setBulkMessage(e.target.value)}
              className="form-textarea"
              rows="4"
              placeholder="Enter the message to send to all active members..."
              required
            />
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              onClick={() => setShowBulkModal(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-warning"
              disabled={sending}
            >
              {sending ? 'Sending...' : `Send to ${activeMembers.length} Members`}
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
};

export default AdminNotifications;