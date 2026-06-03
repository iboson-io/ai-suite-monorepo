import SignOutIcon from '../../assets/images/SignOutIcon.svg'
import LanguageIcon from '../../assets/images/LanguageIcon.svg'
import SupportIcon from '../../assets/images/SupportIcon.svg'

export function getUserAccountConfig() {
  return {
    showProfileHeader: false,
    popupWidthClass: 'w-64',
    menuItems: [
      { id: 'support', label: 'Support', icon: SupportIcon, action: 'none' },
      {
        id: 'language',
        label: 'Language',
        icon: LanguageIcon,
        action: 'none',
        trailingLabel: 'English',
        showChevron: true,
      },
      { id: 'logout', label: 'Logout', icon: SignOutIcon, action: 'logout', dividerBefore: true },
    ],
  }
}
