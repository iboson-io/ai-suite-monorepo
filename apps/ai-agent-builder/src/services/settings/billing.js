import { apiService } from '../agentApi.js'
import { fetchUserProfile } from './userProfile.js'
import {
  initializePaddle,
  redirectToPaddleCheckout,
  clearCheckoutUrlParameters,
} from './paddle.js'

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
    status: subscription.status ?? subscription.subscription_status ?? '',
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

export function getBillingCheckoutConfig() {
  return {
    provider: 'paddle',
  }
}

function extractApprovalUrl(response) {
  return (
    response?.data?.approval_url ||
    response?.data?.subscription?.approval_url ||
    null
  )
}

export async function initiatePlanCheckout(plan, profile = null) {
  let customerData = {
    email: profile?.email || '',
    name: profile?.username || profile?.name || '',
    surname: profile?.surname || profile?.lastName || '',
  }

  if (!customerData.email) {
    try {
      const userProfile = profile || (await fetchUserProfile())
      customerData = {
        email: userProfile?.email || '',
        name: userProfile?.username || userProfile?.name || '',
        surname: userProfile?.surname || userProfile?.lastName || '',
      }
    } catch (error) {
      console.warn('Could not fetch user profile for subscription:', error)
    }
  }

  const response = await upgradePlan(plan.id, customerData)
  const approvalUrl = extractApprovalUrl(response)

  if (response?.status && approvalUrl) {
    return {
      success: true,
      approvalUrl,
      subscription: response.data?.subscription ?? response.data,
    }
  }

  if (response?.status) {
    return {
      success: true,
      immediate: true,
      data: response.data,
    }
  }

  throw new Error(response?.message || 'Failed to create subscription')
}

export async function handlePlanSelect(plan) {
  await initializePaddle()

  const result = await initiatePlanCheckout(plan)

  if (!result.success) {
    throw new Error('Failed to create subscription')
  }

  if (result.approvalUrl) {
    const redirected = redirectToPaddleCheckout(result.approvalUrl)
    if (!redirected) {
      throw new Error('Transaction ID not found in approval URL')
    }
    return result
  }

  if (result.immediate) {
    return result
  }

  throw new Error('Unexpected checkout response')
}

export async function refreshSubscriptionAfterCheckout() {
  clearCheckoutUrlParameters()
  return fetchSubscription()
}

export async function setupPaddleCheckout(onCheckoutComplete) {
  return initializePaddle(onCheckoutComplete)
}

export { clearCheckoutUrlParameters, isPaddleCheckoutMessage } from './paddle.js'

export async function getPaymentById(subscriptionId) {
  return await apiService.getPaymentById(subscriptionId)
}

export async function getPaymentByIdNotSubscription(id) {
  return await apiService.getPaymentByIdNotSubscription(id)
}
