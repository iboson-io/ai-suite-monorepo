import api from '../api.js'
import { mapCheckAccountResponse } from './signIn.js'

export async function checkAccountForReset(email) {
  const { data } = await api.post('/auth/check-account', { email })
  return mapCheckAccountResponse(data)
}

export function mapForgotPasswordResponse(data) {
  return {
    success: Boolean(data?.status ?? data?.success),
    message: data?.message ?? data?.error ?? 'Unable to send reset link.',
  }
}

export async function requestForgotPassword(email) {
  const { data } = await api.post('/auth/forgot-password', { email })
  return mapForgotPasswordResponse(data)
}
