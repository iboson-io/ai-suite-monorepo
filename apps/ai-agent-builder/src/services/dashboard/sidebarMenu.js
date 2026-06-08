import HomeIcon from '../../assets/images/HomeIcon.svg'
import AgentsIcon from '../../assets/images/AiIcon.svg'
import TasksIcon from '../../assets/images/PostIcon.svg'
import PhoneIcon from '../../assets/images/SmsIcon.svg'
import SettingsIcon from '../../assets/images/SettingsIcon.svg'
import NotificationIcon from '../../assets/images/NotificationIcon.svg'
import AiagentIcon from '../../assets/images/agents/dashboard/aiagenticon.svg'

export function getSidebarConfig() {
  return {
    brandName: 'AI Agent',
    brandIcon: AiagentIcon,
    enableSessionRename: true,
    enableNotificationBadge: true,
    chatRoute: '/home',
    newChatButtonClass: 'px-md py-xl',
    layout: 'scrollable',
  }
}

export function getSidebarMenuItems() {
  return [
    { icon: HomeIcon, label: 'Home', tab: 'chat' },
    { icon: AgentsIcon, label: 'Agents', tab: 'agents' },
    { icon: TasksIcon, label: 'Tasks', tab: 'tasks' },
    { icon: PhoneIcon, label: 'Phone number', tab: 'phone' },
    { icon: SettingsIcon, label: 'Settings', tab: 'settings' },
  ]
}

export function getSidebarNotificationItem() {
  return { icon: NotificationIcon, label: 'Notifications', tab: 'notifications' }
}
