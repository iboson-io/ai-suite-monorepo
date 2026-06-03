import { apiService } from '../agentApi.js'

export function mapResetPasswordToApi({ token, password }) {
  return {
    token,
    new_password: password,
  }
}

export function mapResetPasswordResponse(data) {
  return {
    success: Boolean(data?.status ?? data?.success),
    message: data?.message ?? data?.error ?? 'Unable to update password.',
  }
}

export async function resetPassword({ token, password }) {
  const data = await apiService.confirmResetPassword(
    token,
    mapResetPasswordToApi({ token, password }).new_password
  )
  return mapResetPasswordResponse(data)
}
