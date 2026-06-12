<template>
  <SuccessToastNotification
    :open="activeToast !== null"
    :main-message="activeToast?.title || ''"
    :secondary-message="activeToast?.message || ''"
    :type="activeToastType"
    :duration="5000"
    @close="handleClose"
  />
</template>

<script setup>
import { computed } from 'vue'
import { SuccessToastNotification } from '@ai-suite/shared-ui'
import { useToast } from '@app/composables/useToast'

const { toasts, removeToast } = useToast()

const activeToast = computed(() => {
  return toasts.value.length > 0 ? toasts.value[toasts.value.length - 1] : null
})

const activeToastType = computed(() => {
  const t = activeToast.value?.type
  if (t === 'info') return 'success'
  return t || 'success'
})

function handleClose() {
  if (activeToast.value) {
    removeToast(activeToast.value.id)
  }
}
</script>