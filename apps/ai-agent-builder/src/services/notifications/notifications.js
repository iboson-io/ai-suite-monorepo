import { apiService } from '../agentApi.js'

const BADGE_CLASSES = {
  review: 'bg-blue-100 text-blue-200 border border-blue-100',
  suggestion: 'bg-orange-25 text-orange-200 border border-orange-100',
  reminder: 'bg-[#FFF7D6] text-[#B38600] border border-[#F5CD47]',
  error: 'bg-error-25 text-error-600 border border-error-200',
  success: 'bg-green-100 text-green-200 border border-green-100',
  security: 'bg-red-100 text-red-200 border border-red-100',
  info: 'bg-blue-100 text-blue-200 border border-blue-100',
}

function formatTimeAgo(createdAt) {
  const created = new Date(createdAt)
  if (Number.isNaN(created.getTime())) return 'Recently'

  const diffMs = Date.now() - created.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
}

function formatBadgeLabel(type) {
  if (!type || typeof type !== 'string') return 'Update'
  return type.charAt(0).toUpperCase() + type.slice(1)
}

function parseReadStatus(raw) {
  if (typeof raw.read_status === 'string') {
    return raw.read_status.toLowerCase() === 'read'
  }
  if (typeof raw.isRead === 'boolean') return raw.isRead
  if (typeof raw.is_read === 'boolean') return raw.is_read
  if (typeof raw.read === 'boolean') return raw.read
  return false
}

function mapNotification(raw) {
  if (!raw || typeof raw !== 'object') return null

  const id = raw.id ?? raw._id
  if (id == null) return null

  const type = raw.type ?? 'info'

  return {
    id,
    type,
    title: raw.title ?? raw.subject ?? 'Notification',
    description: raw.content ?? raw.description ?? raw.message ?? raw.body ?? '',
    badge: raw.badge ?? raw.category ?? formatBadgeLabel(type),
    badgeClass: raw.badgeClass ?? BADGE_CLASSES[type] ?? BADGE_CLASSES.info,
    time: raw.time ?? formatTimeAgo(raw.created_at ?? raw.createdAt),
    isRead: parseReadStatus(raw),
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
