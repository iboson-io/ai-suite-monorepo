import api from '../api.js'

/** Map UI password fields to this app's API request body. */
export function mapPasswordToApi({ currentPassword, newPassword }) {
  return {
    current_password: currentPassword ?? '',
    new_password: newPassword,
  }
}

export async function changePassword({ currentPassword, newPassword }) {
  await api.put('/auth/change-password', mapPasswordToApi({ currentPassword, newPassword }))
}
