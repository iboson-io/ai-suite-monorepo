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
        :placeholder="isListening ? 'Listening… speak now' : (placeholder || 'What\'s on your mind?')"
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
          <div class="relative" ref="productsDropdownRef">
            <button
              @click="toggleProducts"
              class="flex items-center gap-md rounded-lg border primary_border_color px-xl py-xs label_2_medium primary_text_color hover:bg-gray-25"
            >
              <img :src="ProductIcon" alt="" />
              <span class="hidden md:inline">{{ selectedProduct.name }}</span>
              <img :src="DownArrow" alt="" />
            </button>

            <div
              v-if="showProducts"
              ref="productsDropdownMenuRef"
              :class="[
                'absolute left-0 z-10 w-40 rounded-md border primary_border_color bg_secondary_color max-h-48 overflow-y-auto',
                productsDropdownPosition === 'above' ? 'bottom-full mb-xs' : 'top-9'
              ]"
            >
              <div
                v-if="showAllProductsOption"
                @click="selectProduct(allProductsOption)"
                class="cursor-pointer px-xl py-md label_2_medium secondary_text_color hover:bg-gray-50"
              >
                {{ allProductsLabel }}
              </div>
              <div
                v-for="item in products"
                :key="item.id"
                @click="selectProduct(item)"
                class="cursor-pointer px-xl py-md label_2_medium secondary_text_color hover:bg-gray-50"
              >
                {{ item.name }}
              </div>
            </div>
          </div>

          <label
            class="flex cursor-pointer items-center gap-md rounded-md border primary_border_color px-xl py-xs label_2_medium primary_text_color hover:bg-gray-25"
          >
            <img :src="AttachmentIcon" alt="" />
            <span class="hidden md:inline">Add files</span>
            <input type="file" class="hidden" multiple @change="handleFiles" />
          </label>

          <div v-if="showModelsDropdown !== false" class="relative" ref="modelsDropdownRef">
            <button
              @click="toggleModels"
              class="flex items-center gap-md rounded-md border primary_border_color bg_secondary_color px-xl py-xs label_2_medium primary_text_color hover:bg-gray-25"
            >
              <img :src="GeminiIcon" alt="" />
              <span class="hidden md:inline">{{ selectedModelDisplayLabel }}</span>
              <img :src="DownArrow" alt="" />
            </button>

            <div
              v-if="showModels"
              ref="modelsDropdownMenuRef"
              :class="[
                'absolute left-0 z-10 w-40 rounded-md border primary_border_color bg_secondary_color shadow max-h-48 overflow-y-auto',
                modelsDropdownPosition === 'above' ? 'bottom-full mb-xs' : 'top-9'
              ]"
            >
              <div
                v-for="model in models"
                :key="model.id"
                @click="selectModel(model)"
                class="cursor-pointer px-xl py-xs label_2_medium secondary_text_color hover:bg-gray-50"
              >
                {{ model.name }}
              </div>
              <div
                v-if="isLoadingModels"
                class="px-xl py-xs label_2_medium secondary_text_color"
              >
                Loading...
              </div>
            </div>
          </div>
        </div>

        <div class="flex shrink-0 items-center gap-2">
          <button
            type="button"
            class="rounded-full p-1 transition-transform"
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
            <img v-if="isListening" class="h-10 w-10" :src="ActiveMikeIcon" alt="" />
            <img v-else-if="prompt.trim()" :src="SendIcon" alt="" />
            <img v-else :src="MikeIcon" alt="" />
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
          class="rounded bg_primary_color px-md py-xs label_2_medium secondary_text_color"
        >
          {{ file.name }}
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
import {
  fetchProducts as fetchProductsApi,
  fetchModels as fetchModelsApi,
  getPromptBoxConfig,
} from '@app/services/promptBox/promptBox.js'

const { allProductsLabel, placeholder, showModelsDropdown } = getPromptBoxConfig()
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
})

const emit = defineEmits(['send-message'])

const prompt = ref('')
const promptInputRef = ref(null)
const isInputFocused = ref(false)

const products = ref([])
const selectedProduct = ref({ id: null, name: 'All products' })
const showProducts = ref(false)
const productsDropdownRef = ref(null)
const productsDropdownMenuRef = ref(null)
const productsDropdownPosition = ref('below')
const isLoadingProducts = ref(false)

const models = ref([])
const selectedModel = ref('')
const selectedModelDisplayLabel = computed(() => {
  const id = selectedModel.value
  if (!id) return 'Model'
  const row = models.value.find((m) => m.id === id)
  return row?.name || id
})
const showModels = ref(false)
const modelsDropdownRef = ref(null)
const modelsDropdownMenuRef = ref(null)
const modelsDropdownPosition = ref('below')
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

const calculateDropdownPosition = (dropdownRef, menuRef, positionRef) => {
  if (!dropdownRef || !menuRef) return

  nextTick(() => {
    const rect = dropdownRef.getBoundingClientRect()
    const menuRect = menuRef.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const spaceBelow = viewportHeight - rect.bottom
    const spaceAbove = rect.top
    const menuHeight = menuRect.height || 200

    if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
      positionRef.value = 'above'
    } else {
      positionRef.value = 'below'
    }
  })
}

const toggleProducts = () => {
  showProducts.value = !showProducts.value
  showModels.value = false

  if (showProducts.value) {
    calculateDropdownPosition(
      productsDropdownRef.value,
      productsDropdownMenuRef.value,
      productsDropdownPosition
    )
  }
}

const toggleModels = () => {
  showModels.value = !showModels.value
  showProducts.value = false

  if (showModels.value) {
    calculateDropdownPosition(
      modelsDropdownRef.value,
      modelsDropdownMenuRef.value,
      modelsDropdownPosition
    )
  }
}

const selectProduct = (item) => {
  selectedProduct.value = item
  showProducts.value = false
}

function syncProductFromId(productId) {
  if (productId == null || productId === '' || productId === allProductsLabel) {
    if (!props.showAllProductsOption && products.value.length > 0) {
      selectedProduct.value = { id: products.value[0].id, name: products.value[0].name }
    } else {
      selectedProduct.value = { ...allProductsOption }
    }
    return
  }
  const idStr = String(productId)
  const match = products.value.find((p) => p.id != null && String(p.id) === idStr)
  selectedProduct.value = match
    ? { id: match.id, name: match.name }
    : (!props.showAllProductsOption && products.value.length > 0
        ? { id: products.value[0].id, name: products.value[0].name }
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
  showModels.value = false
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
  files.value = Array.from(e.target.files)
}

function submitPrompt() {
  if (props.isAiGenerating) return
  const text = prompt.value.trim()
  if (!text) return

  emit('send-message', {
    text,
    product: selectedProduct.value.id,
    model: selectedModel.value,
    files: files.value,
  })
  prompt.value = ''
  voiceFinal.value = ''
  files.value = []
}

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

defineExpose({ setPrompt, setSelectedProduct })

const handleClickOutside = (event) => {
  if (
    showProducts.value &&
    productsDropdownRef.value &&
    !productsDropdownRef.value.contains(event.target)
  ) {
    showProducts.value = false
  }

  if (
    showModels.value &&
    modelsDropdownRef.value &&
    !modelsDropdownRef.value.contains(event.target)
  ) {
    showModels.value = false
  }
}

const handleResize = () => {
  if (showProducts.value) {
    calculateDropdownPosition(
      productsDropdownRef.value,
      productsDropdownMenuRef.value,
      productsDropdownPosition
    )
  }
  if (showModels.value) {
    calculateDropdownPosition(
      modelsDropdownRef.value,
      modelsDropdownMenuRef.value,
      modelsDropdownPosition
    )
  }
}

watch(showProducts, (newVal) => {
  if (newVal) {
    nextTick(() => {
      calculateDropdownPosition(
        productsDropdownRef.value,
        productsDropdownMenuRef.value,
        productsDropdownPosition
      )
    })
  }
})

watch(showModels, (newVal) => {
  if (newVal) {
    nextTick(() => {
      calculateDropdownPosition(
        modelsDropdownRef.value,
        modelsDropdownMenuRef.value,
        modelsDropdownPosition
      )
    })
  }
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', handleResize)
  window.addEventListener('scroll', handleResize, true)
  fetchProducts()
  if (showModelsDropdown !== false) {
    fetchModels()
  }
})

onUnmounted(() => {
  abortVoiceRecognition()
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('scroll', handleResize, true)
})
</script>
