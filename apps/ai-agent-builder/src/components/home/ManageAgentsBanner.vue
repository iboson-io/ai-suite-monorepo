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

    <div ref="triggerRef" class="relative create-agent-dropdown shrink-0">
      <button
        type="button"
        class="inline-flex items-center justify-center gap-md rounded-lg bg-black-400 px-5xl py-xl label_2_semibold primary_2_text_color hover:opacity-90"
        @click.stop="toggleDropdown"
      >
        Create Agent
        <img
          :src="DownArrow"
          alt=""
          class="h-4 w-4 brightness-0 invert transition-transform duration-200"
          :class="{ 'rotate-180': isDropdownOpen && !opensUpward }"
        />
      </button>
    </div>

    <Teleport to="body">
      <div
        v-if="isDropdownOpen"
        ref="dropdownRef"
        class="create-agent-menu fixed z-[9999] w-[401px] overflow-hidden rounded-2xl border primary_border_color bg_secondary_color shadow-lg"
        :style="dropdownStyle"
        @click.stop
      >
        <button
          type="button"
          class="flex w-full items-start gap-xl px-5xl py-4xl text-left transition-colors hover:bg-gray-25"
          @click="selectAgentType('single')"
        >
          <img :src="SingleAgentIcon" alt="" class="h-[42px] w-[42px] shrink-0" />
          <div>
            <p class="label_2_semibold primary_text_color">Single</p>
            <p class="body_3_regular secondary_text_color mt-xs">
              One AI agent that uses tools, knowledge, chat, and voice to complete tasks
            </p>
          </div>
        </button>

        <div class="h-px bg-gray-25" />

        <button
          type="button"
          class="flex w-full items-start gap-xl px-5xl py-4xl text-left transition-colors hover:bg-gray-25"
          @click="selectAgentType('multi')"
        >
          <img :src="MultiAgentIcon" alt="" class="h-[42px] w-[42px] shrink-0" />
          <div>
            <p class="label_2_semibold primary_text_color">Multi</p>
            <p class="body_3_regular secondary_text_color mt-xs">
              Multiple AI agents working together to handle complex tasks and workflows
            </p>
          </div>
        </button>
      </div>
    </Teleport>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import AgentsIcon from '../../assets/images/ManageAiIcon.svg'
import DownArrow from '../../assets/images/DownArrow.svg'
import SingleAgentIcon from '../../assets/images/singleAgent.svg'
import MultiAgentIcon from '../../assets/images/multiAgent.svg'

const emit = defineEmits(['create-agent'])

const triggerRef = ref(null)
const dropdownRef = ref(null)
const isDropdownOpen = ref(false)
const opensUpward = ref(false)
const dropdownStyle = ref({})

const DROPDOWN_WIDTH = 401
const DROPDOWN_GAP = 8
const VIEWPORT_PADDING = 8

function updateDropdownPosition() {
  if (!triggerRef.value || !isDropdownOpen.value) return

  const rect = triggerRef.value.getBoundingClientRect()
  const dropdownHeight = dropdownRef.value?.offsetHeight ?? 220
  const spaceBelow = window.innerHeight - rect.bottom
  const spaceAbove = rect.top

  opensUpward.value = spaceBelow < dropdownHeight + DROPDOWN_GAP && spaceAbove >= spaceBelow

  const left = Math.min(
    Math.max(VIEWPORT_PADDING, rect.right - DROPDOWN_WIDTH),
    window.innerWidth - DROPDOWN_WIDTH - VIEWPORT_PADDING
  )

  if (opensUpward.value) {
    dropdownStyle.value = {
      left: `${left}px`,
      bottom: `${window.innerHeight - rect.top + DROPDOWN_GAP}px`,
    }
  } else {
    dropdownStyle.value = {
      left: `${left}px`,
      top: `${rect.bottom + DROPDOWN_GAP}px`,
    }
  }
}

async function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value
  if (isDropdownOpen.value) {
    await nextTick()
    updateDropdownPosition()
  }
}

function selectAgentType(type) {
  isDropdownOpen.value = false
  emit('create-agent', type)
}

function handleClickOutside(event) {
  const inTrigger = event.target.closest('.create-agent-dropdown')
  const inMenu = event.target.closest('.create-agent-menu')
  if (!inTrigger && !inMenu) {
    isDropdownOpen.value = false
  }
}

function handleScrollOrResize() {
  if (isDropdownOpen.value) {
    updateDropdownPosition()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', handleScrollOrResize, true)
  window.addEventListener('resize', handleScrollOrResize)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', handleScrollOrResize, true)
  window.removeEventListener('resize', handleScrollOrResize)
})
</script>
