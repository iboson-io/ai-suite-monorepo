import api from '../api.js'

export function getGoogleAuthUrl() {
  const baseUrl = (api.defaults.baseURL || '').replace(/\/+$/, '')
  return `${baseUrl}/auth/google`
}
