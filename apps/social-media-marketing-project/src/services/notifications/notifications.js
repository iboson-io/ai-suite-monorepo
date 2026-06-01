import api from '../api.js'

const BADGE_CLASSES = {
  review: 'bg-blue-100 text-blue-200 border border-blue-100',
  suggestion: 'bg-orange-25 text-orange-200 border border-orange-100',
  reminder: 'bg-[#FFF7D6] text-[#B38600] border border-[#F5CD47]',
  error: 'bg-error-25 text-error-600 border border-error-200',
  success: 'bg-green-100 text-green-200 border border-green-100',
  security: 'bg-red-100 text-red-200 border border-red-100',
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

/** Map raw API notification payload to the shape shared UI expects. */
export function mapNotification(raw) {
  const type = raw.status ?? raw.type ?? 'review'

  return {
    id: raw.id,
    type,
    title: raw.title ?? '',
    description: raw.message ?? raw.description ?? '',
    badge: raw.badge ?? formatBadgeLabel(type),
    badgeClass: raw.badgeClass ?? BADGE_CLASSES[type] ?? 'bg-gray-100 text-gray-600 border border-gray-200',
    time: raw.time ?? formatTimeAgo(raw.createdAt ?? raw.created_at),
    isRead: Boolean(raw.isRead ?? raw.is_read),
    postId: raw.postId ?? raw.post_id ?? null,
    metadata: raw.metadata ?? null,
  }
}

export async function fetchNotifications() {
  const { data } = await api.get('/api/notifications')

  const list =
    (data?.success && Array.isArray(data.notifications) && data.notifications) ||
    (Array.isArray(data?.data?.notifications) && data.data.notifications) ||
    (Array.isArray(data?.notifications) && data.notifications) ||
    (Array.isArray(data?.data) && data.data) ||
    []

  return list.map(mapNotification)
}

export async function markNotificationRead(notificationId) {
  await api.patch(`/api/notifications/${notificationId}/read`)
}

export async function clearAllNotifications() {
  await api.delete('/api/notifications')
}
