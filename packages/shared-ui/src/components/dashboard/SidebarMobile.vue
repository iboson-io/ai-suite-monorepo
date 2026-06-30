<template>
  <!-- Overlay -->
  <div
    class="fixed inset-0 z-40 bg_overlay lg:hidden transition-opacity duration-300 ease-in-out"
    :class="{ 'opacity-0': !isOpen, 'pointer-events-none': !isOpen }"
    @click="$emit('close')"
  ></div>

  <!-- Sidebar -->
  <aside
    class="fixed left-0 top-0 z-50 flex h-full w-[22em] flex-col bg_secondary_color p-4 shadow-lg lg:hidden transform transition-transform duration-300 ease-in-out overflow-hidden"
    :class="{ '-translate-x-full': !isOpen, 'pointer-events-none': !isOpen }"
    @click="handleSidebarContainerClick"
  >
    <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
    <div class="shrink-0">
    <!-- Header -->
    <div class=" flex items-center justify-between">
      <div class="flex items-center gap-lg heading_h5_semibold gradient_text_color">
        <img
          v-if="sidebarConfig.brandIcon"
          :src="sidebarConfig.brandIcon"
          alt=""
          class="h-6 w-auto shrink-0"
        />
        <div
          v-else
          class="h-6 w-6 rounded-full bg-gradient-to-r from-pink-500 to-purple-600"
        ></div>
        {{ sidebarConfig.brandName || 'Genius AI' }}
      </div>
      <button @click="$emit('close')" class="text-xl secondary_text_color">✕</button>
    </div>
    <div class="block h-[1px] w-full bg-gray-25 mt-6xl"></div>
    <!-- New Chat -->
    <button class="button-gradient w-full" @click="handleNewChatClick">
          <span class="flex gap-md items-center w-full p-xl bg_primary_color primary_text_color label_2_semibold"
           :class="isCollapsed ? 'justify-center' : ''"
          >
            <img :src="PlusIcon" class="h-4 w-4" />
            <span v-if="!isCollapsed">New Chat</span>
          </span>
        </button>

    <!-- Chat History -->
    <p class="mt-6xl label_3_semibold primary_text_color">Chat history</p>
    <div
      class="mt-xl max-h-[155px] overflow-x-hidden overflow-y-auto custom_scrollbar pr-1 md:max-h-[200px]"
      @scroll.passive="handleScroll"
    >
      <!-- Dynamic Chat Sessions from API -->
      <div 
        v-for="session in chatSessions" 
        :key="session.id"
        :data-session-id="session.id"
        @click="handleSessionRowClick(session)"
        class="cursor-pointer mt-lg min-w-0 p-md md:mt-xl md:p-xl label_2_regular primary_text_color flex justify-between hover:bg-info-50-hover border border-transparent hover:border-gray-50 rounded-lg"
        :class="String(activeSessionId) === String(session.id) ? 'bg-info-50-hover border-gray-50' : ''"
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
          <span v-else class="block truncate">{{ sidebarConfig.enableSessionRename ? truncateTitle(session.title || 'Untitled Chat') : (session.title || 'Untitled Chat') }}</span>
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
      <!-- Loading More State -->
      <div v-if="loadingMoreSessions" class="mt-md text-center py-xs label_3_regular secondary_text_color">
        Loading more...
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

    <div class="block h-[1px] w-full bg-gray-25 mt-6xl"></div>
    </div>

    <!-- Menu (scrolls when many tabs; does not overlap bottom section) -->
    <nav class="sidebar-nav-scroll mt-xl min-h-0 flex-1 overflow-y-auto custom_scrollbar">
      <div
        v-for="item in menuItems"
        :key="item.tab"
        @click="handleSidebarClick(item.tab)"
        class="flex cursor-pointer items-center gap-lg rounded-lg p-xl mt-md hover:bg-info-50-hover"
        :class="activeTab === item.tab ? 'bg-info-50-hover' : ''"
      >
        <img :src="item.icon" alt="">
        <span v-if="!isCollapsed" class="label_2_semibold primary_text_color">{{ item.label }}</span>
      </div>
    </nav>

    <div
      class="sidebar_bottom_section relative bottom-auto shrink-0 pb-md"
      :class="isCollapsed ? 'w-[2.875em]' : 'w-64'"
    >

    <div class="block h-[1px] w-full bg-gray-25 mt-6xl " :class="isCollapsed ? 'hidden' : ''"></div>
   
      <div
        @click="handleSidebarClick(notification.tab)"
        class="relative group flex cursor-pointer items-center gap-lg rounded-md py-md mt-md"
        :class=" showNotifications ? 'bg_primary_color' : '',
          isCollapsed ? 'justify-center' : 'px-2'
        "
      >
        <img :src="notification.icon" class="h-5 w-5" />

        <span v-if="!isCollapsed" class="label_2_semibold primary_text_color">
          {{ notification.label }}
        </span>
        <span 
          v-if="hasUnreadNotifications && sidebarConfig.enableNotificationBadge"
          class="h-2 w-2 rounded-full bg-error-600"
        ></span>
        <div
          v-if="isCollapsed"
          class="pointer-events-none absolute left-14 whitespace-nowrap rounded-md bg-gray-900 px-md py-1 text-xs primary_2_text_color opacity-0 transition group-hover:opacity-100"
        >
          {{ notification.label }}
        </div>
      </div>

      <div class="block h-[1px] w-full bg-gray-25 mt-md"></div>


    <!-- User -->
    <div
      class=" mt-7 p-2 flex items-center gap-3 rounded-md cursor-pointer"
      :class="isCollapsed ? 'justify-center' : ''"
      @click.stop="showUserAccount = true"
    >
      <img
        :src="sidebarAvatarUrl"
        :alt="sidebarDisplayName || 'Profile'"
        class="h-8 w-8 rounded-full object-cover"
      />
      <div v-if="!isCollapsed" class="min-w-0 flex-1">
        <p class="label_2_semibold primary_text_color truncate" :title="sidebarDisplayName">{{ sidebarDisplayName || "—" }}</p>
        <p class="label_3_regular secondary_text_color truncate" :title="sidebarUserEmail">{{ sidebarUserEmail || "—" }}</p>
      </div>
    </div>
    </div>
    </div>
  </aside>

  <!-- 👤 USER ACCOUNT POPUP (Mobile) -->
  <UserAccountPopup
    :open="showUserAccount"
    :is-collapsed="false"
    :avatar-url="sidebarAvatarUrl"
    :display-name="sidebarDisplayName"
    :email="sidebarUserEmail"
    @close="showUserAccount = false"
  />
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
import PlusIcon from "../../assets/images/PlusIcon.svg";
import ImageEditIcon from "../../assets/images/ImageEditIcon.svg";
import TrashIcon from "../../assets/images/TrashIcon.svg";
import UserAccountPopup from "./UserAccountPopup.vue";

const sidebarConfig = getSidebarConfig();
const menuItems = getSidebarMenuItems();
const notification = getSidebarNotificationItem();

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  activeTab: { type: String, default: "" },
  activeSessionId: [String, Number],
  isCreatingNewChat: Boolean,
});

const emit = defineEmits(["changeTab", "close", "newChat", "loadSession", "sessionDeleted"]);
const router = useRouter();
const isCollapsed = ref(false);
const showUserAccount = ref(false);
const showNotifications = ref(false);
const notifications = ref([]);
const unreadNotificationsCount = ref(0);
const chatSessions = ref([]);
const isLoadingSessions = ref(false);
const currentPage = ref(1);
const hasNext = ref(true);
const loadingMoreSessions = ref(false);
const openChatSessionMenuId = ref(null);
const chatSessionMenuTriggerRefs = ref({});
const deletingChatSessionId = ref(null);
const chatSessionMenuPanelRef = ref(null);
const chatSessionMenuPanelStyle = ref({ top: "0px", left: "0px" });
const CHAT_SESSION_MENU_MIN_WIDTH_PX = 168;
const editingSessionId = ref(null);
const editingTitle = ref("");
const editInputRef = ref(null);
const sidebarDisplayName = ref("");
const sidebarUserEmail = ref("");
const sidebarAvatarUrl = ref(sidebarFallbackAvatar("User"));

const chatSessionForOpenMenu = computed(() => {
  const id = openChatSessionMenuId.value;
  if (id == null) return null;
  return chatSessions.value.find((s) => s.id === id) ?? null;
});

const hasUnreadNotifications = computed(() => unreadNotificationsCount.value > 0);

const setChatSessionMenuTriggerRef = (sessionId, el) => {
  if (el) chatSessionMenuTriggerRefs.value[sessionId] = el;
  else delete chatSessionMenuTriggerRefs.value[sessionId];
};

const closeChatSessionMenu = () => {
  openChatSessionMenuId.value = null;
};

const onDocumentPointerDownCloseChatSessionMenu = (event) => {
  const id = openChatSessionMenuId.value;
  if (id == null) return;
  const target = event.target;
  if (!(target instanceof Node)) return;
  if (chatSessionMenuPanelRef.value?.contains(target)) return;
  if (chatSessionMenuTriggerRefs.value[id]?.contains(target)) return;
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
  if (!el?.getBoundingClientRect) {
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
  editingTitle.value = session.title || "";
  nextTick(() => {
    const el = Array.isArray(editInputRef.value) ? editInputRef.value[0] : editInputRef.value;
    if (el) {
      el.focus();
      el.select();
    }
  });
};

const saveRename = async () => {
  if (!editingSessionId.value || !sidebarConfig.enableSessionRename) return;
  const sessionId = editingSessionId.value;
  const newTitle = editingTitle.value.trim();
  const session = chatSessions.value.find((s) => s.id === sessionId);
  if (session && (session.title || "") === newTitle) {
    editingSessionId.value = null;
    editingTitle.value = "";
    return;
  }
  try {
    await renameChatSession(sessionId, newTitle);
    const idx = chatSessions.value.findIndex((s) => s.id === sessionId);
    if (idx !== -1) chatSessions.value[idx].title = newTitle;
  } catch (error) {
    console.error("Failed to rename session:", error);
  } finally {
    editingSessionId.value = null;
    editingTitle.value = "";
  }
};

const handleRenameKeydown = (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    saveRename();
  } else if (event.key === "Escape") {
    event.preventDefault();
    editingSessionId.value = null;
    editingTitle.value = "";
  }
};

const truncateTitle = (title) => {
  if (!title) return "Untitled Chat";
  const maxLength = 33;
  return title.length > maxLength ? title.substring(0, maxLength) : title;
};

const onChatSessionDelete = async (session) => {
  const sessionId = session?.id;
  if (sessionId == null || sessionId === "" || deletingChatSessionId.value) return;
  closeChatSessionMenu();
  deletingChatSessionId.value = sessionId;
  try {
    await deleteChatSession(sessionId);
    chatSessions.value = chatSessions.value.filter((s) => String(s.id) !== String(sessionId));
    emit("sessionDeleted", sessionId);
  } catch (e) {
    console.error("Delete chat history failed:", e);
    window.alert(e?.response?.data?.message || e?.message || "Could not delete this chat");
  } finally {
    deletingChatSessionId.value = null;
  }
};

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

const loadChatSessions = async () => {
  isLoadingSessions.value = true;
  currentPage.value = 1;
  hasNext.value = true;
  try {
    const result = await fetchChatSessionsApi(1, 20);
    if (result && typeof result === 'object' && 'chats' in result) {
      chatSessions.value = result.chats || [];
      const pag = result.pagination;
      hasNext.value = pag ? pag.has_next : false;
    } else {
      chatSessions.value = Array.isArray(result) ? result : [];
      hasNext.value = false;
    }
    
    syncActiveChatSession();
  } catch (error) {
    console.error("Error fetching chat sessions:", error);
    chatSessions.value = [];
  } finally {
    isLoadingSessions.value = false;
  }
};

const loadMoreChatSessions = async () => {
  if (loadingMoreSessions.value || !hasNext.value) return;

  loadingMoreSessions.value = true;
  const nextPage = currentPage.value + 1;
  try {
    const result = await fetchChatSessionsApi(nextPage, 20);
    if (result && typeof result === 'object' && 'chats' in result) {
      const incoming = result.chats || [];
      const existingIds = new Set(chatSessions.value.map(s => s.id));
      for (const session of incoming) {
        if (!existingIds.has(session.id)) {
          chatSessions.value.push(session);
        }
      }
      const pag = result.pagination;
      hasNext.value = pag ? pag.has_next : false;
      currentPage.value = nextPage;
    } else {
      hasNext.value = false;
    }
  } catch (error) {
    console.error("Error loading more chat sessions:", error);
  } finally {
    loadingMoreSessions.value = false;
  }
};

const handleScroll = (event) => {
  closeChatSessionMenu();
  const el = event.target;
  if (el.scrollHeight - el.scrollTop - el.clientHeight < 20) {
    loadMoreChatSessions();
  }
};

const handleSessionRowClick = (session) => {
  if (sidebarConfig.enableSessionRename && editingSessionId.value === session.id) return;
  handleSessionClick(session.id);
};

const handleSessionClick = (sessionId) => {
  closeChatSessionMenu();
  router.push(sidebarConfig.chatRoute || "/chat");
  emit("loadSession", sessionId);
  emit("close");
};

const refreshChatSessions = () => loadChatSessions();

const fetchNotificationsForBadge = async () => {
  if (!sidebarConfig.enableNotificationBadge) return;
  try {
    const list = await fetchNotificationsApi();
    notifications.value = list.map((n) => ({ id: n.id, isRead: n.isRead }));
    unreadNotificationsCount.value = notifications.value.filter((n) => !n.isRead).length;
  } catch (error) {
    console.error("Failed to fetch notifications for badge:", error);
  }
};

const handleNewChatClick = () => {
  showUserAccount.value = false;
  router.push(sidebarConfig.chatRoute || "/chat");
  emit("newChat");
  emit("close");
};

const handleSidebarClick = (tab) => {
  showUserAccount.value = false;
  if (tab === "notifications") {
    showNotifications.value = false;
    emit("changeTab", tab);
    emit("close");
    return;
  }
  showNotifications.value = false;
  emit("changeTab", tab);
  emit("close");
};

const handleSidebarContainerClick = () => {
  if (showUserAccount.value) showUserAccount.value = false;
  closeChatSessionMenu();
  if (editingSessionId.value) saveRename();
};

onMounted(() => {
  loadChatSessions();
  loadSidebarUser();
  fetchNotificationsForBadge();
  window.addEventListener("profile-updated", loadSidebarUser);
});

const syncActiveChatSession = () => {
  if (props.isCreatingNewChat) {
    return;
  }
  if (props.activeTab !== 'chat' || chatSessions.value.length === 0) return;

  const hasSelected = props.activeSessionId != null && props.activeSessionId !== '';
  const exists = hasSelected && chatSessions.value.some(s => String(s.id) === String(props.activeSessionId));

  if (exists) {
    handleSessionClick(props.activeSessionId);
  } else if (!hasSelected && chatSessions.value.length > 0) {
    handleSessionClick(chatSessions.value[0].id);
  }
};

watch(
  () => props.activeTab,
  (newTab) => {
    if (newTab === 'chat') {
      syncActiveChatSession();
    }
  }
);

onUnmounted(() => {
  window.removeEventListener("profile-updated", loadSidebarUser);
});

defineExpose({ refreshChatSessions });
</script>
