import { apiService } from '../agentApi.js'

function mapUsageBucket(raw) {
  if (!raw || typeof raw !== 'object') {
    return { used: 0, total: 0 }
  }

  return {
    used: raw.used ?? raw.used_count ?? raw.usedCount ?? 0,
    total: raw.total ?? raw.limit ?? raw.max ?? 0,
  }
}

export function mapSubscription(raw) {
  if (!raw || typeof raw !== 'object') return null

  const subscription = raw.data?.subscription ?? raw.subscription ?? raw.data ?? raw

  return {
    planName: subscription.planName ?? subscription.plan_name ?? subscription.name ?? 'Free',
    planPrice: subscription.planPrice ?? subscription.plan_price ?? subscription.price ?? '',
    expiryDate: subscription.expiryDate ?? subscription.expiry_date ?? subscription.renewAt ?? '',
    credits: mapUsageBucket(subscription.credits),
    posts: mapUsageBucket(subscription.posts),
    images: mapUsageBucket(subscription.images),
    videos: mapUsageBucket(subscription.videos),
    products: mapUsageBucket(subscription.products),
  }
}

export async function fetchSubscription() {
  try {
    const data = await apiService.getCurrentPlan()
    return mapSubscription(data)
  } catch {
    return mapSubscription({ plan_name: 'Free' })
  }
}
