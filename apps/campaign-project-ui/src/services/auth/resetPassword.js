import api from '../api.js'

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
  const { data } = await api.post('/auth/reset-password', mapResetPasswordToApi({ token, password }))
  return mapResetPasswordResponse(data)
}
