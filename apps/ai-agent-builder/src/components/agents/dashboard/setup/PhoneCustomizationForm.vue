<template>
  <div class="flex-1 flex flex-col justify-between min-h-0">
    <div class="flex-1 overflow-y-auto pr-2 space-y-6 min-h-0">
      <div class="max-w-xl">
        <h3 class="text-base font-bold text-gray-900 mb-1">Voice Assistant Integration</h3>
        <p class="text-sm text-gray-500 mb-6">Integrate your agent with phone services to handle calls in real-time.</p>
        
        <div class="space-y-4">
          <!-- Voice type -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Voice Style</label>
            <select
              :value="voiceStyle"
              @change="$emit('update:voiceStyle', $event.target.value)"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-info-500 bg-white"
            >
              <option value="amber">Amber (Smooth, Female)</option>
              <option value="sarah">Sarah (Professional, Female)</option>
              <option value="john">John (Friendly, Male)</option>
              <option value="david">David (Warm, Male)</option>
            </select>
          </div>

          <!-- Greeting Message -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Initial Call Greeting</label>
            <textarea
              :value="voiceGreeting"
              @input="$emit('update:voiceGreeting', $event.target.value)"
              rows="3"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-info-500 resize-none"
              placeholder="e.g. Hello, thank you for calling. How can I assist you with your request today?"
            />
          </div>

          <!-- Phone Number -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Assigned Phone Number</label>
            <input
              type="text"
              readonly
              value="+1 (888) 456-7890"
              class="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm font-mono text-gray-600 outline-none"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Action Button -->
    <div class="pt-6 border-t border-gray-100 flex justify-end shrink-0">
      <button
        type="button"
        class="bg-[#1E2238] hover:bg-slate-800 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
        @click="$emit('save')"
      >
        Save Changes
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  voiceStyle: { type: String, required: true },
  voiceGreeting: { type: String, required: true },
})

defineEmits(['update:voiceStyle', 'update:voiceGreeting', 'save'])
</script>
