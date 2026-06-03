import { apiService } from '../agentApi.js'
import { mapCheckAccountResponse } from './signIn.js'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function checkAccountForReset(email) {
  const trimmed = String(email ?? '').trim()
  if (!trimmed || !emailRegex.test(trimmed)) {
    return { success: false, message: 'Enter a valid email address' }
  }
  return { success: true }
}

export function mapForgotPasswordResponse(data) {
  return {
    success: Boolean(data?.status ?? data?.success),
    message: data?.message ?? data?.error ?? 'Unable to send reset link.',
  }
}

export async function requestForgotPassword(email) {
  const data = await apiService.forgotPassword(email)
  return mapForgotPasswordResponse(data)
}
