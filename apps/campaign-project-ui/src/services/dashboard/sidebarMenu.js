import SettingsIcon from '../../assets/images/SettingsIcon.svg'
import NotificationIcon from '../../assets/images/NotificationIcon.svg'
import ProductIcon from '../../assets/images/ProductIcon.svg'
import AnalyticsIcon from '../../assets/images/AnalyticsIcon.svg'
import CampaignsIcon from '../../assets/images/CampaignIcon.svg'
import AutomationIcons from '../../assets/images/AutomationIcons.svg'
import AudienceIcon from '../../assets/images/AudienceIcon.svg'

export function getSidebarConfig() {
  return {
    enableSessionRename: false,
    enableNotificationBadge: false,
    chatRoute: '/chat',
    newChatButtonClass: 'p-md',
    layout: 'compact',
  }
}

export function getSidebarMenuItems() {
  return [
    { icon: CampaignsIcon, label: 'Campaigns', tab: 'campaigns' },
    { icon: AutomationIcons, label: 'Automations', tab: 'automations' },
    { icon: AudienceIcon, label: 'Audience', tab: 'audience' },
    { icon: AnalyticsIcon, label: 'Analytics', tab: 'analytics' },
    { icon: ProductIcon, label: 'Products', tab: 'products' },
    { icon: SettingsIcon, label: 'Settings', tab: 'settings' },
  ]
}

export function getSidebarNotificationItem() {
  return { icon: NotificationIcon, label: 'Notifications', tab: 'notifications' }
}
