import CalendarIcon from '../../assets/images/CalendarIcon.svg'
import SettingsIcon from '../../assets/images/SettingsIcon.svg'
import NotificationIcon from '../../assets/images/NotificationIcon.svg'
import ProductIcon from '../../assets/images/ProductIcon.svg'
import AnalyticsIcon from '../../assets/images/AnalyticsIcon.svg'

export function getSidebarConfig() {
  return {
    enableSessionRename: true,
    enableNotificationBadge: true,
    chatRoute: '/chat',
    newChatButtonClass: 'px-md py-xl',
    layout: 'scrollable',
  }
}

export function getSidebarMenuItems() {
  return [
    { icon: CalendarIcon, label: 'Calendar', tab: 'calendar' },
    { icon: CalendarIcon, label: 'Automations', tab: 'automations' },
    { icon: AnalyticsIcon, label: 'Analytics', tab: 'analytics' },
    { icon: ProductIcon, label: 'Products', tab: 'products' },
    { icon: SettingsIcon, label: 'Settings', tab: 'settings' },
  ]
}

export function getSidebarNotificationItem() {
  return { icon: NotificationIcon, label: 'Notifications', tab: 'notifications' }
}
