export function mapPrivacySettings() {
  return {
    aiLearningConsent: false,
    analyticsConsent: false,
  }
}

export async function requestClearData() {
  throw new Error('Data clearing is not available yet.')
}

export async function deleteAccountData() {
  throw new Error('Data clearing is not available yet.')
}

export async function fetchPrivacySettings() {
  return mapPrivacySettings()
}

export async function updateAiLearningConsent() {
  // No-op until backend endpoint is available.
}

export async function updateAnalyticsConsent() {
  // No-op until backend endpoint is available.
}
