import { apiService } from '../agentApi.js'
import { API_BASE_URL } from '../constants.js'
import { TOKEN_KEY } from '../api.js'

export { TOKEN_KEY }
export { parseSettingsError } from './errors.js'

function readIsGoogleLinked(user) {
  if (!user || typeof user !== 'object') return false

  const flags = [
    user.isGoogleLinked,
    user.googleLinked,
    user.hasGoogleLinked,
    user.googleConnected,
  ]

  for (const flag of flags) {
    if (flag === true) return true
    if (flag === false) return false
  }

  const googleId = user.googleId ?? user.google_id
  if (googleId != null && String(googleId).trim() !== '') return true

  return false
}

export function mapUserProfile(raw) {
  const user = raw?.data?.user ?? raw?.user ?? raw?.data ?? raw
  if (!user || typeof user !== 'object') return null

  return {
    username:
      user.username != null
        ? String(user.username).trim()
        : user.fullName != null
          ? String(user.fullName).trim()
          : user.name != null
            ? String(user.name).trim()
            : '',
    email: user.email != null ? String(user.email).trim() : '',
    profilePictureUrl:
      user.profilePictureUrl != null
        ? String(user.profilePictureUrl).trim()
        : user.profile_picture_url != null
          ? String(user.profile_picture_url).trim()
          : user.avatar != null
            ? String(user.avatar).trim()
            : '',
    isGoogleLinked: readIsGoogleLinked(user),
  }
}

export async function fetchUserProfile() {
  const data = await apiService.getProfile()
  return mapUserProfile(data)
}

export async function updateProfileUsername(username) {
  await apiService.request('/api/user/profile', {
    method: 'PUT',
    body: JSON.stringify({ name: username }),
  })
}

export async function requestChangeEmail(body = {}) {
  throw new Error('Email change is not available yet.')
}

export async function verifyChangeEmail() {
  throw new Error('Email change is not available yet.')
}

export async function resendChangeEmailOtp() {
  throw new Error('Email change is not available yet.')
}

export function getGoogleConnectUrl() {
  const token = localStorage.getItem(TOKEN_KEY)
  const baseUrl = (API_BASE_URL || '').replace(/\/+$/, '')
  const query = new URLSearchParams({ token: token || '' })
  return `${baseUrl}/api/auth/google/connect?${query.toString()}`
}

export async function disconnectGoogle() {
  throw new Error('Google disconnect is not available yet.')
}

export async function deleteProfilePicture() {
  await apiService.request('/api/user/profile-picture', { method: 'DELETE' })
  return { success: true, message: '' }
}

export async function uploadProfilePicture(formDataOrFile) {
  const file =
    formDataOrFile instanceof FormData
      ? formDataOrFile.get('profile_picture') ?? formDataOrFile.get('file')
      : formDataOrFile

  const data = await apiService.updateProfilePicture(file)
  const user = data?.data?.user ?? data?.user ?? null
  const profilePictureUrl =
    user?.profilePictureUrl ??
    user?.profile_picture_url ??
    data?.profilePictureUrl ??
    data?.profile_picture_url ??
    ''

  return { profilePictureUrl: String(profilePictureUrl || '') }
}
