<template>
  <div :class="[config.rootLayoutClass, hideSidebar ? 'h-screen max-h-screen overflow-hidden' : '']">
    <Sidebar
      ref="sidebarRef"
      :class="['hidden', hideSidebar ? 'lg:hidden' : 'lg:flex']"
      :activeTab="activeTab"
      :activeSessionId="activeSessionId"
      @changeTab="handleTabChange"
      @collapseChange="isSidebarCollapsed = $event"
      @newChat="handleNewChat"
      @loadSession="handleLoadSession"
      @sessionDeleted="handleSessionDeleted"
    />

    <SidebarMobile
      ref="sidebarMobileRef"
      :is-open="showMobileSidebar"
      :activeTab="activeTab"
      :activeSessionId="activeSessionId"
      @close="showMobileSidebar = false"
      @changeTab="handleTabChange"
      @newChat="handleNewChat"
      @loadSession="handleLoadSession"
      @sessionDeleted="handleSessionDeleted"
    />

    <div
      :class="[config.mainAreaClass, hideSidebar ? 'lg:ml-0 h-full max-h-full !overflow-hidden' : (isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64')]"
    >
      <header v-if="!hideSidebar" :class="config.mobileHeaderClass">
        <button
          type="button"
          @click="showMobileSidebar = true"
          class="text-xl"
          :aria-label="config.mobileFixedHeader !== false ? 'Open menu' : undefined"
        >
          <img :src="MobileMenuIcon" alt="">
        </button>
      </header>

      <div :class="config.contentWrapperClass">
        <component
          :is="views.chat"
          v-if="activeTab === 'chat'"
          :class="viewClass('chat')"
          :resetChat="resetChatFlag"
          :isSidebarCollapsed="isSidebarCollapsed"
          :sessionToLoad="sessionToLoad"
          :sessionRemovedFromList="sessionRemovedFromList"
          @reset-complete="resetChatFlag = false"
          @sessionLoaded="sessionToLoad = null"
          @newSessionCreated="handleNewSessionCreated"
        />

        <template v-for="tab in contentTabs" :key="`${tab}-${viewKeys[tab] ?? 0}`">
          <component
            :is="views[tab]"
            v-if="activeTab === tab"
            :class="viewClass(tab)"
            @toggle-sidebar="hideSidebar = $event"
          />
        </template>

        <SettingsView
          v-if="activeTab === 'settings'"
          :key="viewKeys.settings"
        />

        <NotificationsView
          v-if="activeTab === 'notifications'"
          :open="true"
          :isCollapsed="false"
          class="lg:hidden"
          @close="handleNotificationsClose"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick, computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getDashboardConfig,
  getDashboardViews,
  getDashboardViewClass,
} from '@app/services/dashboard/dashboard.js'
import SettingsView from './SettingsView.vue'
import NotificationsView from '../components/notifications/NotificationsView.vue'
import Sidebar from '../components/dashboard/Sidebar.vue'
import SidebarMobile from '../components/dashboard/SidebarMobile.vue'
import MobileMenuIcon from '../assets/images/MobileMenuIcon.svg'

const config = getDashboardConfig()
const views = getDashboardViews()

const route = useRoute()
const router = useRouter()
const activeTab = ref('chat')
const showMobileSidebar = ref(false)
const isSidebarCollapsed = ref(false)
const resetChatFlag = ref(false)
const sessionToLoad = ref(null)
const sessionRemovedFromList = ref(null)
const sidebarRef = ref(null)
const sidebarMobileRef = ref(null)
const activeSessionId = ref(null)

const hideSidebar = ref(false)

watch(activeTab, (newTab) => {
  if (newTab !== 'workflows') {
    hideSidebar.value = false
  }
})

const viewKeys = reactive(
  Object.fromEntries(
    [...(config.remountOnReselectTabs ?? []), 'settings'].map((tab) => [tab, 0])
  )
)

const contentTabs = computed(() =>
  Object.keys(views).filter((tab) => tab !== 'chat')
)

const viewClass = (tab) => getDashboardViewClass(tab)

const getTabFromRoute = () => config.routeToTabMap[route.path] || 'chat'

const updateActiveTabFromRoute = () => {
  const tab = getTabFromRoute()
  if (activeTab.value !== tab) {
    activeTab.value = tab
  }
}

const navigateToTab = (tab) => {
  const routePath = config.tabToRouteMap[tab]
  if (routePath && route.path !== routePath) {
    router.push(routePath)
  }
}

onMounted(() => {
  updateActiveTabFromRoute()
})

watch(() => route.path, () => {
  updateActiveTabFromRoute()
})

const handleTabChange = (tab) => {
  if (tab === 'notifications') {
    activeTab.value = tab
    showMobileSidebar.value = false
    return
  }

  const routeForTab = config.tabToRouteMap[tab]
  const isSameSectionClick =
    activeTab.value === tab &&
    routeForTab != null &&
    route.path === routeForTab

  activeTab.value = tab
  navigateToTab(tab)
  showMobileSidebar.value = false

  if (isSameSectionClick) {
    if (tab === 'chat' && config.resetChatOnReselectChat) {
      resetChatFlag.value = true
      sessionToLoad.value = null
    } else if (viewKeys[tab] != null) {
      viewKeys[tab]++
    }
  }
}

const handleNewChat = () => {
  resetChatFlag.value = true
  sessionToLoad.value = null
  activeSessionId.value = null
}

const handleLoadSession = (sessionId) => {
  activeSessionId.value = sessionId
  sessionToLoad.value = sessionId
  if (activeTab.value !== 'chat') {
    activeTab.value = 'chat'
    router.push(config.tabToRouteMap.chat || '/chat')
  }
}

const handleNewSessionCreated = (newChatId) => {
  activeSessionId.value = newChatId
  sidebarRef.value?.refreshChatSessions?.()
  sidebarMobileRef.value?.refreshChatSessions?.()
}

const handleSessionDeleted = (sessionId) => {
  sessionRemovedFromList.value = sessionId
  if (String(activeSessionId.value) === String(sessionId)) {
    activeSessionId.value = null
  }
  nextTick(() => {
    sessionRemovedFromList.value = null
  })
}

const handleNotificationsClose = () => {
  activeTab.value = 'chat'
  router.push(config.tabToRouteMap.chat || '/chat')
}
</script>
