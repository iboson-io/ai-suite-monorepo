import ChatView from '../../views/ChatView.vue'
import CalendarView from '../../views/CalendarView.vue'
import Automations from '../../views/Automations.vue'
import AnalyticsView from '../../views/AnalyticsView.vue'
import ProductsView from '../../views/ProductsView.vue'

export function getDashboardConfig() {
  return {
    tabToRouteMap: {
      chat: '/chat',
      calendar: '/calendar',
      automations: '/automations',
      analytics: '/analytics',
      products: '/products',
      settings: '/settings',
    },
    routeToTabMap: {
      '/chat': 'chat',
      '/calendar': 'calendar',
      '/automations': 'automations',
      '/analytics': 'analytics',
      '/products': 'products',
      '/settings': 'settings',
      '/dashboard': 'chat',
    },
    remountOnReselectTabs: ['products', 'settings'],
    resetChatOnReselectChat: false,
    mobileFixedHeader: true,
    rootLayoutClass: 'flex h-full min-h-0 w-full max-h-dvh overflow-hidden bg_secondary_color',
    mainAreaClass: 'relative flex h-full min-h-0 flex-1 flex-col overflow-hidden transition-all duration-300',
    contentWrapperClass: 'flex h-full min-h-0 flex-1 flex-col overflow-y-auto pt-14 lg:pt-0 bg_primary_color',
    mobileHeaderClass: 'fixed inset-x-0 top-0 z-[100] flex h-14 items-center gap-xl bg_primary_color px-3xl lg:hidden',
  }
}

export function getDashboardViews() {
  return {
    chat: ChatView,
    calendar: CalendarView,
    automations: Automations,
    analytics: AnalyticsView,
    products: ProductsView,
  }
}

export function getDashboardViewClass(tab) {
  if (tab === 'chat' || tab === 'automations') {
    return 'flex min-h-0 flex-1 flex-col'
  }
  return ''
}
