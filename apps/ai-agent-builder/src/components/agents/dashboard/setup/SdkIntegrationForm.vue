<template>
  <div class="flex-1 flex flex-col justify-between min-h-0">
    <div class="flex-1 overflow-y-auto pr-2 space-y-6 min-h-0">
      <div>
        
        <div class="bg-slate-900 rounded-xl p-5 pr-14 relative font-mono text-xs text-slate-300 overflow-x-auto select-all shadow-inner border border-slate-950">
          <pre><code>{{ sdkSnippet }}</code></pre>
          
          <button
            type="button"
            class="absolute bottom-4 right-4 p-2 rounded bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors shadow-sm"
            @click="$emit('copy')"
            title="Copy Code"
          >
            <svg v-if="copiedLabel === 'Copied!'" class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke-width="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke-width="2"></path>
            </svg>
          </button>
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
