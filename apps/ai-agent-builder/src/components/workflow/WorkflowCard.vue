<template>
  <article
    class="relative flex min-h-[168px] min-w-0 flex-col rounded-2xl border primary_border_color bg_secondary_color p-5xl text-left cursor-pointer transition-[border-color,box-shadow] hover:border-info-100 hover:shadow-sm"
    @click="handleCardClick"
  >
    <div ref="menuTriggerRef" class="agent-card-menu absolute right-4 top-4 z-10">
      <button
        type="button"
        class="flex h-8 w-8 items-center justify-center rounded-full border primary_border_color text-black-300 transition-[background-color] hover:bg-info-50-hover"
        aria-label="Workflow options"
        :aria-expanded="isMenuOpen"
        @click.stop="toggleMenu"
      >
        <svg class="h-[18px] w-[18px]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <circle cx="4" cy="10" r="1.5" />
          <circle cx="10" cy="10" r="1.5" />
          <circle cx="16" cy="10" r="1.5" />
        </svg>
      </button>

      <Teleport to="body">
        <div
          v-if="isMenuOpen"
          ref="menuRef"
          class="agent-card-menu-panel fixed z-[9999] w-[220px] overflow-hidden rounded-xl border primary_border_color bg_secondary_color shadow-lg"
          :style="menuStyle"
          @click.stop
        >
          <div
            class="flex items-center justify-between gap-md border-b primary_border_color px-4xl py-3xl"
          >
            <span class="label_2_medium primary_text_color">Active / Inactive</span>
            <button
              type="button"
              role="switch"
              class="relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200"
              :class="isActive ? 'bg-green-200' : 'bg-info-50-hover'"
              :aria-checked="isActive"
              aria-label="Toggle workflow active status"
              @click.stop="handleToggleActive"
            >
              <span
                class="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-[left] duration-200"
                :class="isActive ? 'left-[calc(100%-1.125rem)]' : 'left-0.5'"
              />
            </button>
          </div>

          <button
            type="button"
            class="flex w-full items-center justify-between gap-md px-4xl py-3xl text-left transition-[background-color] hover:bg-gray-25"
            @click.stop="handleDelete"
          >
            <span class="label_2_medium primary_text_color">Delete</span>
            <img :src="TrashIcon" alt="" class="h-4 w-4 shrink-0 text-black-300" aria-hidden="true" />
          </button>
        </div>
      </Teleport>
    </div>

    <DeletePostModal
      :open="isDeleteModalOpen"
      :loading="isDeleting"
      :error-message="deleteError"
      show-header-icon
      title="Delete Workflow"
      message="Are you sure you want to delete this workflow? This action cannot be undone."
      warning-message=""
      confirm-label="Delete Workflow"
      confirm-button-class="bg-error-600 hover:bg-error-700 primary_2_text_color label_1_semibold"
      @close="closeDeleteModal"
      @confirm="confirmDelete"
    />

    <h3
      class="label_1_semibold primary_text_color min-w-0 break-all pr-10 line-clamp-2"
      :title="workflow.name || 'Untitled workflow'"
    >
      {{ workflow.name || 'Untitled workflow' }}
    </h3>

    <p
      class="body_3_regular secondary_text_color mt-md min-w-0 flex-1 break-words line-clamp-3"
      :title="workflow.description || 'No description'"
    >
      {{ workflow.description || 'No description' }}
    </p>

    <div class="mt-5xl flex min-w-0 flex-wrap items-center gap-md">
      <span class="caption_1_medium shrink-0 rounded-md px-md py-xs" :class="statusBadgeClass">
        {{ statusLabel }}
      </span>
      <span class="body_4_regular tertiary_text_color min-w-0 truncate">
        {{ lastUpdatedLabel }}
      </span>
    </div>
  </article>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, nextTick } from 'vue'
import { DeletePostModal } from '@ai-suite/shared-ui'
import TrashIcon from '../../assets/images/delete.svg'
import { useWorkflow } from '@app/composables/useWorkflow'
import { formatLastUpdated } from '../../services/agents/list.js'

const props = defineProps({
  workflow: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['toggle-active', 'delete', 'select'])

const { removeWorkflow } = useWorkflow()

const menuTriggerRef = ref(null)
const menuRef = ref(null)
const isMenuOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isDeleting = ref(false)
const deleteError = ref('')
const menuStyle = ref({})

const MENU_WIDTH = 220
const MENU_GAP = 6
const VIEWPORT_PADDING = 8

const statusLabel = computed(() => {
  const status = props.workflow.status || 'draft'
  return status.charAt(0).toUpperCase() + status.slice(1)
})

const statusBadgeClass = computed(() => {
  const status = props.workflow.status || 'draft'
  if (status === 'active') {
    return 'bg-success-50 text-success-600 border border-success-200'
  }
  if (status === 'inactive' || status === 'archived') {
    return 'bg-gray-25 secondary_text_color border primary_border_color'
  }
  return 'bg-orange-25 text-orange-200 border border-orange-100'
})

const lastUpdatedLabel = computed(() => {
  return props.workflow.updated_at ? formatLastUpdated(props.workflow.updated_at) : ''
})

const isActive = computed(() => props.workflow.status === 'active')

function updateMenuPosition() {
  if (!menuTriggerRef.value || !isMenuOpen.value) return

  const rect = menuTriggerRef.value.getBoundingClientRect()
  const menuHeight = menuRef.value?.offsetHeight ?? 96

  const left = Math.min(
    Math.max(VIEWPORT_PADDING, rect.right - MENU_WIDTH),
    window.innerWidth - MENU_WIDTH - VIEWPORT_PADDING
  )

  const spaceBelow = window.innerHeight - rect.bottom
  const opensUpward = spaceBelow < menuHeight + MENU_GAP && rect.top >= menuHeight + MENU_GAP

  if (opensUpward) {
    menuStyle.value = {
      left: `${left}px`,
      bottom: `${window.innerHeight - rect.top + MENU_GAP}px`,
    }
  } else {
    menuStyle.value = {
      left: `${left}px`,
      top: `${rect.bottom + MENU_GAP}px`,
    }
  }
}

async function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
  if (isMenuOpen.value) {
    await nextTick()
    updateMenuPosition()
  }
}

function closeMenu() {
  isMenuOpen.value = false
}

function handleCardClick(event) {
  if (event.target.closest('.agent-card-menu') || isDeleteModalOpen.value) return
  emit('select', props.workflow.id)
}

function handleToggleActive() {
  emit('toggle-active', {
    workflow: props.workflow,
    active: !isActive.value,
  })
}

function closeDeleteModal() {
  if (isDeleting.value) return
  isDeleteModalOpen.value = false
  deleteError.value = ''
}

function handleDelete() {
  deleteError.value = ''
  isDeleteModalOpen.value = true
  closeMenu()
}

async function confirmDelete() {
  if (isDeleting.value) return

  isDeleting.value = true
  deleteError.value = ''

  try {
    await removeWorkflow(props.workflow.id)
    isDeleteModalOpen.value = false
    emit('delete', props.workflow)
  } catch (error) {
    deleteError.value =
      error?.message || 'Failed to delete workflow. Please try again.'
  } finally {
    isDeleting.value = false
  }
}

function handleClickOutside(event) {
  const inTrigger = event.target.closest('.agent-card-menu')
  const inPanel = event.target.closest('.agent-card-menu-panel')
  if (!inTrigger && !inPanel) {
    isMenuOpen.value = false
  }
}

function handleScrollOrResize() {
  if (isMenuOpen.value) {
    updateMenuPosition()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside, true)
  window.addEventListener('scroll', handleScrollOrResize, true)
  window.addEventListener('resize', handleScrollOrResize)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside, true)
  window.removeEventListener('scroll', handleScrollOrResize, true)
  window.removeEventListener('resize', handleScrollOrResize)
})
</script>
