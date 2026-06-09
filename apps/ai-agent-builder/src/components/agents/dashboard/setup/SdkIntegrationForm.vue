<template>
  <div class="flex-1 flex flex-col justify-between min-h-0">
    <div class="flex-1 overflow-y-auto pr-2 space-y-6 min-h-0">
      <div>
        <h3 class="text-base font-bold text-gray-900 mb-1">Web Chat Widget Embedding</h3>
        <p class="text-sm text-gray-500 mb-6">Embed the client widget onto your webpage by adding the snippet below before the closing body tag.</p>

        <div class="bg-slate-900 rounded-xl p-5 relative font-mono text-xs text-slate-300 overflow-x-auto select-all shadow-inner border border-slate-950">
          <div class="flex items-center justify-between mb-3 border-b border-slate-800 pb-2 text-slate-400 text-[10px] uppercase tracking-wider font-semibold">
            <span>// HTML EMBED CODE</span>
            <button
              type="button"
              class="text-info-400 hover:text-info-300 font-bold transition-colors uppercase"
              @click="$emit('copy')"
            >
              {{ copiedLabel || 'Copy Code' }}
            </button>
          </div>
          <pre><code>{{ sdkSnippet }}</code></pre>
        </div>
      </div>

      <div class="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800 flex items-start gap-2.5">
        <svg class="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h4 class="font-bold mb-0.5">Need custom styling?</h4>
          <p class="text-xs text-blue-700">The chat widget colors and names adapt dynamically to customization changes you save in the <strong>Chatbot Customization</strong> tab without redeploying!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  sdkSnippet: { type: String, required: true },
  copiedLabel: { type: String, default: '' },
})

defineEmits(['copy'])
</script>
