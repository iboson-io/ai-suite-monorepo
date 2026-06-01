<template>
  <div
    v-if="open"
    class="fixed inset-0 z-40 lg:inset-auto lg:top-0 lg:bottom-0 lg:right-0"
    :class="isCollapsed ? 'lg:left-16' : 'lg:left-64'"
    @click="$emit('close')"
  />

  <div
    v-if="open"
    class="fixed z-50 bg_secondary_color shadow-sm border primary_border_color bottom-[4.4em] lg:inset-auto lg:top-auto popup_position lg:rounded-xl px-4 py-4"
    :class="[
      accountConfig.popupWidthClass || 'w-64',
      isCollapsed ? 'left-4 lg:left-5' : 'left-4 lg:left-4',
      'rounded-xl',
    ]"
    @click.stop
  >
    <div v-if="accountConfig.showProfileHeader" class="flex items-center gap-5 rounded-lg bg_secondary_color">
      <img
        :src="avatarUrl || fallbackAvatar"
        class="h-10 w-10 rounded-full object-cover"
        alt="Profile"
      />
      <div class="flex-1 min-w-0">
        <p class="label_2_semibold primary_text_color truncate">{{ displayName || '—' }}</p>
        <p class="body_4_regular tertiary_text_color truncate">{{ email || '—' }}</p>
      </div>
    </div>

    <div v-if="accountConfig.showProfileHeader" class="block h-[2px] w-full hr_linr_bg mt-5xl"></div>

    <div class="space-y-1" :class="accountConfig.showProfileHeader ? 'mt-5xl' : ''">
      <template v-for="item in accountConfig.menuItems" :key="item.id">
        <div v-if="item.dividerBefore" class="block h-[1px] w-full bg_primary_color mt-4 mb-4"></div>

        <div
          v-if="item.action === 'logout'"
          class="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition"
          @click="handleMenuAction(item)"
        >
          <img v-if="item.icon" :src="item.icon" alt="" class="w-5 h-5" />
          <span class="body_2_medium primary_text_color">{{ item.label }}</span>
        </div>

        <div
          v-else-if="item.showChevron"
          class="flex items-center justify-between px-3xl py-xl rounded-lg cursor-pointer transition"
        >
          <div class="flex items-center gap-3">
            <img v-if="item.icon" :src="item.icon" alt="" class="w-5 h-5" />
            <span class="body_2_medium primary_text_color">{{ item.label }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span v-if="item.trailingLabel" class="body_3_regular secondary_text_color">{{ item.trailingLabel }}</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 6L10 10L6 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>

        <div
          v-else
          class="flex items-center gap-3 px-xl py-xl rounded-lg cursor-pointer transition"
        >
          <img v-if="item.icon" :src="item.icon" alt="" class="w-5 h-5" />
          <span class="body_2_medium primary_text_color">{{ item.label }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getUserAccountConfig } from '@app/services/dashboard/userAccount.js'
import { signOut } from '@app/services/dashboard/auth.js'

const props = defineProps({
  open: Boolean,
  isCollapsed: Boolean,
  avatarUrl: { type: String, default: '' },
  displayName: { type: String, default: '' },
  email: { type: String, default: '' },
})

const emit = defineEmits(['close', 'signOut'])

const accountConfig = getUserAccountConfig()

const fallbackAvatar = computed(() => {
  const seed = (props.displayName || props.email || 'User').trim() || 'User'
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(seed)}&background=7950F2&color=fff&size=96`
})

const handleMenuAction = async (item) => {
  if (item.action !== 'logout') return
  emit('close')
  emit('signOut')
  await signOut()
}
</script>
