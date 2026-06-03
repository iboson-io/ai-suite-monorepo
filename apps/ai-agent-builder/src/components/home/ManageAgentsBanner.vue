<template>
  <section
    class="mx-auto mt-10xl flex max-w-3xl flex-col gap-xl rounded-2xl border border-info-100 bg-info-25 px-5xl py-5xl text-left sm:flex-row sm:items-center sm:justify-between"
  >
    <div class="flex items-start gap-xl">
      <div
        class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-pink-400 via-purple-400 to-indigo-400"
      >
        <img :src="AgentsIcon" alt="" class="h-5 w-5 brightness-0 invert" />
      </div>
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
