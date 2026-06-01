<template>
  <div class="flex flex-col gap-3xl">
    <!-- List name -->
    <div class="flex flex-col items-start">
      <label
        class="label_2_semibold primary_text_color"
        :class="!isEditingName ? 'disable_text_color' : ''"
      >
        List name:
      </label>
      <div class="mt-sm flex w-full max-w-xl flex-wrap items-center gap-xl">
        <input
          v-model="editableName"
          type="text"
          :disabled="!isEditingName"
          class="h-12 min-w-0 flex-1 rounded-lg border border-black-50 px-3xl py-xl label_1_medium"
          :class="
            !isEditingName
              ? 'disable_text_color cursor-not-allowed bg-info-50 tertiary_text_color'
              : 'bg_secondary_color primary_text_color'
          "
          :style="
            isEditingName
              ? { border: '1px solid #0068CF', boxShadow: '0px 0px 0px 3px #D9E2FC' }
              : {}
          "
        />
        <div v-if="!isEditingName" class="flex shrink-0">
          <button
            type="button"
            class="inline-flex h-12 w-12 items-center justify-center rounded-lg border primary_border_color bg_secondary_color transition-colors hover:bg-info-50"
            aria-label="Edit list name"
            @click="startEditingName"
          >
            <img :src="InputboxEditIcon" alt="" class="h-[3.25em] w-[3.25em]" aria-hidden="true" />
          </button>
        </div>
        <div v-else class="flex shrink-0 gap-xl">
          <button
            type="button"
            class="inline-flex h-12 items-center justify-center rounded-lg border px-xxl label_1_semibold primary_border_color bg-gray-25 primary_text_color transition-colors hover:bg-info-50"
            @click="cancelEditingName"
          >
            Cancel
          </button>
          <button
            type="button"
            class="inline-flex h-12 items-center justify-center rounded-lg px-xxl label_1_semibold primary_button"
            @click="saveListName"
          >
            Save
          </button>
        </div>
      </div>
    </div>

    <!-- List ID -->
    <div class="flex flex-col items-start">
      <label class="label_2_semibold primary_text_color disable_text_color">
        List ID:
      </label>
      <div class="mt-sm flex w-full max-w-xl items-center gap-xl">
        <input
          :value="displayListId"
          type="text"
          readonly
          disabled
          class="h-12 min-w-0 flex-1 cursor-not-allowed rounded-lg border border-black-50 bg-info-50 px-3xl py-xl label_2_medium disable_text_color"
        />
        <button
          type="button"
          class="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border primary_border_color bg_secondary_color transition-colors hover:bg-info-50"
          aria-label="Copy list ID"
          @click="copyListId"
        >
          <img :src="CopyIconWhite" alt="" class="h-[3.25em] w-[3.25em]" aria-hidden="true" />
        </button>
      </div>
    </div>

    <!-- Toggle settings -->
    <div
      v-for="setting in toggleSettings"
      :key="setting.id"
      class="flex items-start justify-between gap-4xl"
    >
      <div class="min-w-0 flex-1">
        <h3 class="label_1_semibold primary_text_color mt-md">{{ setting.title }}</h3>
        <p class="mt-md label_1_regular secondary_text_color">
          {{ setting.description }}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        :aria-checked="settingValues[setting.id]"
        :aria-label="setting.title"
        class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors"
        :class="settingValues[setting.id] ? 'bg-emerald-500' : 'bg-gray-200'"
        @click="toggleSetting(setting.id)"
      >
        <span
          class="inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform"
          :class="settingValues[setting.id] ? 'translate-x-5' : 'translate-x-1'"
        />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import InputboxEditIcon from '../../../assets/images/InputboxEditIcon.svg'
import CopyIconWhite from '../../../assets/images/CopyIconWhite.svg'

const DEMO_LIST_ID = 'Rf57id'

const DEFAULT_SETTING_VALUES = {
  doubleOptIn: true,
  welcomeEmailOnSubscribe: true,
  allowPreferenceUpdates: false
}

const toggleSettings = [
  {
    id: 'doubleOptIn',
    title: 'Double opt-in',
    description: 'Require contacts to confirm their email before joining this list.'
  },
  {
    id: 'welcomeEmailOnSubscribe',
    title: 'Send welcome email on subscribe',
    description: 'Automatically send a welcome email after a contact subscribes.'
  },
  {
    id: 'allowPreferenceUpdates',
    title: 'Allow contacts to update preferences',
    description: 'Let contacts manage their email and SMS preferences.'
  }
]

const props = defineProps({
  listName: {
    type: String,
    default: 'Email List'
  },
  listId: {
    type: [String, Number],
    default: undefined
  },
  /** Omit to use demo defaults */
  settings: {
    type: Object,
    default: undefined
  }
})

const emit = defineEmits(['save-name', 'update-setting'])

const displayListId = computed(() => {
  if (props.listId != null && String(props.listId).trim() !== '') {
    return String(props.listId)
  }
  return DEMO_LIST_ID
})

const isEditingName = ref(false)
const editableName = ref(props.listName)
const savedName = ref(props.listName)

const settingValues = ref({
  ...DEFAULT_SETTING_VALUES,
  ...(props.settings ?? {})
})

watch(
  () => props.listName,
  (name) => {
    if (!isEditingName.value) {
      editableName.value = name
      savedName.value = name
    }
  }
)

watch(
  () => props.settings,
  (next) => {
    if (next) {
      settingValues.value = { ...DEFAULT_SETTING_VALUES, ...next }
    }
  },
  { deep: true }
)

function startEditingName() {
  isEditingName.value = true
}

function cancelEditingName() {
  editableName.value = savedName.value
  isEditingName.value = false
}

function saveListName() {
  const trimmed = editableName.value.trim()
  if (!trimmed) return
  savedName.value = trimmed
  editableName.value = trimmed
  isEditingName.value = false
  emit('save-name', trimmed)
}

async function copyListId() {
  try {
    await navigator.clipboard.writeText(displayListId.value)
  } catch {
    // fallback for older browsers
    const el = document.createElement('textarea')
    el.value = displayListId.value
    el.setAttribute('readonly', '')
    el.style.position = 'absolute'
    el.style.left = '-9999px'
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
  }
}

function toggleSetting(id) {
  settingValues.value[id] = !settingValues.value[id]
  emit('update-setting', { id, value: settingValues.value[id] })
}
</script>
