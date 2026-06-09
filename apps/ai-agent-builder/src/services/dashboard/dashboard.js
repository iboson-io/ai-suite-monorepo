import ChatView from '../../views/ChatView.vue'
import AgentsView from '../../views/AgentsView.vue'
import TasksView from '../../views/TasksView.vue'

export function getDashboardConfig() {
  return {
    tabToRouteMap: {
      chat: '/home',
      agents: '/agents',
      tasks: '/tasks',
      settings: '/settings',
    },
    routeToTabMap: {
      '/home': 'chat',
      '/chat': 'chat',
      '/agents': 'agents',
      '/tasks': 'tasks',
      '/settings': 'settings',
      '/dashboard': 'chat',
    },
    remountOnReselectTabs: ['agents', 'tasks', 'settings'],
    resetChatOnReselectChat: true,
    mobileFixedHeader: false,
    rootLayoutClass: 'flex min-h-screen bg_secondary_color overflow-hidden',
    mainAreaClass: 'flex min-h-0 flex-1 flex-col overflow-y-auto transition-all duration-300 bg_primary_color',
    contentWrapperClass: 'flex min-h-0 flex-1 flex-col',
    mobileHeaderClass: 'flex items-center gap-xl bg-transparent px-3xl py-xl absolute lg:hidden',
  }
}

export function getDashboardViews() {
  return {
    chat: ChatView,
    agents: AgentsView,
    tasks: TasksView,
  }
}

export function getDashboardViewClass(tab) {
  if (tab === 'chat' || tab === 'agents') {
    return 'flex min-h-0 flex-1 flex-col'
  }
  return ''
}
