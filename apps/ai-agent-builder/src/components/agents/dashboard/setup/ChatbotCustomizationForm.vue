<template>
  <div class="flex-1 flex flex-col justify-between min-h-0">
    <div class="flex-1 overflow-y-auto pr-2 space-y-6 min-h-0">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Name Field -->
        <div>
          <label class="block label_2_semibold text-black-400  tracking-wider mb-2">Name</label>
          <input
            type="text"
            :value="name"
            @input="$emit('update:name', $event.target.value)"
            class="w-full px-4 py-2.5 border border-gray-50 rounded-md text-sm focus:outline-none focus:border-info-500 bg-white"
            placeholder="e.g., Refund Approval Agent"
          />
        </div>

        <!-- Color Box Field -->
        <div>
          <label class="block label_2_semibold text-black-400  tracking-wider mb-2">Color</label>
          <div
            class="w-full h-[42px]  border-gray-50 rounded-md  cursor-pointer flex items-center justify-center font-bold text-sm relative border  shadow-sm transition-all hover:opacity-90"
            :style="{ backgroundColor: color }"
            @click="triggerColorPicker"
          >
            <input
              ref="colorInputRef"
              type="color"
              :value="color"
              @input="$emit('update:color', $event.target.value)"
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <span
              class="font-mono uppercase text-sm tracking-wider select-none font-semibold"
              :style="{ color: isLightColor(color) ? '#111827' : '#FFFFFF' }"
            >
              {{ color }}
            </span>
          </div>
        </div>
      </div>

      <!-- Logo & Icon Blocks -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Company Logo -->
        <div class="space-y-2 flex flex-col">
          <div class="border border-gray-50 rounded-md bg-white flex flex-col items-center justify-center text-center relative w-full shadow-sm h-32">
            <img
              v-if="logoPreviewUrl"
              :src="logoPreviewUrl"
              alt="Logo preview"
              class="w-16 h-16 object-contain"
            />
            <div v-else class="text-gray-400">
              <svg class="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
           
            <input
              ref="logoInputRef"
              type="file"
              class="hidden"
              accept="image/*"
              @change="handleLogoChange"
            />
          </div>
           <button
              type="button"
              class="bg-[#1E2238] hover:bg-slate-800 text-white font-bold py-2 px-8 rounded-lg text-sm transition-colors shadow-sm mb-3 w-full"
              @click="triggerLogoUpload"
            >
              Replace
            </button>
          <p class="text-[11px] text-gray-400">Accepted formats - .png, .jpg, .jpeg, .mp4</p>
          <p class="text-[11px] text-gray-400">Max file size - 5MB</p>
        </div>

        <!-- Chatbot Icon -->
        <div class="space-y-2 flex flex-col">
          <div class="border border-gray-50 rounded-md bg-white flex flex-col items-center justify-center text-center relative w-full shadow-sm h-32">
            <img
              v-if="iconPreviewUrl"
              :src="iconPreviewUrl"
              alt="Icon preview"
              class="w-16 h-16 object-contain"
            />
            <div v-else class="text-gray-400">
              <svg class="w-10 h-10 mx-auto" viewBox="0 0 18 18" fill="none" stroke="currentColor">
                <path d="M5.33333 5.33333H12.6667M5.33333 9H10.8333M6.25 13.5833H3.5C2.77065 13.5833 2.07118 13.2936 1.55546 12.7779C1.03973 12.2622 0.75 11.5627 0.75 10.8333V3.5C0.75 2.77065 1.03973 2.07118 1.55546 1.55546C2.07118 1.03973 2.77065 0.75 3.5 0.75H14.5C15.2293 0.75 15.9288 1.03973 16.4445 1.55546C16.9603 2.07118 17.25 2.77065 17.25 3.5V10.8333C17.25 11.5627 16.9603 12.2622 16.4445 12.7779C15.9288 13.2936 15.2293 13.5833 14.5 13.5833H11.75L9 16.3333L6.25 13.5833Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
           
            <input
              ref="iconInputRef"
              type="file"
              class="hidden"
              accept="image/*"
              @change="handleIconChange"
            />
          </div>
           <button
              type="button"
              class="bg-[#1E2238] hover:bg-slate-800 text-white font-bold py-2 px-8 rounded-lg text-sm transition-colors shadow-sm mb-3 w-full"
              @click="triggerIconUpload"
            >
              Replace
            </button>
          <p class="text-[11px] text-gray-400">Accepted formats - .png, .jpg, .jpeg, .mp4</p>
          <p class="text-[11px] text-gray-400">Max file size - 5MB</p>
        </div>
      </div>
    </div>

    <!-- Action Button -->
    <div class="pt-6 border-t border-gray-100 flex justify-end shrink-0">
      <button
        type="button"
        class="bg-[#1E2238] hover:bg-slate-800 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors inline-flex items-center gap-2"
        :disabled="saving"
        @click="$emit('save')"
      >
        <span v-if="saving" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        {{ saving ? 'Saving Changes...' : 'Save Changes' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  name: { type: String, required: true },
  color: { type: String, required: true },
  logoPreviewUrl: { type: String, default: '' },
  iconPreviewUrl: { type: String, default: '' },
  saving: { type: Boolean, default: false },
})

const emit = defineEmits([
  'update:name',
  'update:color',
  'logo-change',
  'icon-change',
  'save',
])

const colorInputRef = ref(null)
const logoInputRef = ref(null)
const iconInputRef = ref(null)

function triggerColorPicker() {
  colorInputRef.value?.click()
}
function triggerLogoUpload() {
  logoInputRef.value?.click()
}
function triggerIconUpload() {
  iconInputRef.value?.click()
}

function handleLogoChange(event) {
  const file = event.target.files[0]
  if (file) {
    emit('logo-change', file)
  }
}

function handleIconChange(event) {
  const file = event.target.files[0]
  if (file) {
    emit('icon-change', file)
  }
}

const isLightColor = (hex) => {
  if (!hex) return false
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return false
  const r = parseInt(result[1], 16)
  const g = parseInt(result[2], 16)
  const b = parseInt(result[3], 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5
}
</script>
