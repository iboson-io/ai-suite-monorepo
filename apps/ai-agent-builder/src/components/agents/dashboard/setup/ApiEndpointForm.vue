<template>
  <div class="flex-1 flex flex-col justify-between min-h-0">
    <div class="flex-1 overflow-y-auto pr-2 space-y-6 min-h-0">
      <div>
        <div class="space-y-6">
          <!-- API URL Copy Box -->
          <div>
            <div class="flex items-center gap-1.5 mb-2">
              <label class="block text-sm font-semibold text-gray-900">API Endpoint</label>
              <svg class="w-4 h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <div class="flex items-center border border-gray-50 rounded-md px-4 bg-white focus-within:border-info-500 transition-colors">
              <svg class="w-5 h-5 text-gray-400 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <input
                type="text"
                readonly
                :value="formattedEndpoint"
                class="flex-1 bg-transparent text-sm text-gray-500 outline-none font-medium h-[46px]"
              />
              <button
                type="button"
                class="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded hover:bg-gray-50 ml-3"
                @click="$emit('copy-endpoint')"
                title="Copy Endpoint"
              >
                <svg v-if="endpointCopiedLabel === 'Copied!'" class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke-width="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke-width="2"></path>
                </svg>
              </button>
            </div>
            <p class="text-[11px] text-gray-400 mt-2">Use this endpoint to interact with your agent programmatically</p>
          </div>

          <!-- API Key Copy Box -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-1.5">
                <label class="block text-sm font-semibold text-gray-900">API Key</label>
                <svg class="w-4 h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <button
                type="button"
                class="text-xs font-semibold text-info-600 hover:text-info-700 disabled:opacity-50"
                :disabled="regeneratingKey"
                @click="$emit('regenerate-key')"
              >
                {{ regeneratingKey ? 'Regenerating...' : 'Regenerate' }}
              </button>
            </div>
            
            <div class="flex items-center border border-gray-50 rounded-md px-4 bg-white shadow-sm focus-within:border-info-500 transition-colors">
              <button
                type="button"
                class="text-gray-400 hover:text-gray-600 transition-colors mr-3 shrink-0"
                @click="$emit('update:showApiKey', !showApiKey)"
                title="Toggle Visibility"
              >
                <!-- Eye off if hidden (showApiKey is false), Eye if visible (showApiKey is true) -->
                <svg v-if="!showApiKey" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
              
              <input
                type="text"
                readonly
                :value="showApiKey ? (apiKey || '') : '********************************'"
                class="flex-1 bg-transparent text-sm text-gray-500 outline-none font-medium h-[46px]"
              />
              
              <button
                type="button"
                class="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded hover:bg-gray-50 ml-3"
                @click="$emit('copy-key')"
                title="Copy Key"
              >
                <svg v-if="keyCopiedLabel === 'Copied!'" class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke-width="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke-width="2"></path>
                </svg>
              </button>
            </div>
            <p class="text-[11px] text-gray-400 mt-2">Required for authentication with the API</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  formattedEndpoint: { type: String, required: true },
  apiKey: { type: String, default: '' },
  showApiKey: { type: Boolean, default: false },
  regeneratingKey: { type: Boolean, default: false },
  endpointCopiedLabel: { type: String, default: '' },
  keyCopiedLabel: { type: String, default: '' },
})

defineEmits(['copy-endpoint', 'copy-key', 'regenerate-key', 'update:showApiKey'])
</script>
