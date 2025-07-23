import apiService from './apiService'

const notificationService = {
  // Get all notifications
  getAllNotifications: async () => {
    const response = await apiService.get('/notifications')
    return response.data
  },

  // Get notifications by member ID
  getNotificationsByMember: async (memberId) => {
    const response = await apiService.get(`/notifications/member/${memberId}`)
    return response.data
  },

  // Get notification by ID
  getNotificationById: async (id) => {
    const response = await apiService.get(`/notifications/${id}`)
    return response.data
  },

  // Create notification (Admin only)
  createNotification: async (notificationData) => {
    const response = await apiService.post('/notifications', notificationData)
    return response.data
  },

  // Update notification
  updateNotification: async (id, notificationData) => {
    const response = await apiService.put(`/notifications/${id}`, notificationData)
    return response.data
  },

  // Delete notification
  deleteNotification: async (id) => {
    const response = await apiService.delete(`/notifications/${id}`)
    return response.data
  },

  // Send welcome notification
  sendWelcomeNotification: async (memberId, memberName) => {
    const response = await apiService.post('/notifications/welcome', {
      memberId,
      memberName
    })
    return response.data
  },

  // Send overdue notification
  sendOverdueNotification: async (memberId, bookTitle, daysOverdue) => {
    const response = await apiService.post('/notifications/overdue', {
      memberId,
      bookTitle,
      daysOverdue
    })
    return response.data
  },

  // Send reminder notification
  sendReminderNotification: async (memberId, bookTitle, dueDate) => {
    const response = await apiService.post('/notifications/reminder', {
      memberId,
      bookTitle,
      dueDate
    })
    return response.data
  },

  // Send general notification
  sendGeneralNotification: async (memberId, message) => {
    const response = await apiService.post('/notifications/general', {
      memberId,
      message
    })
    return response.data
  },

  // Send bulk notification to all active members
  sendBulkNotification: async (message, type = 'GENERAL') => {
    const response = await apiService.post('/notifications/bulk', {
      type,
      message
    })
    return response.data
  },

  // Get recent notifications (for admin dashboard)
  getRecentNotifications: async (limit = 10) => {
    const response = await apiService.get(`/notifications/recent?limit=${limit}`)
    return response.data
  },

  // Mark notification as read
  markAsRead: async (id) => {
    const response = await apiService.put(`/notifications/${id}/read`)
    return response.data
  },

  // Get unread notifications count
  getUnreadCount: async (memberId) => {
    const response = await apiService.get(`/notifications/member/${memberId}/unread-count`)
    return response.data
  }
}

export default notificationService