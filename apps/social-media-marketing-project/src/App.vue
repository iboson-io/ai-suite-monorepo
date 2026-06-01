<script setup>
  import { RouterView } from 'vue-router'
</script>

<template>
  <div class="h-dvh w-full overflow-hidden">
    <RouterView v-slot="{ Component }">
      <component :is="Component" class="h-full min-h-0" />
    </RouterView>
  </div>
</template>