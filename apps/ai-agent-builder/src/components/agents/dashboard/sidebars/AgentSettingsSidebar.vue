<template>
  <AgentDashboardSubSidebarShell title="Settings" :is-open="isOpen" @close="$emit('close')">
    <div class="space-y-4xl">
      <div>
        <h4 class="label_1_semibold primary_text_color">Advanced settings</h4>
        <p class="body_3_regular secondary_text_color mt-sm">
          Optional settings to fine-tune AI agent behavior and safeguards.
        </p>
      </div>

      <div
        v-for="setting in settings"
        :key="setting.id"
        class="flex items-center justify-between rounded-xl border primary_border_color bg-gray-25 p-4xl"
      >
        <div class="min-w-0 pr-4xl">
          <p class="label_2_semibold primary_text_color">{{ setting.title }}</p>
          <p class="body_4_regular secondary_text_color mt-xs">{{ setting.description }}</p>
        </div>
        <label class="relative inline-flex shrink-0 cursor-not-allowed items-center">
          <input
            v-model="setting.enabled"
            type="checkbox"
            class="peer sr-only"
            disabled
          />
          <span
            class="h-6 w-10 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-info-500 peer-checked:after:translate-x-4"
          />
        </label>
      </div>
    </div>
  </AgentDashboardSubSidebarShell>
</template>

<script setup>
import { reactive } from 'vue'
import AgentDashboardSubSidebarShell from '../AgentDashboardSubSidebarShell.vue'

defineProps({
  isOpen: { type: Boolean, default: false },
})

defineEmits(['close'])

const settings = reactive([
  {
    id: 'responsible-ai',
    title: 'Responsible AI',
    description: 'Enable filters to prevent toxic or unsafe AI responses.',
    enabled: false,
  },
  {
    id: 'hallucination-control',
    title: 'Hallucination Control',
    description: 'Reduce chances of the AI generating inaccurate information.',
    enabled: false,
  },
  {
    id: 'memory',
    title: 'Memory',
    description: 'Allow the agent to remember prior chats.',
    enabled: false,
  },
])
</script>
