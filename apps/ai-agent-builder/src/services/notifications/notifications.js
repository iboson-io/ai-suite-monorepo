import { apiService } from '../agentApi.js'

function mapNotification(raw) {
  if (!raw || typeof raw !== 'object') return null

  const id = raw.id ?? raw._id
  if (id == null) return null

  return {
    id,
    type: raw.type ?? 'info',
    title: raw.title ?? raw.subject ?? 'Notification',
    description: raw.description ?? raw.message ?? raw.body ?? '',
    badge: raw.badge ?? raw.category ?? '',
    badgeClass: raw.badgeClass ?? 'bg-blue-100 text-blue-200 border border-blue-100',
    time: raw.time ?? raw.created_at ?? raw.createdAt ?? '',
    isRead: Boolean(raw.isRead ?? raw.is_read ?? raw.read),
  }
}

function extractNotificationList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.notifications)) return data.notifications
  if (Array.isArray(data?.data?.notifications)) return data.data.notifications
  if (Array.isArray(data?.data)) return data.data
  return []
}

export async function fetchNotifications() {
  try {
    const data = await apiService.getNotifications()
    return extractNotificationList(data).map(mapNotification).filter(Boolean)
  } catch (error) {
    console.error('Failed to fetch notifications:', error)
    return []
  }
}

export async function markNotificationRead(notificationId) {
  await apiService.markNotificationAsRead(notificationId)
}

export async function clearAllNotifications() {
  await apiService.clearAllNotifications()
}
