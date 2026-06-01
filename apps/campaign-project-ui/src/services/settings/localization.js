import api from '../api.js'

/** Map raw localization payload to the shape shared settings UI expects. */
export function mapLocalizationSettings(raw) {
  if (!raw || typeof raw !== 'object') return null

  const settings = raw.data?.settings ?? raw.settings ?? raw

  return {
    language: settings.language ?? settings.interface_language ?? settings.interfaceLanguage ?? 'en',
    region: settings.region ?? 'IN',
    timeFormat: settings.timeFormat ?? settings.time_format ?? '24',
    timezone: settings.timezone ?? 'IST',
  }
}

/** Map UI localization state to this app's API request body. */
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
  const response = await api.get('/api/settings/localization')
  return mapLocalizationSettings(response.data?.data?.settings ?? response.data)
}

export async function updateLocalizationSettings(settings) {
  const payload = mapLocalizationToApi(settings)
  const response = await api.put('/api/settings/localization', payload)

  return {
    success: Boolean(response.data?.status ?? response.data?.success ?? response.status === 200),
    data: response.data,
  }
}
