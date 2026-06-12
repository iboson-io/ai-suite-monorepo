<template>
  <AgentDashboardChat
    mode="multi"
    :group="group"
    :selected-chat-id="selectedChatId"
    @chat-created="$emit('chat-created', $event)"
    @chat-used="$emit('chat-used', $event)"
  />
</template>

<script setup>
import AgentDashboardChat from '../dashboard/AgentDashboardChat.vue'

defineProps({
  group: { type: Object, default: null },
  selectedChatId: { type: [String, Number], default: null },
})

defineEmits(['chat-created', 'chat-used'])
</script>
