import { apiService } from '../agentApi.js'
import { parseAuthError } from './errors.js'

const EMAIL_PROVIDERS = {
  gmail: 'https://mail.google.com',
  outlook: 'https://outlook.live.com',
  yahoo: 'https://mail.yahoo.com',
  protonmail: 'https://mail.proton.me',
}

export function getEmailProviderUrl(email) {
  const domain = String(email ?? '').split('@')[1]?.toLowerCase() ?? ''

  if (domain.includes('outlook') || domain.includes('hotmail') || domain.includes('live')) {
    return EMAIL_PROVIDERS.outlook
  }
  if (domain.includes('yahoo')) {
    return EMAIL_PROVIDERS.yahoo
  }
  if (domain.includes('proton')) {
    return EMAIL_PROVIDERS.protonmail
  }

  return EMAIL_PROVIDERS.gmail
}

export async function resendVerificationEmail(email) {
  const trimmed = String(email ?? '').trim()

  if (!trimmed) {
    return { success: false, message: 'No email address found' }
  }

  try {
    const data = await apiService.resendVerification(trimmed)
    return {
      success: true,
      message: data?.message ?? 'Verification email sent! Please check your inbox.',
    }
  } catch (error) {
    return { success: false, message: parseAuthError(error) }
  }
}
