<template>
  <div class="flex-1 flex flex-col justify-between min-h-0">
    <div class="flex-1 overflow-y-auto pr-2 space-y-6 min-h-0">
      <div>
        <h3 class="text-base font-bold text-gray-900 mb-1">Integrate programmatically</h3>
        <p class="text-sm text-gray-500 mb-6">You can call the agent directly through standard HTTP requests using the credentials below.</p>

        <div class="space-y-5">
          <!-- API URL Copy Box -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">API Endpoint URL</label>
            <div class="flex items-center border border-gray-300 rounded-xl overflow-hidden px-4 bg-gray-50">
              <span class="text-xs font-bold text-gray-500 mr-3 select-none">URL</span>
              <div class="w-px h-8 bg-gray-200 mr-3" />
              <input
                type="text"
                readonly
                :value="formattedEndpoint"
                class="flex-1 bg-transparent text-sm text-gray-800 outline-none font-medium h-[42px]"
              />
              <button
                type="button"
                class="text-sm font-semibold text-info-600 hover:text-info-700 transition-colors ml-3"
                @click="$emit('copy-endpoint')"
              >
                {{ endpointCopiedLabel || 'Copy' }}
              </button>
            </div>
          </div>

          <!-- API Key Copy Box -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="block text-sm font-semibold text-gray-700">API Key</label>
              <button
                type="button"
                class="text-xs font-semibold text-info-600 hover:text-info-700 disabled:opacity-50"
                :disabled="regeneratingKey"
                @click="$emit('regenerate-key')"
              >
                {{ regeneratingKey ? 'Regenerating...' : 'Regenerate' }}
              </button>
            </div>
            <div class="flex items-center border border-gray-300 rounded-xl overflow-hidden px-4 bg-white">
              <span class="text-xs font-bold text-gray-500 mr-3 select-none">KEY</span>
              <div class="w-px h-8 bg-gray-200 mr-3" />
              <input
                :type="showApiKey ? 'text' : 'password'"
                readonly
                :value="apiKey || '••••••••••••••••••••••••••••••••'"
                class="flex-1 bg-transparent text-sm text-gray-800 outline-none font-mono h-[42px]"
              />
              <button
                type="button"
                class="text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors mr-3"
                @click="$emit('update:showApiKey', !showApiKey)"
              >
                {{ showApiKey ? 'Hide' : 'Show' }}
              </button>
              <button
                type="button"
                class="text-sm font-semibold text-info-600 hover:text-info-700 transition-colors"
                @click="$emit('copy-key')"
              >
                {{ keyCopiedLabel || 'Copy' }}
              </button>
            </div>
            <p class="text-[11px] text-gray-400 mt-1.5">Required for authentication with the HTTP API</p>
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
