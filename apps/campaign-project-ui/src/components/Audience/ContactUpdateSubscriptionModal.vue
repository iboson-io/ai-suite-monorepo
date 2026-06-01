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
        aria-labelledby="update-subscription-modal-title"
        class="relative z-[1] flex w-full max-w-[min(96vw,550px)] flex-col overflow-visible rounded-[1.5rem] bg_secondary_color shadow-2xl primary_border_color"
        @click.stop="onDialogClick"
      >
        <div class="shrink-0 p-6xl">
          <h2 id="update-subscription-modal-title" class="heading_h6_semibold primary_text_color">
            Update Email Subscription Status
          </h2>
          <p class="mt-sm label_1_medium secondary_text_color">
            You selected {{ selectedCount }}
            {{ selectedCount === 1 ? 'contact' : 'contacts' }}. Choose their new email subscription
            status.
          </p>
        </div>

        <div class="h-px w-full shrink-0 bg-info-50" />

        <div class="relative z-20 overflow-visible p-6xl">
          <p class="label_2_medium primary_text_color">
            Currently: {{ subscribedCount }} subscribed
          </p>

          <label class="mt-5xl block">
            <span class="label_2_semibold primary_text_color">Subscription status</span>
            <div ref="statusDropdownRoot" class="relative mt-md">
              <button
                type="button"
                class="product-select relative flex w-full items-center rounded-lg bg_secondary_color py-xxl pl-xl pr-10xl text-left label_2_medium primary_text_color regular_border_color"
                :class="isStatusDropdownOpen ? 'border-[3px] border-[#D9E2FC]' : ''"
                :aria-expanded="isStatusDropdownOpen"
                aria-haspopup="listbox"
                @click="toggleStatusDropdown"
              >
                <span class="block truncate">{{ selectedStatusLabel }}</span>
                <img
                  :src="DownArrow"
                  alt=""
                  class="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 transition-transform md:right-4"
                  :class="isStatusDropdownOpen ? 'rotate-180' : ''"
                  aria-hidden="true"
                />
              </button>
              <div
                v-if="isStatusDropdownOpen"
                class="absolute left-0 right-0 top-full z-[60] mt-sm overflow-hidden rounded-lg border bg_secondary_color shadow-lg primary_border_color"
                role="listbox"
                @mousedown.stop
              >
                <button
                  v-for="(option, index) in statusOptions"
                  :key="option.id"
                  type="button"
                  role="option"
                  class="flex w-full px-xl py-3xl text-left label_2_medium primary_text_color transition-colors hover:bg-info-50"
                  :class="[
                    { 'bg-info-50': selectedStatusId === option.id },
                    index > 0 ? 'border-t primary_border_color' : ''
                  ]"
                  @click="selectStatus(option.id)"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>
          </label>

          <button
            type="button"
            class="mt-4xl label_2_medium text-[#0068CF] transition-colors hover:underline"
            @click="emit('learn-more')"
          >
            Learn more about subscription statuses
          </button>

          <p v-if="error" class="mt-5xl label_2_regular text-error-600">
            {{ error }}
          </p>
        </div>

        <div class="h-px w-full shrink-0 bg-info-50" />

        <div class="flex shrink-0 justify-end gap-md px-6xl py-5xl">
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
            class="inline-flex min-h-[2.75rem] min-w-[8rem] items-center justify-center rounded-lg px-xxl py-xl label_1_semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            :class="loading ? 'bg-gray-25 primary_text_color' : 'modal_primary_button'"
            :disabled="loading || !selectedStatusId"
            @click="onConfirm"
          >
            {{ loading ? 'Updating…' : 'Update Status' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import DownArrow from '../../assets/images/DownArrow.svg'

const DEFAULT_STATUS_OPTIONS = [
  { id: 'subscribed', label: 'Email subscribed' },
  { id: 'unsubscribed', label: 'Email unsubscribed' },
  { id: 'non-subscribed', label: 'Non-subscribed' },
  { id: 'pending', label: 'Pending' }
]

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  selectedCount: {
    type: Number,
    default: 0
  },
  subscribedCount: {
    type: Number,
    default: 0
  },
  statusOptions: {
    type: Array,
    default: () => []
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

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel', 'learn-more'])

const selectedStatusId = ref('subscribed')
const isStatusDropdownOpen = ref(false)
const statusDropdownRoot = ref(null)

const normalizedOptions = computed(() => {
  const opts = props.statusOptions.length ? props.statusOptions : DEFAULT_STATUS_OPTIONS
  return opts.map((o) =>
    typeof o === 'string' ? { id: o, label: o } : { id: o.id, label: o.label ?? o.id }
  )
})

const selectedStatusLabel = computed(() => {
  const row = normalizedOptions.value.find((o) => o.id === selectedStatusId.value)
  return row?.label ?? 'Select status'
})

function reset() {
  selectedStatusId.value = 'subscribed'
  isStatusDropdownOpen.value = false
}

function close() {
  emit('update:modelValue', false)
}

function onBackdropClick() {
  if (props.loading) return
  close()
  emit('cancel')
}

function onCancel() {
  if (props.loading) return
  close()
  emit('cancel')
}

function toggleStatusDropdown() {
  isStatusDropdownOpen.value = !isStatusDropdownOpen.value
}

function selectStatus(id) {
  selectedStatusId.value = id
  isStatusDropdownOpen.value = false
}

function onConfirm() {
  if (props.loading || !selectedStatusId.value) return
  const option = normalizedOptions.value.find((o) => o.id === selectedStatusId.value)
  emit('confirm', {
    statusId: selectedStatusId.value,
    status: option?.label ?? selectedStatusId.value
  })
}

function onDialogClick(event) {
  if (statusDropdownRoot.value?.contains(event.target)) return
  isStatusDropdownOpen.value = false
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) reset()
    else isStatusDropdownOpen.value = false
  }
)
</script>
