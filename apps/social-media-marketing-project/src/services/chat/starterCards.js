import HomeIcon from '../../assets/images/HomeIcon.svg'
import DateIcon from '../../assets/images/DateIcon.svg'
import GalleryIcon from '../../assets/images/GalleryIcon.svg'

/** Map raw starter card payload to the shape shared UI expects. */
export function mapStarterCard(raw) {
  if (raw == null) return null

  const title = raw.title ?? raw.label ?? ''
  const description = raw.description ?? raw.message ?? raw.subtitle ?? ''
  const prompt = raw.prompt ?? raw.promptText ?? raw.value ?? null
  const icon = raw.icon ?? raw.iconSrc ?? null

  if (!title && !description) return null

  return {
    icon,
    title,
    description,
    prompt: prompt != null ? String(prompt) : null,
  }
}

const DEFAULT_CARDS = [
  {
    icon: HomeIcon,
    title: 'Set Up Your Brand',
    description: "Let me learn your brand's style, tone, and personality.",
    prompt: 'Set Up My Brand',
  },
  {
    icon: DateIcon,
    title: 'Plan Weekly Posts',
    description: 'AI suggests days, times, and post ideas for your brand.',
    prompt: 'Plan Weekly Posts',
  },
  {
    icon: GalleryIcon,
    title: 'Create Social Media Posts',
    description: 'AI generates engaging posts, and captions for your brand.',
    prompt: 'Create Social Media Posts',
  },
]

export function getStarterCards() {
  return {
    heading: 'Start with the example below',
    cards: DEFAULT_CARDS.map(mapStarterCard).filter(Boolean),
  }
}
