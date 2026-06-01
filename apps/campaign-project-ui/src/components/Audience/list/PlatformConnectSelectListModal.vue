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
        aria-labelledby="platform-select-list-title"
        class="relative z-[1] flex w-full max-w-[min(96vw,550px)] flex-col overflow-visible rounded-[1.5rem] bg_secondary_color shadow-2xl primary_border_color"
        @click.stop="onDialogClick"
      >
        <div class="shrink-0 p-6xl">
          <h2 id="platform-select-list-title" class="heading_h6_semibold primary_text_color">
            Select a list
          </h2>
          <p class="mt-sm label_1_medium primary_text_color">
            Lists are saved groups of contacts for sending campaigns.
          </p>
        </div>

        <div class="h-px w-full shrink-0 bg-info-50" />

        <div class="relative z-20 overflow-visible p-6xl">
          <!-- Step 1: searchable list -->
          <template v-if="step === 'list'">
            <label class="block">
              <span class="label_1_bold primary_text_color">List</span>
              <div ref="listFieldRoot" class="relative mt-md">
                <div class="relative">
                  <span
                    class="pointer-events-none absolute left-3xl top-1/2 z-[1] -translate-y-1/2 text-gray-400"
                  >
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M19 19L13 13M1 8C1 8.91925 1.18106 9.82951 1.53284 10.6788C1.88463 11.5281 2.40024 12.2997 3.05025 12.9497C3.70026 13.5998 4.47194 14.1154 5.32122 14.4672C6.1705 14.8189 7.08075 15 8 15C8.91925 15 9.82951 14.8189 10.6788 14.4672C11.5281 14.1154 12.2997 13.5998 12.9497 12.9497C13.5998 12.2997 14.1154 11.5281 14.4672 10.6788C14.8189 9.82951 15 8.91925 15 8C15 7.08075 14.8189 6.1705 14.4672 5.32122C14.1154 4.47194 13.5998 3.70026 12.9497 3.05025C12.2997 2.40024 11.5281 1.88463 10.6788 1.53284C9.82951 1.18106 8.91925 1 8 1C7.08075 1 6.1705 1.18106 5.32122 1.53284C4.47194 1.88463 3.70026 2.40024 3.05025 3.05025C2.40024 3.70026 1.88463 4.47194 1.53284 5.32122C1.18106 6.1705 1 7.08075 1 8Z" stroke="#28293D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

                  </span>
                  <input
                    ref="listSearchRef"
                    v-model="listQuery"
                    type="search"
                    class="w-full rounded-lg bg_secondary_color py-xxl pl-10 pr-3xl label_2_medium primary_text_color regular_border_color outline-none transition-colors placeholder:tertiary_text_color "
                    placeholder="Search existing list or create new list"
                    autocomplete="off"
                    @click="openListDropdown"
                  />
                </div>

                <div
                  v-if="isListDropdownOpen && listDropdownVisible"
                  class="absolute left-0 right-0 top-full z-[60] mt-sm max-h-[min(240px,50vh)] overflow-y-auto rounded-lg border bg_secondary_color shadow-lg primary_border_color"
                  role="listbox"
                  @mousedown.stop
                >
                  <button
                    v-for="(list, index) in filteredLists"
                    :key="list"
                    type="button"
                    role="option"
                    class="flex w-full px-xl py-3xl text-left label_2_medium primary_text_color transition-colors hover:bg-info-50"
                    :class="[
                      { 'bg-info-50': selectedListName === list },
                      index > 0 ? 'border-t primary_border_color' : ''
                    ]"
                    @click="selectList(list)"
                  >
                    {{ list }}
                  </button>
                  <button
                    v-if="canCreateNewList"
                    type="button"
                    role="option"
                    class="flex w-full items-center gap-sm border-t px-xl py-3xl text-left label_2_medium primary_text_color transition-colors hover:bg-info-50 primary_border_color"
                    @click="selectList(trimmedListQuery)"
                  >
                    <span class="text-lg leading-none secondary_text_color" aria-hidden="true">+</span>
                    Create &quot;{{ trimmedListQuery }}&quot;
                  </button>
                  <p
                    v-if="!filteredLists.length && !canCreateNewList"
                    class="px-xl py-3xl label_2_regular secondary_text_color"
                  >
                    No lists found.
                  </p>
                </div>
              </div>
            </label>
          </template>

          <!-- Step 2: list dropdown + tags -->
          <template v-else>
            <label class="block">
              <span class="label_2_semibold primary_text_color">List</span>
              <div ref="listDropdownRoot" class="relative mt-md">
                <button
                  type="button"
                  class="product-select relative flex w-full items-center rounded-lg bg_secondary_color py-xxl pl-xl pr-10xl text-left label_2_medium primary_text_color regular_border_color"
                  :class="isListSelectOpen ? 'border-[3px] border-[#D9E2FC]' : ''"
                  :aria-expanded="isListSelectOpen"
                  aria-haspopup="listbox"
                  @click="toggleListSelect"
                >
                  <span class="block truncate">{{ selectedListName }}</span>
                  <img
                    :src="DownArrow"
                    alt=""
                    class="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 transition-transform md:right-4"
                    :class="isListSelectOpen ? 'rotate-180' : ''"
                    aria-hidden="true"
                  />
                </button>
                <div
                  v-if="isListSelectOpen"
                  class="absolute left-0 right-0 top-full z-[60] mt-sm max-h-[min(240px,50vh)] overflow-y-auto rounded-lg border bg_secondary_color shadow-lg primary_border_color"
                  role="listbox"
                  @mousedown.stop
                >
                  <button
                    v-for="(list, index) in availableLists"
                    :key="list"
                    type="button"
                    role="option"
                    class="flex w-full px-xl py-3xl text-left label_2_medium primary_text_color transition-colors hover:bg-info-50"
                    :class="[
                      { 'bg-info-50': selectedListName === list },
                      index > 0 ? 'border-t primary_border_color' : ''
                    ]"
                    @click="selectList(list)"
                  >
                    {{ list }}
                  </button>
                </div>
              </div>
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
                    class="inline-flex items-center gap-xs rounded-md border bg-gray-25 px-md py-xs label_2_medium primary_text_color primary_border_color"
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
                    class="min-w-[6rem] flex-1 border-0 bg-transparent py-sm pl-0 pr-0 label_2_medium primary_text_color outline-none placeholder:text-gray-400"
                    placeholder="Search existing tags or create new"
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
          </template>
        </div>

        <div class="relative z-10 h-px w-full shrink-0 bg-info-50" />

        <div class="relative z-10 flex shrink-0 justify-end gap-md px-6xl py-5xl">
          <button
            type="button"
            class="inline-flex min-h-[2.75rem] items-center justify-center rounded-lg bg-gray-25 px-xxl py-xl label_1_semibold primary_text_color transition-colors hover:bg-info-100"
            @click="onCancel"
          >
            Cancel
          </button>
          <button
            type="button"
            class="inline-flex min-h-[2.75rem] min-w-[7rem] items-center justify-center rounded-lg px-xxl py-xl label_1_semibold modal_primary_button transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="!canGoNext"
            @click="onNext"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import DownArrow from '../../../assets/images/DownArrow.svg'
import CloseIcon from '../../../assets/images/CloseIcon.svg'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  availableLists: {
    type: Array,
    default: () => [
      'Master List',
      'New Subscribers',
      'Email List',
      'Text Messaging',
      'Business'
    ]
  },
  availableTags: {
    type: Array,
    default: () => ['Member', 'Newsletter', 'VIP', 'Staff', 'Customer', 'Business']
  }
})

const emit = defineEmits(['update:modelValue', 'cancel', 'confirm'])

const step = ref('list')
const listQuery = ref('')
const selectedListName = ref('')
const isListDropdownOpen = ref(false)
const isListSelectOpen = ref(false)

const tagQuery = ref('')
const selectedTags = ref([])
const showTagSuggestions = ref(false)
const isTagInputFocused = ref(false)

const listFieldRoot = ref(null)
const listDropdownRoot = ref(null)
const listSearchRef = ref(null)
const tagsFieldRoot = ref(null)
const tagInputRef = ref(null)

const trimmedListQuery = computed(() => listQuery.value.trim())

const filteredLists = computed(() => {
  const q = trimmedListQuery.value.toLowerCase()
  return props.availableLists.filter((name) => {
    const label = String(name)
    if (!q) return true
    return label.toLowerCase().includes(q)
  })
})

const canCreateNewList = computed(() => {
  const q = trimmedListQuery.value
  if (!q) return false
  const lower = q.toLowerCase()
  return !props.availableLists.some((name) => String(name).toLowerCase() === lower)
})

const listDropdownVisible = computed(() => {
  return filteredLists.value.length > 0 || canCreateNewList.value
})

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

const canGoNext = computed(() => {
  if (step.value === 'list') return selectedListName.value.length > 0
  return selectedListName.value.length > 0
})

function reset() {
  step.value = 'list'
  listQuery.value = ''
  selectedListName.value = ''
  isListDropdownOpen.value = false
  isListSelectOpen.value = false
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

function openListDropdown() {
  isListDropdownOpen.value = true
}

function selectList(name) {
  const value = String(name).trim()
  if (!value) return
  selectedListName.value = value
  listQuery.value = value
  isListDropdownOpen.value = false
  isListSelectOpen.value = false
}

function toggleListSelect() {
  isListSelectOpen.value = !isListSelectOpen.value
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

function onNext() {
  if (!canGoNext.value) return
  if (step.value === 'list') {
    step.value = 'tags'
    isListDropdownOpen.value = false
    nextTick(() => tagInputRef.value?.focus())
    return
  }
  emit('confirm', {
    list: selectedListName.value,
    tags: [...selectedTags.value]
  })
  close()
}

function onDialogClick(event) {
  const listRoot = listFieldRoot.value
  const listSelectRoot = listDropdownRoot.value
  if (listRoot?.contains(event.target) || listSelectRoot?.contains(event.target)) return
  isListDropdownOpen.value = false
  isListSelectOpen.value = false
}

function handleDocumentClick(event) {
  if (!props.modelValue) return
  const listRoot = listFieldRoot.value
  const listSelectRoot = listDropdownRoot.value
  if (listRoot?.contains(event.target) || listSelectRoot?.contains(event.target)) return
  isListDropdownOpen.value = false
  isListSelectOpen.value = false
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
    } else {
      window.removeEventListener('keydown', onEscapeKey)
    }
  }
)

onMounted(() => {
  document.addEventListener('click', handleDocumentClick, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick, true)
  window.removeEventListener('keydown', onEscapeKey)
})
</script>
