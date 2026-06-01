import api, { TOKEN_KEY } from '../api.js'

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

  const provider = user.authProvider ?? user.loginProvider ?? user.provider
  if (typeof provider === 'string' && provider.toLowerCase() === 'google') {
    return true
  }

  const providers = user.providers ?? user.oauthProviders
  if (Array.isArray(providers) && providers.some((item) => String(item).toLowerCase() === 'google')) {
    return true
  }

  return false
}

/** Map raw `/auth/me` user payload to the shape shared settings UI expects. */
export function mapUserProfile(raw) {
  const user = raw?.data?.user ?? raw?.user ?? raw
  if (!user || typeof user !== 'object') return null

  return {
    username: user.username != null
      ? String(user.username).trim()
      : user.name != null
        ? String(user.name).trim()
        : user.user_name != null
          ? String(user.user_name).trim()
          : '',
    email: user.email != null ? String(user.email).trim() : '',
    profilePictureUrl: user.profilePictureUrl != null
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
  const { data } = await api.get('/auth/me')
  return mapUserProfile(data)
}

export async function updateProfileUsername(username) {
  await api.put('/auth/profile', { username })
}

export async function requestChangeEmail(body = {}) {
  const payload = body.new_email != null
    ? { new_email: body.new_email }
    : body
  await api.post('/auth/change-email/request', payload)
}

export async function verifyChangeEmail(body) {
  await api.post('/auth/change-email/verify', body)
}

export async function resendChangeEmailOtp(body = {}) {
  await api.post('/auth/change-email/resend', body)
}

export function getGoogleConnectUrl() {
  const token = localStorage.getItem(TOKEN_KEY)
  const baseUrl = (api.defaults.baseURL || '').replace(/\/+$/, '')
  const query = new URLSearchParams({ token })
  return `${baseUrl}/auth/google/connect?${query.toString()}`
}

export async function disconnectGoogle() {
  await api.delete('/auth/google')
}

export async function deleteProfilePicture() {
  const { data } = await api.delete('/auth/profile/picture')
  const success = data?.status !== false
  return {
    success,
    message: data?.message ?? '',
  }
}

export async function uploadProfilePicture(formData) {
  const { data } = await api.put('/auth/profile/picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  const user = data?.data?.user ?? data?.user ?? null
  const profilePictureUrl = user?.profilePictureUrl != null
    ? String(user.profilePictureUrl).trim()
    : user?.profile_picture_url != null
      ? String(user.profile_picture_url).trim()
      : data?.profilePictureUrl != null
        ? String(data.profilePictureUrl).trim()
        : data?.profile_picture_url != null
          ? String(data.profile_picture_url).trim()
          : ''

  return { profilePictureUrl }
}
