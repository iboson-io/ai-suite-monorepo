import ChatView from '../../views/ChatView.vue'
import AgentsView from '../../views/AgentsView.vue'
import WorkflowsView from '../../views/WorkflowsView.vue'

export function getDashboardConfig() {
  return {
    tabToRouteMap: {
      chat: '/home',
      agents: '/agents',
      workflows: '/workflows',
      settings: '/settings',
    },
    routeToTabMap: {
      '/home': 'chat',
      '/chat': 'chat',
      '/agents': 'agents',
      '/workflows': 'workflows',
      '/settings': 'settings',
      '/dashboard': 'chat',
    },
    remountOnReselectTabs: ['agents', 'workflows', 'settings'],
    resetChatOnReselectChat: true,
    mobileFixedHeader: false,
    rootLayoutClass: 'flex min-h-screen bg_secondary_color overflow-hidden',
    mainAreaClass: 'flex min-h-0 flex-1 flex-col overflow-y-auto transition-all duration-300 bg_primary_color',
    contentWrapperClass: 'flex min-h-0 flex-1 flex-col',
    mobileHeaderClass: 'flex items-center gap-xl bg-transparent px-3xl py-xl absolute z-30 lg:hidden',
  }
}

export function getDashboardViews() {
  return {
    chat: ChatView,
    agents: AgentsView,
    workflows: WorkflowsView,
  }
}

export function getDashboardViewClass(tab) {
  if (tab === 'chat' || tab === 'agents' || tab === 'workflows') {
    return 'flex min-h-0 flex-1 flex-col'
  }
  return ''
}
