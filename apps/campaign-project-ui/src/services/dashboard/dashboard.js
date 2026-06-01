import ChatView from '../../views/ChatView.vue'
import Campaigns from '../../views/Campaigns.vue'
import Automations from '../../views/Automations.vue'
import Audience from '../../views/Audience.vue'
import AnalyticsView from '../../views/AnalyticsView.vue'
import ProductView from '../../views/ProductsView.vue'

export function getDashboardConfig() {
  return {
    tabToRouteMap: {
      chat: '/chat',
      analytics: '/analytics',
      settings: '/settings',
      campaigns: '/campaigns',
      automations: '/automations',
      audience: '/audience',
      products: '/products',
    },
    routeToTabMap: {
      '/chat': 'chat',
      '/campaigns': 'campaigns',
      '/automations': 'automations',
      '/audience': 'audience',
      '/analytics': 'analytics',
      '/settings': 'settings',
      '/products': 'products',
      '/dashboard': 'chat',
    },
    remountOnReselectTabs: ['products', 'settings', 'audience', 'campaigns', 'automations', 'analytics'],
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
    campaigns: Campaigns,
    automations: Automations,
    audience: Audience,
    analytics: AnalyticsView,
    products: ProductView,
  }
}

export function getDashboardViewClass(tab) {
  if (tab === 'audience') {
    return 'flex min-h-0 flex-1 flex-col'
  }
  return ''
}
