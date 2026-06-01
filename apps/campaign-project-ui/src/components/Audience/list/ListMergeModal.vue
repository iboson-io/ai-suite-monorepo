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
        aria-labelledby="list-merge-modal-title"
        class="relative z-[1] flex w-full max-w-[min(96vw,520px)] flex-col overflow-visible rounded-[1.5rem] bg_secondary_color shadow-2xl primary_border_color"
        @click.stop="onDialogClick"
      >
        <div class="shrink-0 p-6xl">
          <h2 id="list-merge-modal-title" class="heading_h6_semibold primary_text_color">
            Merge Contact Lists
          </h2>
          <p class="mt-sm label_1_medium primary_text_color">
            Combine multiple contact lists into one audience.
          </p>
        </div>

        <div class="h-px w-full shrink-0 bg-info-50" />

        <div class="relative z-20 overflow-visible p-6xl ">
          <label class="block">
            <span class="label_1_bold primary_text_color">Lists to merge</span>
            <div ref="sourcesDropdownRoot" class="relative z-20 mt-md">
              <button
                type="button"
                class="product-select relative flex w-full items-center rounded-lg bg_secondary_color py-xxl pl-xl pr-10xl text-left label_2_medium primary_text_color regular_border_color"
                :class="openDropdown === 'sources' ? 'border-[3px] border-[#D9E2FC]' : ''"
                :aria-expanded="openDropdown === 'sources'"
                aria-haspopup="listbox"
                @click="toggleSourcesDropdown"
              >
                <span
                  class="block truncate"
                  :class="listsToMergeIds.length ? 'primary_text_color' : 'tertiary_text_color'"
                >
                  {{ sourcesDisplayText }}
                </span>
                <img
                  :src="DownArrow"
                  alt=""
                  class="pointer-events-none absolute right-3 top-1/2 h-5xl w-5xl -translate-y-1/2 transition-transform md:right-4"
                  :class="openDropdown === 'sources' ? 'rotate-180' : ''"
                  aria-hidden="true"
                />
              </button>
              <div
                v-if="openDropdown === 'sources'"
                class="absolute left-0 right-0 top-full z-[60] mt-sm overflow-hidden rounded-lg border bg_secondary_color shadow-lg primary_border_color"
                role="listbox"
                @click.stop
                @mousedown.stop
              >
                <div class="border-b px-xl py-md primary_border_color">
                  <input
                    v-model="mergeSearchQuery"
                    type="search"
                    placeholder="Search lists"
                    class="w-full rounded-lg bg_secondary_color py-md pl-3xl pr-3xl label_2_medium primary_text_color regular_border_color outline-none transition-colors placeholder:text-gray-400 focus:border-[3px] focus:border-[#D9E2FC]"
                    autocomplete="off"
                    @click.stop
                  />
                </div>
                <div class="max-h-[min(200px,40vh)] overflow-y-auto">
                  <label
                    v-for="(list, index) in filteredSourceLists"
                    :key="list.id"
                    :class="[
                      'flex cursor-pointer items-center gap-md px-xl py-3xl transition-colors hover:bg-info-50',
                      { 'bg-info-50': listsToMergeIds.includes(list.id) },
                      index > 0 ? 'border-t primary_border_color' : ''
                    ]"
                  >
                    <input
                      v-model="listsToMergeIds"
                      type="checkbox"
                      class="custom-checkbox h-5xl w-5xl shrink-0 cursor-pointer rounded"
                      :value="list.id"
                    />
                    <span class="label_2_medium primary_text_color">{{ list.name }}</span>
                  </label>
                  <p
                    v-if="!filteredSourceLists.length"
                    class="px-xl py-3xl label_2_regular secondary_text_color"
                  >
                    No lists found.
                  </p>
                </div>
              </div>
            </div>
          </label>

          <label class="mt-5xl block">
            <span class="label_1_bold primary_text_color">Merge into</span>
            <div ref="destinationDropdownRoot" class="relative z-20 mt-md">
              <button
                type="button"
                class="product-select relative flex w-full items-center rounded-lg bg_secondary_color py-xxl pl-xl pr-10xl text-left label_2_medium primary_text_color regular_border_color"
                :class="openDropdown === 'destination' ? 'border-[3px] border-[#D9E2FC]' : ''"
                :aria-expanded="openDropdown === 'destination'"
                aria-haspopup="listbox"
                @click="toggleDestinationDropdown"
              >
                <span
                  class="block truncate"
                  :class="mergeIntoId != null ? 'primary_text_color' : 'text-gray-400'"
                >
                  {{ destinationDisplayText }}
                </span>
                <img
                  :src="DownArrow"
                  alt=""
                  class="pointer-events-none absolute right-3 top-1/2 h-5xl w-5xl  -translate-y-1/2 transition-transform md:right-4"
                  :class="openDropdown === 'destination' ? 'rotate-180' : ''"
                  aria-hidden="true"
                />
              </button>
              <div
                v-if="openDropdown === 'destination'"
                class="absolute left-0 right-0 top-full z-[60] mt-sm max-h-[min(240px,50vh)] overflow-y-auto rounded-lg border bg_secondary_color shadow-lg primary_border_color"
                role="listbox"
                @click.stop
                @mousedown.stop
              >
                <button
                  v-for="(list, index) in destinationLists"
                  :key="list.id"
                  type="button"
                  role="option"
                  :aria-selected="mergeIntoId === list.id"
                  class="flex w-full px-xl py-3xl text-left label_2_medium primary_text_color transition-colors hover:bg-info-50"
                  :class="[
                    mergeIntoId === list.id ? 'bg-info-50' : '',
                    index > 0 ? 'border-t primary_border_color' : ''
                  ]"
                  @click="selectDestination(list.id)"
                >
                  {{ list.name }}
                </button>
                <p
                  v-if="!destinationLists.length"
                  class="px-xl py-3xl label_2_regular secondary_text_color"
                >
                  No lists available.
                </p>
              </div>
            </div>
          </label>

          <p v-if="error" class="mt-5xl label_2_regular text-error-600">
            {{ error }}
          </p>
        </div>

        <div class="relative z-10 h-px w-full shrink-0 bg-info-50" />

        <div class="relative z-10 flex shrink-0 justify-end gap-md px-6xl py-5xl">
          <button
            type="button"
            class="inline-flex min-h-[2.75rem] items-center justify-center rounded-lg bg-gray-25 px-xxl py-xl label_1_semibold primary_text_color transition-colors hover:bg-info-100 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="loading"
            @click="onCancel"
          >
            Cancel
          </button>
          <button
            type="button"
            class="inline-flex min-h-[2.75rem] min-w-[7rem] items-center justify-center rounded-lg px-xxl py-xl label_1_semibold transition-colors"
            :class="
              canMerge && !loading
                ? 'modal_primary_button'
                : 'modal_disabled_primary_button cursor-not-allowed'
            "
            :disabled="!canMerge || loading"
            @click="onConfirm"
          >
            {{ loading ? 'Merging…' : 'Merge' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import DownArrow from '../../../assets/images/DownArrow.svg'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  lists: {
    type: Array,
    default: undefined
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const DEFAULT_LIST_OPTIONS = [
  { id: 1, name: 'Master List' },
  { id: 2, name: 'New Subscribers' },
  { id: 3, name: 'Email List' },
  { id: 4, name: 'Text Messaging' }
]

const listsToMergeIds = ref([])
const mergeIntoId = ref(null)
const mergeSearchQuery = ref('')
const openDropdown = ref(null)
const sourcesDropdownRoot = ref(null)
const destinationDropdownRoot = ref(null)

const normalizedLists = computed(() =>
  (props.lists ?? DEFAULT_LIST_OPTIONS).map((list) => ({
    id: list.id,
    name: typeof list.name === 'string' ? list.name : String(list?.name ?? '')
  }))
)

const filteredSourceLists = computed(() => {
  const q = mergeSearchQuery.value.trim().toLowerCase()
  if (!q) return normalizedLists.value
  return normalizedLists.value.filter((l) => l.name.toLowerCase().includes(q))
})

const destinationLists = computed(() =>
  normalizedLists.value.filter((l) => !listsToMergeIds.value.includes(l.id))
)

const sourcesDisplayText = computed(() => {
  if (!listsToMergeIds.value.length) return 'Search lists'
  if (listsToMergeIds.value.length === 1) {
    const row = normalizedLists.value.find((l) => l.id === listsToMergeIds.value[0])
    return row ? row.name : '1 list'
  }
  return `${listsToMergeIds.value.length} lists selected`
})

const destinationDisplayText = computed(() => {
  if (mergeIntoId.value == null) return 'Select destination list'
  const row = normalizedLists.value.find((l) => l.id === mergeIntoId.value)
  return row ? row.name : 'Select destination list'
})

const canMerge = computed(
  () => listsToMergeIds.value.length > 0 && mergeIntoId.value != null
)

function resetForm() {
  listsToMergeIds.value = []
  mergeIntoId.value = null
  mergeSearchQuery.value = ''
  openDropdown.value = null
}

function close() {
  emit('update:modelValue', false)
}

function closeDropdowns() {
  openDropdown.value = null
}

function toggleSourcesDropdown() {
  openDropdown.value = openDropdown.value === 'sources' ? null : 'sources'
  if (openDropdown.value === 'sources') mergeSearchQuery.value = ''
}

function toggleDestinationDropdown() {
  openDropdown.value = openDropdown.value === 'destination' ? null : 'destination'
}

function selectDestination(id) {
  mergeIntoId.value = id
  closeDropdowns()
}

watch(listsToMergeIds, (ids) => {
  if (mergeIntoId.value != null && ids.includes(mergeIntoId.value)) {
    mergeIntoId.value = null
  }
})

function onBackdropClick() {
  if (props.loading) return
  if (openDropdown.value) {
    closeDropdowns()
    return
  }
  close()
  emit('cancel')
}

function onDialogClick(event) {
  const target = event.target
  if (
    openDropdown.value === 'sources' &&
    sourcesDropdownRoot.value &&
    !sourcesDropdownRoot.value.contains(target)
  ) {
    closeDropdowns()
    return
  }
  if (
    openDropdown.value === 'destination' &&
    destinationDropdownRoot.value &&
    !destinationDropdownRoot.value.contains(target)
  ) {
    closeDropdowns()
  }
}

function onCancel() {
  if (props.loading) return
  close()
  emit('cancel')
}

function onConfirm() {
  if (props.loading || !canMerge.value) return
  emit('confirm', {
    listsToMerge: [...listsToMergeIds.value],
    mergeIntoId: mergeIntoId.value
  })
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) resetForm()
  }
)
</script>
