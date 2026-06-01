<template>
  <aside
    class="fixed left-0 top-0 lg:top-[-20px] h-screen flex flex-col  bg_secondary_color transition-all duration-300 z-10 border primary_border_color"
    :class="isCollapsed ? 'w-20 px-3xl' : 'w-64 pl-4xl pr-xs'" @click="handleSidebarContainerClick">
    <div
      class="flex min-h-0 flex-1 flex-col overflow-hidden"
      :class="isCollapsed ? '' : 'pr-3xl'"
    >
      <div class="shrink-0">
      <!-- Logo + Toggle -->
      <div class="relative group flex items-center pt-6xl lg:pt-11xl" 
        :class="isCollapsed ? 'justify-center':'justify-between' "
        @mouseenter="hoveredItem = 'logo'" 
        @mouseleave="hoveredItem = null"
        :ref="el => { if (el) menuItemRefs['logo'] = el }">
        <div class="flex items-center gap-lg">
          <div @click="handleToggleCollapse" @mouseenter="() => { if (isCollapsed) hoverLogo = true }"
            @mouseleave="() => { if (isCollapsed) hoverLogo = false }"
            class="relative h-7 w-7 rounded-full cursor-pointer overflow-hidden flex items-center justify-center transition-all duration-200"
            :class="isCollapsed ? (hoverLogo ? 'opacity-100 bg-transparent' : 'bg-gradient-to-r from-pink-500 to-purple-600') : 'bg-gradient-to-r from-pink-500 to-purple-600'">
            <img v-if="isCollapsed" :src="SidebarIcon" alt=""
              class="h-4 w-4 transition-opacity duration-200 relative z-10"
              :class="hoverLogo ? 'opacity-100' : 'opacity-0'" />
          </div>

          <span v-if="!isCollapsed" class="heading_h5_semibold gradient_text_color">
            Genius AI
          </span>
        </div>

        <button v-if="!isCollapsed" @click="handleToggleCollapse">
          <img :src="SidebarIcon" alt="" />
        </button>

        <Teleport to="body">
          <div v-if="isCollapsed && hoveredItem === 'logo'" :style="getTooltipStyle('logo')"
            class="pointer-events-none fixed whitespace-nowrap z-[1000] transition-all duration-200 ">
            <div
              class="relative bg-black-400 primary_2_text_color label_2_medium rounded-lg px-xl py-md outline-none ring-0 border_none mt-11xl">
              Open sidebar
              <!-- Speech Bubble Tail -->
              <div class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full border_none ">
                <div class="w-0 h-0 border-t-[6px] border-b-[6px] border-r-[6px] border-transparent border-r-black-400">
                </div>
              </div>
            </div>
          </div>
        </Teleport>
      </div>
      <div class="block h-[1px] w-full bg-gray-25 mt-6xl"></div>
      <!-- New Chat -->
      <div class="relative group mt-6xl" @mouseenter="hoveredItem = 'chat'" @mouseleave="hoveredItem = null"
        :ref="el => { if (el) menuItemRefs['chat'] = el }">

        <button class="button-gradient w-full" @click="handleNewChatClick">
          <span class="flex gap-md items-center w-full bg_primary_color primary_text_color label_2_semibold"
           :class="isCollapsed ? `justify-center ${sidebarConfig.newChatButtonClass}` : 'p-xl'"
          >
            <img :src="PlusIcon" class="h-4 w-4" />
            <span v-if="!isCollapsed">New Chat</span>
          </span>
        </button>

        <Teleport to="body">
          <div v-if="isCollapsed && hoveredItem === 'chat'" :style="getTooltipStyle('chat')"
            class="pointer-events-none fixed whitespace-nowrap z-[1000] transition-all duration-200 ">
            <div
              class="relative bg-black-400 primary_2_text_color label_2_medium rounded-lg px-xl py-md outline-none ring-0 border_none">
              New Chat
              <!-- Speech Bubble Tail -->
              <div class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full border_none ">
                <div class="w-0 h-0 border-t-[6px] border-b-[6px] border-r-[6px] border-transparent border-r-black-400">
                </div>
              </div>
            </div>
          </div>
        </Teleport>
      </div>

      <!-- Chat History -->
      <div v-if="!isCollapsed" class="mt-6xl">
        <p class="label_3_semibold primary_text_color">Chat history</p>
        <div
          class="max-h-[180px] overflow-y-auto custom_scrollbar pr-1"
          @scroll.passive="closeChatSessionMenu"
        >
          <!-- Dynamic Chat Sessions from API -->
          <div 
            v-for="session in chatSessions" 
            :key="session.id"
            :data-session-id="session.id"
            @click="handleSessionRowClick(session)"
            class="cursor-pointer mt-xl p-xl label_2_regular primary_text_color flex justify-between hover:bg-info-50-hover border border-transparent hover:border-gray-50 rounded-lg"
          >
            <!-- Title Display or Edit Input -->
            <div class="flex-1 min-w-0">
              <input
                v-if="sidebarConfig.enableSessionRename && editingSessionId === session.id"
                ref="editInputRef"
                v-model="editingTitle"
                @blur="saveRename"
                @keydown="handleRenameKeydown"
                @click.stop
                class="w-full bg-transparent border-none outline-none label_2_regular primary_text_color"
                placeholder="Enter chat title..."
              />
              <span v-else class="truncate">{{ sidebarConfig.enableSessionRename ? truncateTitle(session.title || 'Untitled Chat') : (session.title || 'Untitled Chat') }}</span>
            </div>
            <div class="relative shrink-0 flex items-center">
              <button
                type="button"
                class="text-black-50 text-2xl mt-[-0.45em] leading-none rounded px-0.5 hover:bg-gray-25/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                :aria-expanded="openChatSessionMenuId === session.id"
                aria-haspopup="true"
                aria-label="Chat options"
                :ref="(el) => setChatSessionMenuTriggerRef(session.id, el)"
                @click.stop="toggleChatSessionMenu(session.id)"
              >
                ...
              </button>
            </div>
          </div>
          <!-- Loading State -->
          <div v-if="isLoadingSessions" class="mt-xl p-xl label_2_regular secondary_text_color">
            Loading...
          </div>
          <!-- Empty State -->
          <div v-else-if="chatSessions.length === 0" class="mt-xl p-xl label_2_regular secondary_text_color">
            No chat history
          </div>
        </div>
        <div
          v-if="openChatSessionMenuId !== null && chatSessionForOpenMenu"
          ref="chatSessionMenuPanelRef"
          data-chat-session-menu
          class="fixed z-[9999] min-w-[10.5rem] overflow-hidden rounded-lg border primary_border_color bg_secondary_color shadow-lg"
          role="menu"
          :style="chatSessionMenuPanelStyle"
          @click.stop
        >
          <button
            type="button"
            role="menuitem"
            class="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left label_2_medium primary_text_color transition-colors hover:bg-gray-25"
            @click.stop="onChatSessionRename(chatSessionForOpenMenu)"
          >
            <span>Rename</span>
            <img :src="ImageEditIcon" alt="" class="h-4 w-4 shrink-0 opacity-80" />
          </button>
          <div class="h-px w-full bg-gray-25" aria-hidden="true" />
          <button
            type="button"
            role="menuitem"
            class="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left label_2_medium primary_text_color transition-colors hover:bg-gray-25 disabled:pointer-events-none disabled:opacity-50"
            :disabled="deletingChatSessionId !== null"
            @click.stop="onChatSessionDelete(chatSessionForOpenMenu)"
          >
            <span>Delete</span>
            <img :src="TrashIcon" alt="" class="h-4 w-4 shrink-0 opacity-80" />
          </button>
        </div>
      </div>
      <div class="block h-[1px] w-full bg-gray-25 mt-6xl"></div>
      </div>

      <!-- Menu (scrolls when many tabs; does not overlap bottom section) -->
      <nav class="sidebar-nav-scroll mt-6xl min-h-0 flex-1 overflow-y-auto custom_scrollbar">
        <div v-for="item in menuItems" :key="item.tab" @click="handleSidebarClick(item.tab)"
          @mouseenter="hoveredItem = item.tab" @mouseleave="hoveredItem = null"
          class="relative group flex cursor-pointer items-center gap-lg rounded-lg py-xl mt-md hover:bg-info-50-hover" :class="[
          activeTab === item.tab ? 'bg-info-50-hover' : '',
          isCollapsed ? 'justify-center' : 'px-2'
        ]" :ref="el => { if (el) menuItemRefs[item.tab] = el }">
          <img :src="item.icon" class="h-5 w-5" />

          <span v-if="!isCollapsed" class="label_2_semibold primary_text_color">
            {{ item.label }}
          </span>

          <Teleport to="body">
            <div v-if="isCollapsed && hoveredItem === item.tab" :style="getTooltipStyle(item.tab)"
              class="pointer-events-none fixed whitespace-nowrap z-[1000] transition-all duration-200">
              <div
                class="relative bg-black-400 primary_2_text_color label_2_medium rounded-lg px-xl py-md outline-none ring-0 border_none">
                {{ item.label }}
                <!-- Speech Bubble Tail -->
                <div class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full border_none">
                  <div
                    class="w-0 h-0 border-t-[6px] border-b-[6px] border-r-[6px] border-transparent border-r-black-400">
                  </div>
                </div>
              </div>
            </div>
          </Teleport>
        </div>
      </nav>

      <div
        class="sidebar_bottom_section relative bottom-auto shrink-0 pb-md"
        :class="isCollapsed ? 'w-[2.875em]' : 'w-52'"
      >

          <div class="block h-[1px] w-full bg-info-50 " :class="isCollapsed ? 'hidden' : ''"></div>

          <div
            @click.stop="handleSidebarClick(notification.tab)"
            @mouseenter="hoveredItem = 'notifications'"
            @mouseleave="hoveredItem = null"
            class="relative group flex cursor-pointer items-center gap-lg rounded-md py-xl mt-xl hover:bg-info-50-hover"
            :class="[
              showNotifications ? 'bg-info-50-hover' : '',
              isCollapsed ? 'justify-center' : 'px-md',
            ]"
            :ref="(el) => { if (el) menuItemRefs['notifications'] = el }"
          >
            <img :src="notification.icon" class="h-5 w-5" />

            <span v-if="!isCollapsed" class="label_2_semibold primary_text_color">
              {{ notification.label }}
            </span>
            <span 
            v-if="hasUnreadNotifications && sidebarConfig.enableNotificationBadge"
              class="h-2 w-2 rounded-full bg-error-600"
            ></span>
            <Teleport to="body">
              <div v-if="isCollapsed && hoveredItem === 'notifications'" :style="getTooltipStyle('notifications')"
                class="pointer-events-none fixed whitespace-nowrap z-[1000] transition-all duration-200 ">
                <div
                  class="relative bg-black-400 primary_2_text_color label_2_medium rounded-lg px-xl py-md outline-none ring-0 border_none">
                  {{ notification.label }}
                  <!-- Speech Bubble Tail -->
                  <div class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full border_none">
                    <div
                      class="w-0 h-0 border-t-[6px] border-b-[6px] border-r-[6px] border-transparent border-r-black-400">
                    </div>
                  </div>
                </div>
              </div>
            </Teleport>
          </div>

           <div class="block h-[1px] w-full bg-info-50 mt-xl" :class="isCollapsed ? 'hidden' : ''"></div>


          <!-- User -->
          <div class="relative group mt-7xl p-md flex items-center gap-md cursor-pointer rounded-md hover:bg_primary_color"
            :class="isCollapsed ? 'justify-center' : ''" @click.stop="showUserAccount = true"
            @mouseenter="hoveredItem = 'account'" @mouseleave="hoveredItem = null"
            :ref="el => { if (el) menuItemRefs['account'] = el }">
            <img
              :src="sidebarAvatarUrl"
              :alt="sidebarDisplayName || 'Profile'"
              class="h-8 w-8 rounded-full object-cover"
            />
            <div v-if="!isCollapsed">
              <p class="label_2_semibold primary_text_color">{{ sidebarDisplayName || "—" }}</p>
              <p class="label_3_regular secondary_text_color">{{ sidebarUserEmail || "—" }}</p>
            </div>
            <Teleport to="body">
              <div v-if="isCollapsed && hoveredItem === 'account'" :style="getTooltipStyle('account')"
                class="pointer-events-none fixed whitespace-nowrap z-[1000] transition-all duration-200">
                <div
                  class="relative bg-black-400 primary_2_text_color label_2_medium rounded-lg px-xl py-md outline-none ring-0 border_none">
                  Account
                  <!-- Speech Bubble Tail -->
                  <div class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full border_none">
                    <div
                      class="w-0 h-0 border-t-[6px] border-b-[6px] border-r-[6px] border-transparent border-r-black-400">
                    </div>
                  </div>
                </div>
              </div>
            </Teleport>
          </div>
      </div>
    </div>
    <!-- 🔔 NOTIFICATION POPUP -->
    <NotificationPopup :open="showNotifications" :isCollapsed="isCollapsed" @close="showNotifications = false" @notificationRead="refreshNotifications" />
    <!-- 👤 USER ACCOUNT POPUP -->
    <UserAccountPopup
      :open="showUserAccount"
      :is-collapsed="isCollapsed"
      :avatar-url="sidebarAvatarUrl"
      :display-name="sidebarDisplayName"
      :email="sidebarUserEmail"
      @close="showUserAccount = false"
    />
  </aside>


</template>

<script setup>
  import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";
  import { useRouter } from "vue-router";
  import { fetchNotifications as fetchNotificationsApi } from "@app/services/notifications/notifications.js";
  import {
    fetchChatSessions as fetchChatSessionsApi,
    fetchSidebarUser as fetchSidebarUserApi,
    renameChatSession,
    deleteChatSession,
    sidebarFallbackAvatar,
  } from "@app/services/dashboard/sidebar.js";
  import {
    getSidebarConfig,
    getSidebarMenuItems,
    getSidebarNotificationItem,
  } from "@app/services/dashboard/sidebarMenu.js";
  import NotificationPopup from "../../components/notifications/NotificationsView.vue";
  import UserAccountPopup from "./UserAccountPopup.vue";
  import SidebarIcon from "../../assets/images/SidebarIcon.svg";
  import PlusIcon from "../../assets/images/PlusIcon.svg";
  import ImageEditIcon from "../../assets/images/ImageEditIcon.svg";
  import TrashIcon from "../../assets/images/TrashIcon.svg";

  const sidebarConfig = getSidebarConfig();
  const menuItems = getSidebarMenuItems();
  const notification = getSidebarNotificationItem();

  defineProps({
    activeTab: String,
  });

  const emit = defineEmits(["changeTab", "collapseChange", "newChat", "loadSession", "sessionDeleted"]);
  const router = useRouter();
  const changeTab = (tab) => emit("changeTab", tab);

  const isCollapsed = ref(false);
  const showNotifications = ref(false);
  const showUserAccount = ref(false);
  const hoveredItem = ref(null);
  const menuItemRefs = ref({});
  const hoverLogo = ref(false);
  
  // Notification data
  const notifications = ref([]);
  const unreadNotificationsCount = ref(0);
  
  /* Chat Sessions */
  const chatSessions = ref([]);
  const isLoadingSessions = ref(false);
  const openChatSessionMenuId = ref(null);
  const chatSessionMenuTriggerRefs = ref({});
  const deletingChatSessionId = ref(null);
  const chatSessionMenuPanelRef = ref(null);
  const chatSessionMenuPanelStyle = ref({ top: "0px", left: "0px" });
  const CHAT_SESSION_MENU_MIN_WIDTH_PX = 168;
  
  // Rename state
  const editingSessionId = ref(null);
  const editingTitle = ref("");
  const editInputRef = ref(null);

  const chatSessionForOpenMenu = computed(() => {
    const id = openChatSessionMenuId.value;
    if (id == null) return null;
    return chatSessions.value.find((s) => s.id === id) ?? null;
  });

  const setChatSessionMenuTriggerRef = (sessionId, el) => {
    if (el) {
      chatSessionMenuTriggerRefs.value[sessionId] = el;
    } else {
      delete chatSessionMenuTriggerRefs.value[sessionId];
    }
  };

  const closeChatSessionMenu = () => {
    openChatSessionMenuId.value = null;
  };

  const onDocumentPointerDownCloseChatSessionMenu = (event) => {
    const id = openChatSessionMenuId.value;
    if (id == null) return;
    const target = event.target;
    if (!(target instanceof Node)) return;
    const menuEl = chatSessionMenuPanelRef.value;
    const triggerEl = chatSessionMenuTriggerRefs.value[id];
    if (menuEl?.contains(target)) return;
    if (triggerEl?.contains(target)) return;
    closeChatSessionMenu();
  };

  watch(openChatSessionMenuId, (id) => {
    document.removeEventListener("pointerdown", onDocumentPointerDownCloseChatSessionMenu, true);
    if (id == null) return;
    queueMicrotask(() => {
      document.addEventListener("pointerdown", onDocumentPointerDownCloseChatSessionMenu, true);
    });
  });

  onUnmounted(() => {
    document.removeEventListener("pointerdown", onDocumentPointerDownCloseChatSessionMenu, true);
  });

  const updateChatSessionMenuPosition = (sessionId) => {
    const el = chatSessionMenuTriggerRefs.value[sessionId];
    if (!el || typeof el.getBoundingClientRect !== "function") {
      chatSessionMenuPanelStyle.value = { top: "0px", left: "0px" };
      return;
    }
    const r = el.getBoundingClientRect();
    let left = r.right - CHAT_SESSION_MENU_MIN_WIDTH_PX;
    left = Math.max(8, Math.min(left, window.innerWidth - CHAT_SESSION_MENU_MIN_WIDTH_PX - 8));
    chatSessionMenuPanelStyle.value = {
      top: `${Math.round(r.bottom + 4)}px`,
      left: `${Math.round(left)}px`,
    };
  };

  const toggleChatSessionMenu = (sessionId) => {
    if (openChatSessionMenuId.value === sessionId) {
      openChatSessionMenuId.value = null;
      return;
    }
    nextTick(() => {
      updateChatSessionMenuPosition(sessionId);
      openChatSessionMenuId.value = sessionId;
    });
  };

  const onChatSessionRename = (session) => {
    closeChatSessionMenu();
    if (!sidebarConfig.enableSessionRename) return;

    editingSessionId.value = session.id;
    editingTitle.value = session.title || '';

    nextTick(() => {
      if (editInputRef.value) {
        editInputRef.value.focus();
        editInputRef.value.select();
      }
    });
  };
  
  const saveRename = async () => {
    if (!editingSessionId.value || !sidebarConfig.enableSessionRename) return;
    
    const sessionId = editingSessionId.value;
    const newTitle = editingTitle.value.trim();
    
    const session = chatSessions.value.find(s => s.id === sessionId);
    if (session && (session.title || '') === newTitle) {
      editingSessionId.value = null;
      editingTitle.value = '';
      return;
    }
    
    try {
      await renameChatSession(sessionId, newTitle);
      const sessionIndex = chatSessions.value.findIndex(s => s.id === sessionId);
      if (sessionIndex !== -1) {
        chatSessions.value[sessionIndex].title = newTitle;
      }
      editingSessionId.value = null;
      editingTitle.value = '';
    } catch (error) {
      console.error('Failed to rename session:', error);
      editingSessionId.value = null;
      editingTitle.value = '';
    }
  };
  
  // Handle keyboard events during rename
  const handleRenameKeydown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      saveRename();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      editingSessionId.value = null;
      editingTitle.value = '';
    }
  };

  // Truncate title to fit sidebar width
  const truncateTitle = (title) => {
    if (!title) return 'Untitled Chat';
    const maxLength = 24; // Adjust this value as needed
    return title.length > maxLength ? title.substring(0, maxLength) : title;
  };

  /** DELETE /api/ai/history/:sessionId */
  const onChatSessionDelete = async (session) => {
    const sessionId = session?.id;
    if (sessionId == null || sessionId === "" || deletingChatSessionId.value) return;

    closeChatSessionMenu();
    deletingChatSessionId.value = sessionId;

    try {
      await deleteChatSession(sessionId);
      chatSessions.value = chatSessions.value.filter(
        (s) => String(s.id) !== String(sessionId)
      );
      emit("sessionDeleted", sessionId);
    } catch (e) {
      console.error("Delete chat history failed:", e);
      window.alert(
        e?.response?.data?.message || e?.message || "Could not delete this chat"
      );
    } finally {
      deletingChatSessionId.value = null;
    }
  };

  const sidebarDisplayName = ref("");
  const sidebarUserEmail = ref("");
  const sidebarAvatarUrl = ref(sidebarFallbackAvatar("User"));

  async function loadSidebarUser() {
    try {
      const user = await fetchSidebarUserApi();
      sidebarDisplayName.value = user.displayName;
      sidebarUserEmail.value = user.email;
      sidebarAvatarUrl.value = user.avatarUrl;
    } catch (e) {
      console.error("Failed to load user for sidebar:", e);
    }
  }

  const handleNewChatClick = () => {
    // Close user account popup if open
    if (showUserAccount.value) {
      showUserAccount.value = false;
    }

    // Navigate to chat and emit newChat event
    router.push(sidebarConfig.chatRoute || '/chat');
    emit('newChat');
  };

  const handleSidebarClick = (tab) => {
    // Close user account popup if open
    if (showUserAccount.value) {
      showUserAccount.value = false;
    }

    if (tab === "notifications") {
      showNotifications.value = !showNotifications.value;
      return;
    }

    showNotifications.value = false;
    changeTab(tab);
  };

  const handleToggleCollapse = () => {
    // Close user account popup if open
    if (showUserAccount.value) {
      showUserAccount.value = false;
    }
    isCollapsed.value = !isCollapsed.value;
    emit("collapseChange", isCollapsed.value);
  };

  const handleSidebarContainerClick = (event) => {
    // Close user account popup if open and click is not on the user div
    // The user div has @click.stop so it won't trigger this
    if (showUserAccount.value) {
      showUserAccount.value = false;
    }
    if (showNotifications.value) {
      showNotifications.value = false;
    }
    closeChatSessionMenu();
    
    // Cancel rename if clicking outside
    if (editingSessionId.value) {
      saveRename();
    }
  };

  // Computed property to check if there are unread notifications
  const hasUnreadNotifications = computed(() => {
    return unreadNotificationsCount.value > 0;
  });

  // Fetch notifications for badge count
  const fetchNotificationsForBadge = async () => {
    if (!sidebarConfig.enableNotificationBadge) return;
    try {
      const list = await fetchNotificationsApi()
      notifications.value = list.map((notification) => ({
        id: notification.id,
        isRead: notification.isRead,
      }))
      unreadNotificationsCount.value = notifications.value.filter((n) => !n.isRead).length
    } catch (error) {
      console.error('Failed to fetch notifications for badge:', error)
    }
  };

  const getTooltipStyle = (itemKey) => {
    const element = menuItemRefs.value[itemKey];
    if (!element) return { display: 'none' };

    const rect = element.getBoundingClientRect();
    return {
      left: `${rect.right + 8}px`,
      top: `${rect.top + rect.height / 2}px`,
      transform: 'translateY(-50%)',
    };
  };
  
  // Fetch chat sessions from API
  const loadChatSessions = async () => {
    isLoadingSessions.value = true;
    try {
      chatSessions.value = await fetchChatSessionsApi();
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
      chatSessions.value = [];
    } finally {
      isLoadingSessions.value = false;
    }
  };

  const handleSessionRowClick = (session) => {
    if (sidebarConfig.enableSessionRename && editingSessionId.value === session.id) return;
    handleSessionClick(session.id);
  };
  
  const handleSessionClick = (sessionId) => {
    closeChatSessionMenu();
    console.log('Session clicked:', sessionId);
    // Navigate to chat with session ID
    router.push(sidebarConfig.chatRoute || '/chat');
    // Emit event to load the specific session
    emit('loadSession', sessionId);
  };

  // Function to refresh chat sessions (called when new chat is created)
  const refreshChatSessions = () => {
    loadChatSessions();
  };

  // Function to refresh notifications (called when notifications are read/cleared)
  const refreshNotifications = () => {
    fetchNotificationsForBadge();
  };

  // Emit initial collapsed state and fetch sessions
  onMounted(() => {
    emit("collapseChange", isCollapsed.value);
    loadChatSessions();
    loadSidebarUser();
    fetchNotificationsForBadge();
  });
  
  // Expose refresh functions to parent
  defineExpose({
    refreshChatSessions,
    refreshNotifications
  });
</script>