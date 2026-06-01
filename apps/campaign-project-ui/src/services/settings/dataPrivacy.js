import api from '../api.js'

/** Map raw privacy payload to the shape shared settings UI expects. */
export function mapPrivacySettings(raw) {
  if (!raw || typeof raw !== 'object') return null

  const settings = raw.data?.settings ?? raw.settings ?? raw

  return {
    aiLearningConsent: Boolean(
      settings.aiLearningConsent ??
      settings.ai_learning_consent ??
      settings.aiLearning ??
      settings.ai_learning
    ),
    analyticsConsent: Boolean(
      settings.analyticsConsent ??
      settings.analytics_consent ??
      settings.analyticsSharing ??
      settings.analytics_sharing
    ),
  }
}

/** Map UI privacy toggles to this app's API request body. */
export function mapPrivacyToApi({ aiLearningConsent, analyticsConsent }) {
  return {
    ai_learning_consent: aiLearningConsent,
    analytics_consent: analyticsConsent,
  }
}

export async function requestClearData() {
  await api.post('/auth/account/request-clear-data')
}

export async function deleteAccountData(code) {
  await api.delete('/auth/account/data', { data: { code } })
}

export async function fetchPrivacySettings() {
  const response = await api.get('/api/settings/privacy')
  return mapPrivacySettings(response.data?.data?.settings ?? response.data)
}

export async function updateAiLearningConsent(enabled) {
  await api.put('/api/settings/privacy', { ai_learning_consent: enabled })
}

export async function updateAnalyticsConsent(enabled) {
  await api.put('/api/settings/privacy', { analytics_consent: enabled })
}
