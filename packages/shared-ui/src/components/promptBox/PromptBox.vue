<template>
  <div
    class="mx-auto mt-10 block w-full max-w-3xl"
    :class="isAiGenerating ? 'prompt-box-animated' : 'button-gradient'"
  >
    <div class="prompt-box-inner rounded-xl bg_secondary_color p-5xl">
      <input
        ref="promptInputRef"
        v-model="prompt"
        type="text"
        :placeholder="isListening ? 'Listening… speak now' : (props.placeholder || configPlaceholder || 'What\'s on your mind?')"
        class="w-full border-none outline-none label_1_regular"
        :class="[
          prompt ? 'primary_text_color' : 'secondary_text_color',
          props.isAiGenerating ? 'opacity-50 cursor-not-allowed' : ''
        ]"
        @keyup.enter="handleSend"
        @focus="isInputFocused = true"
        @blur="isInputFocused = false"
        :disabled="props.isAiGenerating || isListening"
      />

      <div class="mt-12 flex items-center justify-between">
        <div class="flex gap-2">
          <SelectBox
            v-if="!hideProductSelect"
            :model-value="selectedProduct.id"
            :options="allProductsOptions"
            :disabled="disableProductSelect"
            :show-arrow="!disableProductSelect"
            dropdown-class="w-40"
            @change="selectProduct"
          >
            <template #trigger="{ selectedOption, isOpen }">
              <img :src="ProductIcon" alt="" />
              <span class="hidden md:inline">{{ selectedOption?.name || selectedProduct.name }}</span>
              <img
                v-if="!disableProductSelect"
                :src="DownArrow"
                alt=""
                class="transition-transform duration-200"
                :class="{ 'rotate-180': isOpen }"
              />
            </template>
          </SelectBox>

          <label
            class="flex cursor-pointer items-center gap-md rounded-md border primary_border_color px-xl py-xs label_2_medium primary_text_color hover:bg-gray-25"
          >
            <img :src="AttachmentIcon" alt="" />
            <span class="hidden md:inline">Add files</span>
            <input type="file" class="hidden" multiple @change="handleFiles" />
          </label>

          <SelectBox
            v-if="showModelsDropdown !== false"
            :model-value="selectedModel"
            :options="models"
            :loading="isLoadingModels"
            dropdown-class="w-40"
            @change="selectModel"
          >
            <template #trigger="{ selectedOption, isOpen }">
              <img :src="GeminiIcon" alt="" />
              <span class="hidden md:inline">{{ selectedOption?.name || selectedModel || 'Model' }}</span>
              <img
                :src="DownArrow"
                alt=""
                class="transition-transform duration-200"
                :class="{ 'rotate-180': isOpen }"
              />
            </template>
          </SelectBox>
        </div>

        <div class="flex shrink-0 items-center gap-2">
          <button
            type="button"
            class="rounded-full transition-transform flex items-center justify-center"
            :class="[props.isAiGenerating ? 'opacity-50 cursor-not-allowed' : '']"
            :disabled="props.isAiGenerating"
            :aria-pressed="isListening"
            :aria-label="
              isListening
                ? 'Finish and send voice message'
                : prompt.trim()
                  ? 'Send message'
                  : 'Start voice input'
            "
            @click="handleMicOrSend"
          >
            <img v-if="isListening" class="h-8 w-8" :src="ActiveMikeIcon" alt="" />
            <img v-else-if="prompt.trim()" class="h-8 w-8" :src="SendIcon" alt="" />
            <img v-else class="h-8 w-8" :src="MikeIcon" alt="" />
          </button>
        </div>
      </div>

      <p
        v-if="speechUnsupportedMessage"
        class="mt-2 label_2_regular text-amber-700"
        role="status"
      >
        {{ speechUnsupportedMessage }}
      </p>

      <div v-if="files.length" class="mt-3 flex flex-wrap gap-2">
        <span
          v-for="file in files"
          :key="file.name"
          class="inline-flex items-center gap-sm rounded bg_primary_color pl-md pr-sm py-xs label_2_medium secondary_text_color"
        >
          <span class="truncate max-w-[200px]" :title="file.name">{{ file.name }}</span>
          <button
            type="button"
            class="inline-flex h-4 w-4 items-center justify-center rounded-full text-secondary_text_color transition-colors hover:bg-gray-200 hover:text-error-600"
            aria-label="Remove file"
            @click.stop="removeFile(file)"
          >
            <svg class="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.3" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import ProductIcon from '../../assets/images/ProductIcon.svg'
import AttachmentIcon from '../../assets/images/AttachmentIcon.svg'
import GeminiIcon from '../../assets/images/GeminiIcon.svg'
import DownArrow from '../../assets/images/DownArrow.svg'
import MikeIcon from '../../assets/images/MikeIcon.svg'
import SendIcon from '../../assets/images/SendIcon.svg'
import ActiveMikeIcon from '../../assets/images/ActiveMikeIcon.svg'
import SelectBox from '../common/SelectBox.vue'
import {
  fetchProducts as fetchProductsApi,
  fetchModels as fetchModelsApi,
  getPromptBoxConfig,
} from '@app/services/promptBox/promptBox.js'

const { allProductsLabel, placeholder: configPlaceholder, showModelsDropdown } = getPromptBoxConfig()
const allProductsOption = { id: null, name: allProductsLabel }

const props = defineProps({
  isAiGenerating: {
    type: Boolean,
    default: false,
  },
  initialProductId: {
    type: [String, Number],
    default: null,
  },
  showAllProductsOption: {
    type: Boolean,
    default: true,
  },
  disableProductSelect: {
    type: Boolean,
    default: false,
  },
  hideProductSelect: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['send-message'])

const prompt = ref('')
const promptInputRef = ref(null)
const isInputFocused = ref(false)

const products = ref([])
const selectedProduct = ref({ id: null, name: 'All products' })
const isLoadingProducts = ref(false)

const allProductsOptions = computed(() => {
  if (props.showAllProductsOption) {
    return [allProductsOption, ...products.value]
  }
  return products.value
})

const models = ref([])
const selectedModel = ref('')
const isLoadingModels = ref(false)

const files = ref([])

const isListening = ref(false)
const speechUnsupportedMessage = ref('')
const speechRecognition = ref(null)
const voiceFinal = ref('')

const canUseSpeechApi = () =>
  typeof window !== 'undefined' &&
  !!(window.SpeechRecognition || window.webkitSpeechRecognition)

function stopVoiceRecognition() {
  const r = speechRecognition.value
  if (!r) {
    isListening.value = false
    return
  }
  speechRecognition.value = null
  r.onresult = null
  r.onerror = null
  r.onend = null
  try {
    r.stop()
  } catch {
    /* ignore */
  }
  isListening.value = false
}

function abortVoiceRecognition() {
  const r = speechRecognition.value
  if (!r) {
    isListening.value = false
    return
  }
  speechRecognition.value = null
  r.onresult = null
  r.onerror = null
  r.onend = null
  try {
    r.abort()
  } catch {
    /* ignore */
  }
  isListening.value = false
}

function startVoiceRecognition() {
  speechUnsupportedMessage.value = ''
  if (!canUseSpeechApi()) {
    speechUnsupportedMessage.value =
      'Voice input is not supported in this browser. Try Chrome, Edge, or Safari.'
    return
  }
  if (props.isAiGenerating || isListening.value) return

  const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition
  const recognition = new Ctor()
  voiceFinal.value = ''
  prompt.value = ''

  recognition.lang = navigator.language || 'en-US'
  recognition.continuous = true
  recognition.interimResults = true

  recognition.onresult = (event) => {
    let interim = ''
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const piece = event.results[i][0].transcript
      if (event.results[i].isFinal) {
        voiceFinal.value += piece
      } else {
        interim += piece
      }
    }
    prompt.value = (voiceFinal.value + interim).trim()
  }

  recognition.onerror = (e) => {
    if (e.error === 'aborted') {
      if (speechRecognition.value === recognition) {
        speechRecognition.value = null
      }
      isListening.value = false
      return
    }
    if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
      speechUnsupportedMessage.value =
        'Microphone access was denied. Allow the microphone to use voice input.'
    } else if (e.error !== 'no-speech') {
      speechUnsupportedMessage.value = 'Voice input error. Try again.'
    }
    stopVoiceRecognition()
  }

  recognition.onend = () => {
    if (speechRecognition.value === recognition) {
      speechRecognition.value = null
    }
    isListening.value = false
  }

  speechRecognition.value = recognition

  try {
    recognition.start()
    isListening.value = true
  } catch {
    speechUnsupportedMessage.value = 'Could not start voice input.'
    speechRecognition.value = null
    isListening.value = false
  }
}

const selectProduct = (item) => {
  selectedProduct.value = item
}

function syncProductFromId(productId) {
  if (productId == null || productId === '' || productId === allProductsLabel) {
    if (!props.showAllProductsOption && products.value.length > 0) {
      selectedProduct.value = { id: products.value[0].id, name: products.value[0].name, kind: products.value[0].kind }
    } else {
      selectedProduct.value = { ...allProductsOption }
    }
    return
  }
  const idStr = String(productId)
  const match = products.value.find((p) => p.id != null && String(p.id) === idStr)
  selectedProduct.value = match
    ? { id: match.id, name: match.name, kind: match.kind }
    : (!props.showAllProductsOption && products.value.length > 0
        ? { id: products.value[0].id, name: products.value[0].name, kind: products.value[0].kind }
        : { id: productId, name: idStr })
}

function setSelectedProduct(productId) {
  syncProductFromId(productId)
}

const fetchProducts = async () => {
  isLoadingProducts.value = true
  try {
    products.value = await fetchProductsApi()
  } catch (error) {
    console.error('Error fetching products:', error)
    products.value = []
  } finally {
    isLoadingProducts.value = false
    syncProductFromId(props.initialProductId)
  }
}

const selectModel = (model) => {
  if (model && typeof model === 'object' && model.id != null) {
    selectedModel.value = String(model.id)
  } else if (model != null) {
    selectedModel.value = String(model)
  }
}

const fetchModels = async () => {
  isLoadingModels.value = true
  try {
    models.value = await fetchModelsApi()

    if (models.value.length > 0 && !selectedModel.value) {
      const def = models.value.find((m) => m.isDefault) || models.value[0]
      selectedModel.value = def.id
    }
  } catch (error) {
    console.error('Error fetching models:', error)
    models.value = []
  } finally {
    isLoadingModels.value = false
  }
}

const handleFiles = (e) => {
  const newFiles = Array.from(e.target.files || [])
  const merged = [...files.value]
  newFiles.forEach((file) => {
    if (!merged.some((f) => f.name === file.name && f.size === file.size)) {
      merged.push(file)
    }
  })
  files.value = merged
  e.target.value = ''
}

function removeFile(fileToRemove) {
  files.value = files.value.filter((f) => f !== fileToRemove)
}

function submitPrompt() {
  if (props.isAiGenerating) return
  const text = prompt.value.trim()
  if (!text) return

  emit('send-message', {
    text,
    product: selectedProduct.value.id,
    productKind: selectedProduct.value.kind,
    model: selectedModel.value,
    files: files.value,
  })
  prompt.value = ''
  voiceFinal.value = ''
  files.value = []

  nextTick(() => {
    promptInputRef.value?.focus?.()
  })
}

watch(
  () => props.isAiGenerating,
  (newVal, oldVal) => {
    if (!newVal && oldVal) {
      nextTick(() => {
        promptInputRef.value?.focus?.()
      })
    }
  }
)

const handleSend = () => {
  if (props.isAiGenerating) return
  stopVoiceRecognition()
  submitPrompt()
}

function handleMicOrSend() {
  if (props.isAiGenerating) return
  if (isListening.value) {
    stopVoiceRecognition()
    nextTick(() => {
      submitPrompt()
    })
    return
  }
  if (prompt.value.trim()) {
    handleSend()
    return
  }
  startVoiceRecognition()
}

function setPrompt(text, options = {}) {
  prompt.value = String(text ?? '').trim()
  const submit = Boolean(options?.submit)
  nextTick(() => {
    if (submit && prompt.value.trim()) {
      handleSend()
      return
    }
    promptInputRef.value?.focus?.()
  })
}

watch(
  () => props.initialProductId,
  (id) => syncProductFromId(id)
)

watch(products, () => {
  if (props.initialProductId != null && props.initialProductId !== '') {
    syncProductFromId(props.initialProductId)
  } else if (!props.showAllProductsOption && products.value.length > 0) {
    syncProductFromId(null)
  }
})

defineExpose({ setPrompt, setSelectedProduct, focus: () => promptInputRef.value?.focus?.() })

onMounted(() => {
  fetchProducts()
  if (showModelsDropdown !== false) {
    fetchModels()
  }
})

onUnmounted(() => {
  abortVoiceRecognition()
})
</script>
