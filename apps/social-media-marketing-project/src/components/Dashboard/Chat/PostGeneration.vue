<template>
  <div class="lg:px-3xl pt-3xl pb-md">
    <div
      class="Body_2_regular primary_text_color pb-4"
      v-html="formatMarkdownToHtml(message.aiResponse)"
    />

    <div
      v-if="imageItems.length > 0"
      class="flex gap-3 overflow-x-auto pb-4 -mx-1 px-1 custom_scrollbar"
    >
      <button
        v-for="(item, imgIdx) in imageItems"
        :key="item.postId || imgIdx"
        type="button"
        class="post-generated-image-thumb shrink-0"
        :class="{
          'post-generated-image-thumb--highlighted': isImageHighlighted(item.postId),
          'cursor-pointer': !!item.postId,
          'cursor-default': !item.postId,
        }"
        :data-post-id="item.postId"
        :disabled="!item.postId"
        :aria-pressed="isImageHighlighted(item.postId)"
        :aria-label="item.postId ? 'View generated post' : 'Generated post image'"
        @click="$emit('image-click', item.postId)"
      >
        <img
          :src="item.imageUrl"
          alt="Generated post"
          class="post-generated-image-thumb__img h-52 w-52 object-cover bg_secondary_color"
          :class="
            isImageHighlighted(item.postId)
              ? 'post-generated-image-thumb__img--active'
              : 'rounded-2xl border primary_border_color'
          "
        />
      </button>
    </div>

    <p
      v-if="typeContent"
      class="Body_2_regular primary_text_color pb-4 whitespace-pre-wrap"
    >
      {{ typeContent }}
    </p>

    <p
      v-if="showMarketingCaption"
      class="Body_2_regular primary_text_color pb-4 whitespace-pre-wrap"
    >
      {{ message.typeData.marketingCopy }}
    </p>

    <div
      v-if="message.suggestedResponses && message.suggestedResponses.length > 0"
      :class="suggestedResponseRowClass"
    >
      <template
        v-for="(suggestion, sIndex) in message.suggestedResponses"
        :key="sIndex"
      >
        <router-link
          v-if="suggestion.url && isInternalPath(suggestion.url)"
          :to="suggestion.url"
          :class="suggestedChipLinkClass"
        >
          {{ unescapeHtmlEntities(suggestion.text || suggestion) }}
        </router-link>
        <a
          v-else-if="suggestion.url"
          :href="suggestion.url"
          :class="suggestedChipLinkClass"
        >
          {{ unescapeHtmlEntities(suggestion.text || suggestion) }}
        </a>
        <button
          v-else
          type="button"
          :class="suggestedChipButtonClass"
          :disabled="isAiGenerating"
          @click="$emit('suggested-response', suggestion)"
        >
          {{ unescapeHtmlEntities(suggestion.text || suggestion) }}
        </button>
      </template>
    </div>

    <ChatActionBar
      :is-liked="message.isLiked"
      :is-disliked="message.isDisliked"
      :padded="false"
      compact-icons
      show-regenerate
      @copy="copyPostGenerated"
      @like="$emit('like')"
      @dislike="$emit('dislike')"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ChatActionBar } from '@ai-suite/shared-ui'

const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
  isAiGenerating: {
    type: Boolean,
    default: false,
  },
  highlightedPostId: {
    type: [String, Number],
    default: null,
  },
})

defineEmits(['image-click', 'suggested-response', 'like', 'dislike'])

const suggestedResponseRowClass =
  'max-w-full min-w-0 overflow-x-auto overflow-y-hidden hide-scrollbar flex flex-nowrap gap-2 [-webkit-overflow-scrolling:touch] md:flex-wrap md:overflow-x-visible'
const suggestedChipLinkClass =
  'inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-full bg-[#EBF5FF] px-3xl py-xl border border-blue-50 text-blue-300 body_3_medium no-underline transition-colors hover:bg-[#DBEAFE]'
const suggestedChipButtonClass =
  'inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-full bg-[#EBF5FF] px-3xl py-xl border border-blue-50 text-blue-300 body_3_medium transition-colors hover:bg-[#DBEAFE] disabled:cursor-not-allowed disabled:opacity-60'

const plainTextFromAi = (value) => {
  if (!value) return ''
  const temp = document.createElement('div')
  temp.innerHTML = String(value)
  return (temp.textContent || temp.innerText || '').trim()
}

const postGeneratedImageItems = (message) => {
  const td = message?.typeData
  if (!td || typeof td !== 'object') return []

  const legacyPostId = td.postId ?? td.post_id ?? undefined
  const raw = td.generatedImages

  const pushFromString = (urlStr, postId) => {
    const u = String(urlStr ?? '').trim()
    if (!u) return null
    return { imageUrl: u, postId: postId ?? undefined }
  }

  if (!raw) {
    const single = td.generatedImage ?? td.imageUrl
    if (typeof single === 'string' && single.trim()) {
      const row = pushFromString(single, legacyPostId)
      return row ? [row] : []
    }
    return []
  }

  if (Array.isArray(raw)) {
    return raw
      .map((entry) => {
        if (entry == null) return null
        if (typeof entry === 'string') {
          return pushFromString(entry, legacyPostId)
        }
        if (typeof entry === 'object') {
          const u = String(entry.imageUrl ?? entry.url ?? '').trim()
          if (!u) return null
          const pid = entry.postId ?? entry.post_id ?? legacyPostId ?? undefined
          return { imageUrl: u, postId: pid != null ? String(pid) : undefined }
        }
        return null
      })
      .filter(Boolean)
  }

  if (typeof raw === 'string') {
    const row = pushFromString(raw, legacyPostId)
    return row ? [row] : []
  }

  if (typeof raw === 'object' && raw.imageUrl) {
    const row = pushFromString(raw.imageUrl, raw.postId ?? raw.post_id ?? legacyPostId)
    return row ? [row] : []
  }

  return []
}

const postGeneratedTypeContent = (message) => {
  const raw = message?.typeData?.content
  if (raw == null) return ''
  return String(raw).trim()
}

const showPostMarketingCaption = (message) => {
  const cap = message?.typeData?.marketingCopy?.trim()
  if (!cap) return false
  return cap !== plainTextFromAi(message?.aiResponse)
}

const unescapeHtmlEntities = (text) => {
  if (text == null || text === '') return ''
  const div = document.createElement('div')
  div.innerHTML = text
  return div.textContent || div.innerText || ''
}

const formatMarkdownToHtml = (text) => {
  if (text == null || text === '') return ''

  let html = String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  html = html.replace(/\n/g, '<br>')

  return html
}

const isInternalPath = (url) =>
  typeof url === 'string' && url.startsWith('/') && !url.startsWith('//')

const imageItems = computed(() => postGeneratedImageItems(props.message))
const typeContent = computed(() => postGeneratedTypeContent(props.message))
const showMarketingCaption = computed(() => showPostMarketingCaption(props.message))

const isImageHighlighted = (postId) => {
  if (postId == null || props.highlightedPostId == null) return false
  return String(props.highlightedPostId) === String(postId)
}

const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  }
}

const copyPostGenerated = async () => {
  const main = plainTextFromAi(props.message?.aiResponse)
  const cap = props.message?.typeData?.marketingCopy?.trim() || ''
  const parts = []
  if (main) parts.push(main)
  if (cap && cap !== main) parts.push(cap)
  else if (!main && cap) parts.push(cap)
  const urls = imageItems.value.map((x) => x.imageUrl).filter(Boolean)
  if (urls.length) parts.push(urls.join('\n'))
  await copyText(parts.join('\n\n'))
}
</script>

<style scoped>
.post-generated-image-thumb {
  border: none;
  padding: 0;
  background: transparent;
  line-height: 0;
}

.post-generated-image-thumb--highlighted {
  padding: 4px;
  border-radius: 1rem;
  background: linear-gradient(
    135.79deg,
    #fab000 -1.83%,
    #9966ff 18.11%,
    #0073e6 78.19%,
    #15be53 100.65%
  );
}

.post-generated-image-thumb__img--active {
  border: 0px solid #f3f4f5;
  border-radius: calc(1rem - 4px);
}
</style>
