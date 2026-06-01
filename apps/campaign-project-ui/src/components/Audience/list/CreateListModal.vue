<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[110] flex items-center justify-center p-4"
      role="presentation"
    >
      <div
        class="absolute inset-0 bg-black-800/45 backdrop-blur-[2px]"
        aria-hidden="true"
        @click="onBackdropClick"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-list-title"
        class="relative z-[1] flex w-full max-w-[min(96vw,520px)] flex-col overflow-hidden rounded-[1.5rem] bg_secondary_color shadow-2xl primary_border_color"
        @click.stop
      >
        <!-- Header -->
        <div class="shrink-0 p-6xl">
          <h2 id="create-list-title" class="heading_h6_semibold primary_text_color">
            Create a list
          </h2>
          <p class="mt-md label_1_medium primary_text_color">
            Static group of contacts for targeted sends.
          </p>
        </div>
        <div class="h-px w-full shrink-0 bg-[#D7DBDF]" />

        <!-- Body -->
        <div class="p-6xl">
          <label class="block">
            <span class="label_2_semibold primary_text_color">
              List name
              <span class="text-red-500" aria-hidden="true">*</span>
            </span>
            <input
              v-model="listName"
              type="text"
              class="mt-sm block w-full rounded-lg regular_border_color bg_secondary_color p-xxl label_2_medium primary_text_color outline-none transition-colors placeholder:tertiary_text_color focus:border-[3px] focus:border-[#D9E2FC]"
              placeholder="Master List"
              autocomplete="off"
              @keydown.enter.prevent="onSubmit"
            />
          </label>

          <div class="relative mt-6xl">
            <span class="label_2_semibold primary_text_color">Tags</span>
            <div
              ref="tagsFieldRoot"
              class="relative mt-md"
              @focusin="isTagInputFocused = true"
              @focusout="onTagsFieldBlur"
            >
              <div
                class="relative flex min-h-[3rem] flex-wrap items-center gap-sm rounded-lg regular_border_color bg_secondary_color py-md pl-10 pr-3xl transition-colors"
                :class="isTagInputFocused ? 'border-[3px] border-[#D9E2FC]' : ''"
              >
                <span
                  class="pointer-events-none absolute left-3xl top-1/2 -translate-y-1/2 text-gray-400"
                >
                  <svg
                    class="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M21 21l-5.2-5.2M10 18a8 8 0 100-16 8 8 0 000 16z"
                    />
                  </svg>
                </span>

                <span
                  v-for="tag in selectedTags"
                  :key="tag"
                  class="inline-flex items-center gap-xs rounded-md bg-info-50 px-md py-xs label_2_medium primary_text_color"
                >
                  {{ tag }}
                  <button
                    type="button"
                    class="inline-flex rounded p-0.5 text-gray-500 transition-colors hover:bg-info-100 hover:text-gray-700"
                    :aria-label="`Remove ${tag}`"
                    @mousedown.prevent
                    @click="removeTag(tag)"
                  >
                    <img :src="CloseIcon" alt="" class="h-3.5 w-3.5" />
                  </button>
                </span>

                <input
                  ref="tagInputRef"
                  v-model="tagQuery"
                  type="text"
                  class="min-w-[6rem] flex-1 border-0 bg-transparent py-sm pl-0 pr-0 label_2_medium primary_text_color outline-none placeholder:tertiary_text_color"
                  placeholder="New team"
                  autocomplete="off"
                  @keydown.enter.prevent="onTagInputEnter"
                  @keydown.backspace="onTagInputBackspace"
                  @input="showTagSuggestions = true"
                />
              </div>

              <div
                v-if="showTagSuggestions && tagSuggestionsVisible"
                class="absolute left-0 right-0 top-full z-10 mt-xs overflow-hidden rounded-lg border bg_secondary_color shadow-md primary_border_color"
              >
                <button
                  v-for="tag in matchingExistingTags"
                  :key="'existing-' + tag"
                  type="button"
                  class="flex w-full px-xl py-3xl text-left label_2_medium primary_text_color transition-colors hover:bg-info-50"
                  @mousedown.prevent
                  @click="addTag(tag)"
                >
                  {{ tag }}
                </button>
                <button
                  v-if="canAddNewTag"
                  type="button"
                  class="flex w-full items-center gap-sm border-t px-xl py-3xl text-left label_2_medium primary_text_color transition-colors hover:bg-info-50 primary_border_color"
                  @mousedown.prevent
                  @click="addTag(trimmedTagQuery)"
                >
                  <span class="text-lg leading-none secondary_text_color" aria-hidden="true">+</span>
                  Add &quot;{{ trimmedTagQuery }}&quot;
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="h-px w-full shrink-0 bg-[#D7DBDF]" />

        <!-- Footer -->
        <div class="flex shrink-0 justify-end gap-md px-6xl py-5xl">
          <button
            type="button"
            class="inline-flex min-h-[2.75rem] items-center justify-center rounded-lg bg-gray-25 px-xxl py-xl label_1_semibold primary_text_color transition-colors hover:bg-info-100"
            @click="onCancel"
          >
            Cancel
          </button>
          <button
            type="button"
            :disabled="!canCreate"
            class="inline-flex min-w-[7rem] items-center justify-center rounded-lg px-xxl py-xl label_1_semibold transition-colors"
            :class="canCreate ? 'min-h-[2.75rem] primary_add_button' : 'modal_disabled_primary_button'"
            @click="onSubmit"
          >
            Create List
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'
import CloseIcon from '../../../assets/images/CloseIcon.svg'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  /** Existing tag names for autocomplete */
  availableTags: {
    type: Array,
    default: () => ['Member', 'Newsletter', 'VIP', 'Staff', 'Customer']
  }
})

const emit = defineEmits(['update:modelValue', 'create', 'cancel'])

const listName = ref('')
const tagQuery = ref('')
const selectedTags = ref([])
const showTagSuggestions = ref(false)
const isTagInputFocused = ref(false)
const tagsFieldRoot = ref(null)
const tagInputRef = ref(null)

const trimmedTagQuery = computed(() => tagQuery.value.trim())

const normalizedAvailableTags = computed(() => {
  const names = props.availableTags.map((t) =>
    typeof t === 'string' ? t : String(t?.name ?? '')
  )
  return [...new Set(names.filter(Boolean))]
})

const matchingExistingTags = computed(() => {
  const q = trimmedTagQuery.value.toLowerCase()
  return normalizedAvailableTags.value.filter((tag) => {
    if (selectedTags.value.includes(tag)) return false
    if (!q) return true
    return tag.toLowerCase().includes(q)
  })
})

const canAddNewTag = computed(() => {
  const q = trimmedTagQuery.value
  if (!q) return false
  if (selectedTags.value.includes(q)) return false
  const lower = q.toLowerCase()
  return !normalizedAvailableTags.value.some((t) => t.toLowerCase() === lower)
})

const tagSuggestionsVisible = computed(() => {
  if (!isTagInputFocused.value) return false
  return matchingExistingTags.value.length > 0 || canAddNewTag.value
})

const canCreate = computed(() => listName.value.trim().length > 0)

function reset() {
  listName.value = ''
  tagQuery.value = ''
  selectedTags.value = []
  showTagSuggestions.value = false
  isTagInputFocused.value = false
}

function close() {
  emit('update:modelValue', false)
}

function onBackdropClick() {
  close()
}

function onCancel() {
  emit('cancel')
  close()
}

function addTag(name) {
  const value = String(name).trim()
  if (!value || selectedTags.value.includes(value)) return
  selectedTags.value = [...selectedTags.value, value]
  tagQuery.value = ''
  showTagSuggestions.value = false
  nextTick(() => tagInputRef.value?.focus())
}

function removeTag(name) {
  selectedTags.value = selectedTags.value.filter((t) => t !== name)
  nextTick(() => tagInputRef.value?.focus())
}

function onTagInputEnter() {
  if (canAddNewTag.value) {
    addTag(trimmedTagQuery.value)
    return
  }
  const first = matchingExistingTags.value[0]
  if (first) addTag(first)
}

function onTagInputBackspace() {
  if (tagQuery.value !== '' || selectedTags.value.length === 0) return
  selectedTags.value = selectedTags.value.slice(0, -1)
}

function onTagsFieldBlur(event) {
  const root = tagsFieldRoot.value
  if (root?.contains(event.relatedTarget)) return
  isTagInputFocused.value = false
  window.setTimeout(() => {
    showTagSuggestions.value = false
  }, 150)
}

function onSubmit() {
  if (!canCreate.value) return
  emit('create', {
    name: listName.value.trim(),
    tags: [...selectedTags.value]
  })
  close()
}

function onEscapeKey(e) {
  if (e.key === 'Escape' && props.modelValue) {
    close()
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      reset()
      window.addEventListener('keydown', onEscapeKey)
      nextTick(() => tagInputRef.value?.blur())
    } else {
      window.removeEventListener('keydown', onEscapeKey)
    }
  }
)

onUnmounted(() => {
  window.removeEventListener('keydown', onEscapeKey)
})
</script>
