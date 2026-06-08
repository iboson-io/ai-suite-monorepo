import DefaultAppLogo from '../../assets/images/AiIcon.svg'

const COMPOSIO_GMAIL_LOGO = 'https://logos.composio.dev/api/gmail'

/** Map raw starter card payload to the shape shared UI expects. */
export function mapStarterCard(raw) {
  if (raw == null) return null

  const title = raw.title ?? raw.label ?? raw.name ?? ''
  const description = raw.description ?? raw.message ?? raw.subtitle ?? ''
  const prompt = raw.prompt ?? raw.promptText ?? raw.value ?? null
  const icon = raw.icon ?? raw.iconSrc ?? raw.logo ?? null

  if (!title && !description) return null

  return {
    icon,
    title,
    description,
    prompt: prompt != null ? String(prompt) : null,
  }
}

export function getAgentToolCards() {
  return [
    mapStarterCard({
      icon: COMPOSIO_GMAIL_LOGO,
      title: 'Gmail',
      description: 'Send and manage emails',
    }),
    mapStarterCard({
      icon: DefaultAppLogo,
      title: 'Other tools',
      description: 'Connect apps & integrations',
    }),
  ].filter(Boolean)
}

export function getStarterCards() {
  return {
    cards: [],
  }
}
