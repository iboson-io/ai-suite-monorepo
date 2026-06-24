<template>
  <div class="flex-1 flex flex-col justify-between min-h-0">
    <div class="flex-1 overflow-y-auto pr-2 space-y-6 min-h-0">
      <div>
        <div class="space-y-6">
          <!-- Twilio Voice Webhook Details -->
          <div>
            <div class="flex items-center gap-1.5 mb-2">
              <label class="block text-sm font-semibold text-gray-900">Twilio Voice Webhook</label>
              <Tooltip text="Configure this webhook URL in your Twilio Console under your phone number's &quot;A call comes in&quot; webhook setting." position="top" :show-tail="true">
                <svg class="w-4 h-4 text-gray-400 hover:text-gray-900 transition-colors duration-200 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </Tooltip>
            </div>
            
            <div class="flex items-center border border-gray-255 rounded-lg px-4 bg-white focus-within:border-info-500 transition-colors shadow-sm">
              <svg class="w-5 h-5 text-gray-400 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <input
                type="text"
                readonly
                :value="voiceWebhook || 'No webhook available'"
                class="flex-1 bg-transparent text-sm text-gray-500 outline-none font-medium h-[46px]"
              />
              <button
                type="button"
                class="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded hover:bg-gray-50 ml-3"
                @click="$emit('copy-webhook')"
                title="Copy Webhook"
              >
                <svg v-if="webhookCopiedLabel === 'Copied!'" class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke-width="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke-width="2"></path>
                </svg>
              </button>
            </div>
            <p class="text-[11px] text-gray-400 mt-2">Configure this webhook URL in your Twilio Console under your phone number's "A call comes in" webhook setting</p>
          </div>

       
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Tooltip } from '@ai-suite/shared-ui';

defineProps({
  voiceWebhook: { type: String, default: '' },
  voiceEndpoint: { type: String, default: '' },
  webhookCopiedLabel: { type: String, default: '' },
  endpointCopiedLabel: { type: String, default: '' },
})

defineEmits(['copy-webhook', 'copy-endpoint'])
</script>
