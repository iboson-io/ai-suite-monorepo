<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[200] bg_overlay lg:inset-auto lg:top-0 lg:bottom-0 lg:right-0"
      :class="isCollapsed ? 'lg:left-16' : 'lg:left-64'"
      aria-hidden="true"
      @click="$emit('close')"
    />

    <div
      v-if="open"
      class="fixed z-[210] flex flex-col bg_secondary_color py-6xl px-5xl shadow-xl max-lg:top-0 max-lg:left-0 max-lg:right-0 max-lg:bottom-0 max-lg:w-[90%] max-lg:m-auto max-lg:max-h-[calc(95vh-3rem)] max-lg:rounded-3xl lg:inset-auto lg:top-0 lg:bottom-0 lg:h-auto lg:w-[40%] lg:max-h-screen lg:rounded-none"
      :class="isCollapsed ? 'lg:left-20' : 'lg:left-[16em]'"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notifications-heading"
      @click.stop
    >
      <div class="flex shrink-0 items-start justify-between">
        <div>
          <h2 id="notifications-heading" class="heading_h6_bold primary_text_color">Notifications</h2>
          <p class="body_3_regular secondary_text_color mt-sm">
            Stay updated with your latest activities
          </p>
        </div>

        <button type="button" class="secondary_text_color" @click="$emit('close')" aria-label="Close notifications">
          ✕
        </button>
      </div>

      <div
        class="mt-5xl flex shrink-0 gap-lg overflow-x-auto overflow-y-hidden rounded-lg bg-gray-25 px-md py-xs scrollbar-hide lg:overflow-x-scroll 2xl:justify-center 2xl:gap-9xl"
      >
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          @click="activeTab = tab.key"
          class="flex flex-shrink-0 items-center gap-xxs rounded-md px-md py-xs whitespace-nowrap"
          :class="activeTab === tab.key ? 'bg_secondary_color' : 'hover:bg-gray-50-hover'"
        >
          <span class="label_2_semibold primary_text_color">{{ tab.label }}</span>
          <span class="label_2_semibold secondary_text_color">({{ tab.count }})</span>
        </button>
      </div>

      <div class="mt-5xl block h-px w-full shrink-0 bg-gray-25" />

      <div class="mt-xxs min-h-0 flex-1 overflow-hidden">
        <div
          v-if="loading"
          class="flex h-[68vh] flex-col items-center justify-center text-center max-lg:h-[min(68vh,calc(100vh-14rem))]"
        >
          <div class="mb-4 flex items-center justify-center rounded-full">
            <div class="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
          </div>
          <p class="label_1_medium primary_text_color">Loading notifications...</p>
        </div>

        <div
          v-else-if="filteredNotifications.length === 0"
          class="flex h-[68vh] flex-col items-center justify-center text-center max-lg:h-[min(68vh,calc(100vh-14rem))]"
        >
          <div class="mb-4 flex items-center justify-center rounded-full">
            <img :src="BellIcon" alt="" class="h-32 w-32" />
          </div>

          <p class="heading_h6_bold primary_text_color">No notifications</p>
          <p class="body_1_regular secondary_text_color">
            You have no notifications right now. <br />
            Come back later.
          </p>
        </div>

        <div v-else class="h-[65vh] max-h-[min(65vh,calc(100vh-16rem))] overflow-y-auto md:h-[80vh] lg:h-[60vh] 2xl:h-[80vh]">
          <div
            v-for="item in filteredNotifications"
            :key="item.id"
            class="relative mt-4xl rounded-lg bg_primary_color p-xl primary_border_color cursor-pointer hover:bg-gray-50 transition-colors"
            @click="markAsRead(item.id)"
          >
            <span
              v-if="!item.isRead"
              class="absolute right-3 top-2 h-2 w-2 rounded-full bg-error-600"
            ></span>

            <div>
              <span class="caption_1_medium rounded-md px-md py-xs" :class="item.badgeClass">
                {{ item.badge }}
              </span>
              <p class="label_1_semibold primary_text_color mt-xl">{{ item.title }}</p>
            </div>

            <p class="label_2_regular secondary_text_color mt-sm">
              {{ item.description }}
            </p>

            <p class="body_4_regular tertiary_text_color mt-md">
              {{ item.time }}
            </p>
          </div>
        </div>
      </div>

      <div
        v-if="notifications.length"
        class="absolute bottom-5xl mt-5xl flex w-[93%] cursor-pointer items-center justify-center gap-md rounded-md bg-gray-25 p-md label_1_semibold primary_text_color"
        @click="clearAll"
      >
        <img :src="ClearIcon" alt="" />
        <span class="label_1_semibold primary_text_color">Clear All</span>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import ClearIcon from '../../assets/images/ClearIcon.svg'
import BellIcon from '../../assets/images/BellIcon.svg'
import {
  fetchNotifications as fetchNotificationsApi,
  markNotificationRead,
  clearAllNotifications,
} from '@app/services/notifications/notifications.js'

const props = defineProps({
  open: Boolean,
  isCollapsed: Boolean,
})

const emit = defineEmits(['close', 'notificationRead'])

const activeTab = ref('all')
const notifications = ref([])
const loading = ref(false)
let fetchGeneration = 0

const loadNotifications = async () => {
  const generation = ++fetchGeneration

  try {
    loading.value = true
    const data = await fetchNotificationsApi()
    if (generation !== fetchGeneration) return
    notifications.value = data
  } catch (error) {
    if (generation !== fetchGeneration) return
    console.error('Failed to fetch notifications:', error)
    notifications.value = []
  } finally {
    if (generation === fetchGeneration) {
      loading.value = false
    }
  }
}

const markAsRead = async (notificationId) => {
  try {
    await markNotificationRead(notificationId)

    const notification = notifications.value.find((item) => item.id === notificationId)
    if (notification) {
      notification.isRead = true
    }

    emit('notificationRead')
  } catch (error) {
    console.error('Failed to mark notification as read:', error)
  }
}

onMounted(() => {
  if (props.open) {
    loadNotifications()
  }
})

onUnmounted(() => {
  fetchGeneration += 1
})

const tabs = computed(() => {
  const statusCounts = {}
  notifications.value.forEach((item) => {
    if (!item.isRead) {
      statusCounts[item.type] = (statusCounts[item.type] || 0) + 1
    }
  })

  const unreadCount = notifications.value.filter((item) => !item.isRead).length

  return [
    { key: 'all', label: 'All', count: unreadCount },
    {
      key: 'review',
      label: 'Drafts & Review',
      count: (statusCounts.review || 0) + (statusCounts.suggestion || 0),
    },
    {
      key: 'reminder',
      label: 'Reminders',
      count: statusCounts.reminder || 0,
    },
    {
      key: 'error',
      label: 'System Errors',
      count: statusCounts.error || 0,
    },
    {
      key: 'success',
      label: 'Success',
      count: statusCounts.success || 0,
    },
    {
      key: 'security',
      label: 'Security',
      count: statusCounts.security || 0,
    },
  ].filter((tab) => tab.count > 0 || tab.key === 'all')
})

const filteredNotifications = computed(() => {
  if (activeTab.value === 'all') return notifications.value
  if (activeTab.value === 'review') {
    return notifications.value.filter((item) => item.type === 'review' || item.type === 'suggestion')
  }
  return notifications.value.filter((item) => item.type === activeTab.value)
})

const clearAll = async () => {
  try {
    await clearAllNotifications()
  } catch (error) {
    console.error('Failed to clear notifications:', error)
  } finally {
    notifications.value = []
    activeTab.value = 'all'
    emit('notificationRead')
  }
}
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
