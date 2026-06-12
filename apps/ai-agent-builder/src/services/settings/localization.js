export function mapLocalizationSettings() {
  return {
    language: 'en',
    region: 'IN',
    timeFormat: '24',
    timezone: 'IST',
  }
}

export function mapLocalizationToApi({
  interfaceLanguage,
  region,
  timeFormat,
  timezone,
  timezoneDescription,
}) {
  return {
    language: interfaceLanguage,
    region,
    time_format: timeFormat,
    timezone,
    timezoneDescription,
  }
}

export async function fetchLocalizationSettings() {
  return mapLocalizationSettings()
}

export async function updateLocalizationSettings() {
  return { success: true, data: null }
}
