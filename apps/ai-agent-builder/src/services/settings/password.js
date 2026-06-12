import { apiService } from '../agentApi.js'
import { API_ENDPOINTS } from '../constants.js'

export async function changePassword({ currentPassword, newPassword }) {
  await apiService.request(API_ENDPOINTS.UPDATE_PASSWORD, {
    method: 'PUT',
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  })
}
