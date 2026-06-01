/** Demo suppressions. Replace with API data via `:suppressions` on ListSuppressions.vue */
export const SEED_LIST_SUPPRESSIONS = [
  {
    id: 1,
    contact: 'John@gmail.com',
    reason: 'Unsubscribed',
    channel: 'Email',
    suppressedAt: '2026-05-05',
    source: 'User'
  },
  {
    id: 2,
    contact: 'sara@yahoo.com',
    reason: 'Hard bounce',
    channel: 'Email',
    suppressedAt: '2026-04-28',
    source: 'System'
  },
  {
    id: 3,
    contact: 'mike@gmail.com',
    reason: 'Marked as spam',
    channel: 'Email',
    suppressedAt: '2026-04-20',
    source: 'Gmail'
  },
  {
    id: 4,
    contact: '+1 555 010 1234',
    reason: 'STOP reply',
    channel: 'SMS',
    suppressedAt: '2026-04-18',
    source: 'User'
  },
  {
    id: 5,
    contact: '+1 855 010 1453',
    reason: 'Delivery failed',
    channel: 'SMS',
    suppressedAt: '2026-04-14',
    source: 'Carrier'
  }
]

export const SUPPRESSION_REASON_OPTIONS = [
  'Any reason',
  'Unsubscribed',
  'Hard bounce',
  'Marked as spam',
  'STOP reply',
  'Delivery failed'
]
