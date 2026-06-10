<template>
  <div class="h-full min-h-0 flex flex-col overflow-hidden">
    <ListPanel
      v-if="!selectedWorkflowId"
      @open-workflow="selectedWorkflowId = $event"
    />
    <JointEditor
      v-else
      :workflow-id="selectedWorkflowId"
      @back="selectedWorkflowId = null"
      @workflow-deleted="selectedWorkflowId = null"
    />
    <Toast />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import ListPanel from '@app/components/workflow/ListPanel.vue'
import JointEditor from '@app/components/workflow/JointEditor.vue'
import Toast from '@app/components/workflow/Toast.vue'

const selectedWorkflowId = ref(null)

const emit = defineEmits(['toggle-sidebar'])

watch(selectedWorkflowId, (val) => {
  emit('toggle-sidebar', !!val)
}, { immediate: true })
</script>

<style scoped>
/* Any view-specific styles can be added here */
</style>
