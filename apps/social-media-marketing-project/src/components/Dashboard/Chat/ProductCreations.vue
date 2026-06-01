<template>
  <div class="lg:px-3xl pt-3xl pb-md">
    <div
      class="Body_2_regular primary_text_color pb-4 [&_a]:text-[#2563EB] [&_a]:underline"
      v-html="formatMarkdownToHtml(message.aiResponse)"
    />

    <div
      class="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)] md:p-5 md:w-[42%]"
    >
      <div
        v-if="productId && loading"
        class="body_3_regular tertiary_text_color py-6 text-center"
      >
        Loading product…
      </div>

      <div
        v-else-if="productId && gone"
        class="body_3_regular tertiary_text_color py-6 text-center"
      >
        Product deleted
      </div>

      <div
        v-else-if="productId && error"
        class="body_3_regular text-red-600 py-4"
      >
        {{ error }}
      </div>

      <template v-else-if="productId && product">
        <div class="flex items-start justify-between gap-3 border-b border-[#E5E7EB] pb-4">
          <div class="flex min-w-0 flex-1 items-center gap-3">
            <img
              v-if="product.brandLogoUrl"
              :src="product.brandLogoUrl"
              :alt="product.name || 'Brand'"
              class="h-10 w-10 shrink-0 rounded-lg object-contain bg-[#F9FAFB]"
            />
            <span class="truncate label_1_semibold primary_text_color">
              {{ product.name }}
            </span>
          </div>
          <div class="relative shrink-0" data-chat-product-card-menu>
            <button
              type="button"
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#596773] transition-colors hover:bg-[#F9FAFB]"
              :aria-expanded="menuOpen"
              aria-label="Product options"
              @click.stop="toggleMenu"
            >
              <img :src="DotsIcon" alt="" class="h-4 w-4 opacity-80" />
            </button>
            <div
              v-if="menuOpen"
              class="absolute right-0 z-[20] mt-2 w-[min(calc(100vw-2rem),220px)] min-w-[220px] overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-lg"
              @click.stop
            >
              <div class="flex items-center justify-between gap-3 px-4 py-3.5">
                <span class="label_2_medium primary_text_color">Active / Inactive</span>
                <button
                  type="button"
                  role="switch"
                  :aria-checked="isActive"
                  class="inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full px-[3px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                  :class="isActive ? 'justify-end bg-green-300' : 'justify-start bg-gray-200'"
                  @click.stop="$emit('toggle-active', product)"
                >
                  <span
                    class="pointer-events-none h-5 w-5 rounded-full bg-white shadow-sm ring-1 ring-black/5"
                  />
                </button>
              </div>
              <div class="h-px w-full bg-[#E5E7EB]" aria-hidden="true" />
              <button
                type="button"
                class="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left label_2_medium primary_text_color transition-colors hover:bg-[#F9FAFB]"
                @click="handleEdit"
              >
                <span>Edit</span>
                <img :src="ImageEditIcon" alt="" class="h-5xl w-5xl shrink-0 opacity-80" />
              </button>
              <div class="h-px w-full bg-[#E5E7EB]" aria-hidden="true" />
              <button
                type="button"
                class="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left label_2_medium primary_text_color transition-colors hover:bg-[#F9FAFB]"
                @click.stop="handleDelete"
              >
                <span>Delete</span>
                <img :src="TrashIcon" alt="" class="h-5xl w-5xl shrink-0 opacity-80" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex gap-0 pt-4">
          <div class="min-w-0 flex-1 pr-3 md:pr-4">
            <p class="label_2_medium secondary_text_color mb-2">Brand colors</p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(hex, cIdx) in product.brandColors || []"
                :key="cIdx"
                class="inline-block h-7 w-7 shrink-0 rounded-md border border-[#E5E7EB] shadow-sm"
                :style="{ backgroundColor: hex }"
                :title="hex"
              />
            </div>
          </div>
          <div class="w-px shrink-0 self-stretch bg-[#E5E7EB]" aria-hidden="true" />
          <div class="min-w-0 flex-1 pl-3 md:pl-4">
            <p class="label_2_medium secondary_text_color mb-2">Typography</p>
            <p
              class="label_1_semibold primary_text_color break-words"
              :style="{ fontFamily: formatProductTypographyCss(product.typography) }"
            >
              {{ formatProductTypographyLabel(product.typography) }}
            </p>
          </div>
        </div>
      </template>

      <div v-else class="body_3_regular tertiary_text_color py-4">
        No product details available.
      </div>
    </div>

    <div
      v-if="message.suggestedResponses && message.suggestedResponses.length > 0"
      class="mt-4"
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
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onUnmounted } from 'vue'
import DotsIcon from '../../../assets/images/DotsIcon.svg'
import ImageEditIcon from '../../../assets/images/ImageEditIcon.svg'
import TrashIcon from '../../../assets/images/TrashIcon.svg'

const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
  isAiGenerating: {
    type: Boolean,
    default: false,
  },
  productId: {
    type: [String, Number],
    default: null,
  },
  product: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: null,
  },
  gone: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['toggle-active', 'edit', 'delete', 'suggested-response'])

const menuOpen = ref(false)
let removeMenuDocClick = null

const suggestedResponseRowClass =
  'max-w-full min-w-0 overflow-x-auto overflow-y-hidden hide-scrollbar flex flex-nowrap gap-2 [-webkit-overflow-scrolling:touch] md:flex-wrap md:overflow-x-visible'
const suggestedChipLinkClass =
  'inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-full bg-[#EBF5FF] px-3xl py-xl border border-blue-50 text-blue-300 body_3_medium no-underline transition-colors hover:bg-[#DBEAFE]'
const suggestedChipButtonClass =
  'inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-full bg-[#EBF5FF] px-3xl py-xl border border-blue-50 text-blue-300 body_3_medium transition-colors hover:bg-[#DBEAFE] disabled:cursor-not-allowed disabled:opacity-60'

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

const formatProductTypographyLabel = (raw) => {
  if (raw == null || raw === '') return '—'
  const t = String(raw).trim()
  try {
    const j = JSON.parse(t)
    if (Array.isArray(j) && j.length) return String(j[0])
    if (typeof j === 'string') return j
  } catch {
    /* not JSON */
  }
  const quoted = t.match(/"([^"]+)"/)
  if (quoted) return quoted[1]
  const stripped = t.replace(/^\{/, '').replace(/\}$/, '').split(',')[0]
  if (stripped) return stripped.replace(/^["']|["']$/g, '').trim()
  return t
}

const formatProductTypographyCss = (raw) => {
  const label = formatProductTypographyLabel(raw)
  if (!label || label === '—') return 'inherit'
  return `"${label.replace(/"/g, '\\"')}", ui-sans-serif, system-ui, sans-serif`
}

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const handleEdit = () => {
  menuOpen.value = false
  emit('edit')
}

const handleDelete = () => {
  menuOpen.value = false
  emit('delete', props.productId)
}

watch(menuOpen, (open) => {
  if (removeMenuDocClick) {
    document.removeEventListener('click', removeMenuDocClick, true)
    removeMenuDocClick = null
  }
  if (!open) return
  nextTick(() => {
    removeMenuDocClick = (e) => {
      if (e.target.closest('[data-chat-product-card-menu]')) return
      menuOpen.value = false
    }
    document.addEventListener('click', removeMenuDocClick, true)
  })
})

onUnmounted(() => {
  if (removeMenuDocClick) {
    document.removeEventListener('click', removeMenuDocClick, true)
  }
})
</script>
