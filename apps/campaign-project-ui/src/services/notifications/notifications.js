const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: 'review',
    title: 'AI draft ready for review',
    description: 'Your post draft for "New Product Launch" is ready. Review and approve to publish.',
    badge: 'Review',
    badgeClass: 'bg-blue-100 text-blue-200 border border-blue-100',
    time: 'Just now',
    isRead: false,
  },
  {
    id: 2,
    type: 'review',
    title: 'AI suggested a rewrite',
    description: 'A better headline is recommended for your blog post "Top 10 Social Tips".',
    badge: 'Suggestion',
    badgeClass: 'bg-orange-25 text-orange-200 border border-orange-100',
    time: '15 minutes ago',
    isRead: false,
  },
  {
    id: 3,
    type: 'reminder',
    title: 'Scheduled post pending approval',
    description: '"Black Friday Offer" is scheduled for tomorrow. Approve before publishing.',
    badge: 'Reminder',
    badgeClass: 'bg-[#FFF7D6] text-[#B38600] border border-[#F5CD47]',
    time: '1 hour ago',
    isRead: false,
  },
  {
    id: 4,
    type: 'error',
    title: 'Publishing failed',
    description: 'Instagram API connection failed. Reconnect to continue auto-posting.',
    badge: 'Error',
    badgeClass: 'bg-error-25 text-error-600 border border-error-200',
    time: '2 hours ago',
    isRead: false,
  },
]

export async function fetchNotifications() {
  return MOCK_NOTIFICATIONS.map((item) => ({ ...item }))
}

export async function markNotificationRead(_notificationId) {
  // Campaign app uses mock notifications — no API yet.
}

export async function clearAllNotifications() {
  // Campaign app uses mock notifications — no API yet.
}
