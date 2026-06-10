<script setup>
import { watch, nextTick } from 'vue'
import { useVueFlow, useNodesInitialized } from '@vue-flow/core'

const props = defineProps({
  tick: {
    type: Number,
    default: 0
  }
})

const { fitView } = useVueFlow()
const nodesReady = useNodesInitialized()

watch(
  [() => props.tick, nodesReady],
  async () => {
    if (!props.tick || !nodesReady.value) return
    await nextTick()
    requestAnimationFrame(() => {
      fitView({ padding: 0.18, duration: 220 })
    })
  },
  { flush: 'post' }
)
</script>

<template>
  <span class="sr-only" aria-hidden="true" />
</template>
