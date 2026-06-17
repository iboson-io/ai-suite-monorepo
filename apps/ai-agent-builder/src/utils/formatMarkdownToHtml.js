import { marked } from 'marked'

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

marked.use({
  breaks: true,
  gfm: true,
  renderer: {
    html({ text }) {
      return escapeHtml(text)
    },
  },
})

/** Convert markdown to safe HTML for AI chat responses (tables, lists, code, etc.). */
export function formatMarkdownToHtml(text) {
  if (text == null || text === '') return ''

  let html = marked.parse(String(text))

  // Wrap tables for horizontal scrolling and beautiful layout
  html = html.replace(/<table>/g, '<div class="table-container"><table>')
  html = html.replace(/<\/table>/g, '</table></div>')

  return html.replace(
    /<a (?![^>]*\btarget=)/g,
    '<a target="_blank" rel="noopener noreferrer" '
  )
}
