import SignOutIcon from '../../assets/images/SignOutIcon.svg'

export function getUserAccountConfig() {
  return {
    showProfileHeader: true,
    popupWidthClass: 'lg:w-52',
    menuItems: [
      { id: 'logout', label: 'Sign out', icon: SignOutIcon, action: 'logout' },
    ],
  }
}
