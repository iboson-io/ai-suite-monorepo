import api from '../api.js'

function mapUsageBucket(raw) {
  if (!raw || typeof raw !== 'object') {
    return { used: 0, total: 0 }
  }

  return {
    used: raw.used ?? raw.used_count ?? raw.usedCount ?? 0,
    total: raw.total ?? raw.limit ?? raw.max ?? 0,
  }
}

/** Map raw subscription payload to the shape shared settings UI expects. */
export function mapSubscription(raw) {
  if (!raw || typeof raw !== 'object') return null

  const subscription = raw.data?.subscription ?? raw.subscription ?? raw

  return {
    planName: subscription.planName ?? subscription.plan_name ?? subscription.planType ?? subscription.plan_type ?? '',
    planPrice: subscription.planPrice ?? subscription.plan_price ?? subscription.price ?? '',
    expiryDate: subscription.expiryDate ?? subscription.expiry_date ?? subscription.renewAt ?? subscription.renew_at ?? '',
    credits: mapUsageBucket(subscription.credits),
    posts: mapUsageBucket(subscription.posts),
    images: mapUsageBucket(subscription.images),
    videos: mapUsageBucket(subscription.videos),
    products: mapUsageBucket(subscription.products),
  }
}

export async function fetchSubscription() {
  const { data } = await api.get('/api/subscription')
  return mapSubscription(data)
}
