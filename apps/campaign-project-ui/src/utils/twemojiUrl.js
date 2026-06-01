/**
 * Build Twemoji 72x72 asset URL for an emoji (works on Windows for flags, etc.).
 * @see https://github.com/twitter/twemoji
 */
const TW_BASE =
  'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72'

/**
 * @param {string} emoji Single emoji (may be ZWJ sequence)
 * @returns {string} e.g. "1f1e8-1f1f3"
 */
export function emojiToTwemojiHex(emoji) {
  if (!emoji) return ''
  const parts = []
  for (let i = 0; i < emoji.length; ) {
    const cp = emoji.codePointAt(i)
    parts.push(cp.toString(16))
    i += cp > 0xffff ? 2 : 1
  }
  return parts.join('-')
}

/**
 * @param {string} emoji
 * @returns {string}
 */
export function twemoji72PngUrl(emoji) {
  return `${TW_BASE}/${emojiToTwemojiHex(emoji)}.png`
}
