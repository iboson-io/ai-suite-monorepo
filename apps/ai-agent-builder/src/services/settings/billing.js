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
    id: subscription.id,
    planName: subscription.planName ?? subscription.plan_name ?? subscription.name ?? 'Free',
    planPrice: subscription.planPrice ?? subscription.plan_price ?? subscription.price ?? subscription.plan_amount ?? '',
    expiryDate: subscription.expiryDate ?? subscription.expiry_date ?? subscription.renewAt ?? subscription.next_billing_date ?? '',
    billingInterval: subscription.billing_interval ?? subscription.billingInterval ?? 'monthly',
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

export async function fetchCurrentPlanRaw() {
  return await apiService.getCurrentPlan()
}

export async function fetchAvailablePlans() {
  return await apiService.getAvailablePlans()
}

export async function fetchPurchaseHistory(page = 1, limit = 2) {
  return await apiService.getPurchaseHistory(page, limit)
}

export async function cancelSubscription(subscriptionId) {
  return await apiService.cancelSubscription(subscriptionId)
}

export async function upgradePlan(planId, customerData = {}) {
  return await apiService.createSubscription(planId, customerData)
}

export async function getPaymentById(subscriptionId) {
  return await apiService.getPaymentById(subscriptionId)
}

export async function getPaymentByIdNotSubscription(id) {
  return await apiService.getPaymentByIdNotSubscription(id)
}
