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
        aria-labelledby="list-add-modal-title"
        class="relative z-[1] flex w-full max-w-[min(96vw,520px)] flex-col overflow-visible rounded-[1.5rem] bg_secondary_color shadow-2xl primary_border_color"
        @click.stop="onDialogClick"
      >
        <div class="shrink-0 p-6xl">
          <h2 id="list-add-modal-title" class="heading_h6_semibold primary_text_color">
            Add Contacts to a List
          </h2>
          <p class="mt-sm label_1_medium secondary_text_color">
            Select a list to add the selected contacts.
          </p>
        </div>

        <div class="h-px w-full shrink-0 bg-info-50" />

        <div class="relative z-20 overflow-visible p-6xl">
          <span class="label_1_bold primary_text_color">Choose lists</span>
          <div ref="listsDropdownRoot" class="relative z-20 mt-md">
            <button
              type="button"
              class="product-select relative flex w-full items-center rounded-lg bg_secondary_color py-xxl pl-xl pr-10xl text-left label_2_medium primary_text_color regular_border_color"
              :class="isListsDropdownOpen ? 'border-[3px] border-[#D9E2FC]' : ''"
              :aria-expanded="isListsDropdownOpen"
              aria-haspopup="listbox"
              @click="toggleListsDropdown"
            >
              <span
                class="block truncate"
                :class="selectedListIds.length ? 'primary_text_color' : 'text-gray-400'"
              >
                {{ listsDisplayText }}
              </span>
              <img
                :src="DownArrow"
                alt=""
                class="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 transition-transform md:right-4"
                :class="isListsDropdownOpen ? 'rotate-180' : ''"
                aria-hidden="true"
              />
            </button>
            <div
              v-if="isListsDropdownOpen"
              class="absolute left-0 right-0 top-full z-[60] mt-sm max-h-[min(240px,50vh)] overflow-y-auto rounded-lg border bg_secondary_color shadow-lg primary_border_color"
              role="listbox"
              @click.stop
              @mousedown.stop
            >
              <label
                v-for="(list, index) in availableLists"
                :key="list.id"
                :class="[
                  'flex cursor-pointer items-center gap-md px-xl py-3xl transition-colors hover:bg-info-50',
                  { 'bg-info-50': selectedListIds.includes(list.id) },
                  index > 0 ? 'border-t primary_border_color' : ''
                ]"
              >
                <input
                  v-model="selectedListIds"
                  type="checkbox"
                  class="custom-checkbox h-5xl w-5xl shrink-0 cursor-pointer rounded"
                  :value="list.id"
                />
                <span class="label_2_medium primary_text_color">{{ list.name }}</span>
              </label>
              <p
                v-if="!availableLists.length"
                class="px-xl py-3xl label_2_regular secondary_text_color"
              >
                No lists available.
              </p>
            </div>
          </div>

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
            class="inline-flex min-h-[2.75rem] min-w-[7rem] items-center justify-center rounded-lg px-xxl py-xllabel_1_semibold transition-colors"
            :class="
              canSubmit && !loading
                ? 'modal_primary_button'
                : 'modal_disabled_primary_button cursor-not-allowed'
            "
            :disabled="!canSubmit || loading"
            @click="onConfirm"
          >
            {{ loading ? 'Adding…' : 'Add to List' }}
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
  /** Hide the list the user is currently viewing (by name) */
  excludeListName: {
    type: String,
    default: ''
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

const selectedListIds = ref([])
const isListsDropdownOpen = ref(false)
const listsDropdownRoot = ref(null)

const normalizedLists = computed(() =>
  (props.lists ?? DEFAULT_LIST_OPTIONS).map((list) => ({
    id: list.id,
    name: typeof list.name === 'string' ? list.name : String(list?.name ?? '')
  }))
)

const availableLists = computed(() => {
  const exclude = props.excludeListName.trim().toLowerCase()
  if (!exclude) return normalizedLists.value
  return normalizedLists.value.filter((l) => l.name.toLowerCase() !== exclude)
})

const listsDisplayText = computed(() => {
  if (!selectedListIds.value.length) return 'Select one or more lists'
  if (selectedListIds.value.length === 1) {
    const row = availableLists.value.find((l) => l.id === selectedListIds.value[0])
    return row ? row.name : '1 list'
  }
  return `${selectedListIds.value.length} lists selected`
})

const canSubmit = computed(() => selectedListIds.value.length > 0)

function resetForm() {
  selectedListIds.value = []
  isListsDropdownOpen.value = false
}

function close() {
  emit('update:modelValue', false)
}

function toggleListsDropdown() {
  isListsDropdownOpen.value = !isListsDropdownOpen.value
}

function onBackdropClick() {
  if (props.loading) return
  if (isListsDropdownOpen.value) {
    isListsDropdownOpen.value = false
    return
  }
  close()
  emit('cancel')
}

function onDialogClick(event) {
  if (!isListsDropdownOpen.value || !listsDropdownRoot.value) return
  if (!listsDropdownRoot.value.contains(event.target)) {
    isListsDropdownOpen.value = false
  }
}

function onCancel() {
  if (props.loading) return
  close()
  emit('cancel')
}

function onConfirm() {
  if (props.loading || !canSubmit.value) return
  emit('confirm', [...selectedListIds.value])
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) resetForm()
  }
)
</script>
