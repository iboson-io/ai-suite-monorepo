<template>
  <section
    class="mx-auto mt-10xl flex max-w-3xl flex-col gap-xl rounded-2xl bg-gradient-to-b from-[#E6F1FD] to-[#F2E6FF] px-5xl py-5xl text-left sm:flex-row sm:items-center sm:justify-between"
  >
    <div class="flex items-center gap-xl">
      <img :src="AgentsIcon" alt="" class="h-12 w-auto shrink-0" />
      <div>
        <h2 class="label_1_semibold primary_text_color">Manage AI Agents</h2>
        <p class="body_3_regular secondary_text_color mt-md">
          Create and manage AI agents to automate support and workflows.
        </p>
      </div>
    </div>

    <button
      type="button"
      class="inline-flex shrink-0 items-center justify-center gap-md rounded-lg bg-black-400 px-5xl py-xl label_2_semibold primary_2_text_color hover:opacity-90"
      @click="$emit('create-agent')"
    >
      Create Agent
      <img :src="DownArrow" alt="" class="h-4 w-4 rotate-180 brightness-0 invert" />
    </button>
  </section>
</template>

<script setup>
import AgentsIcon from '../../assets/images/AiIcon.svg'
import DownArrow from '../../assets/images/DownArrow.svg'

defineEmits(['create-agent'])
</script>
