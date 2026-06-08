import { createRouter, createWebHistory } from 'vue-router'

import SignIn from '../views/auth/SignIn.vue'
import SignUp from '../../../../packages/shared-ui/src/views/auth/SignUp.vue'
import EmailValidation from '../../../../packages/shared-ui/src/views/auth/EmailValidation.vue'
import Password from '../../../../packages/shared-ui/src/views/auth/Password.vue'
import ForgotPassword from '../../../../packages/shared-ui/src/views/auth/ForgotPassword.vue'
import ResetLink from '../../../../packages/shared-ui/src/views/auth/ResetLink.vue'
import ResetPassword from '../../../../packages/shared-ui/src/views/auth/ResetPassword.vue'
import PasswordUpdation from '../../../../packages/shared-ui/src/views/auth/PasswordUpdation.vue'
import AccountDeleted from '../../../../packages/shared-ui/src/views/AccountDeleted.vue'
import { DashboardView as Dashboard } from '@ai-suite/shared-ui'
import AgentDashboardView from '../views/AgentDashboardView.vue'
import MultiAgentDashboardView from '../views/MultiAgentDashboardView.vue'

import VerifyEmail from '../views/verify-email.vue'
import VerifyEmailToken from '../views/verify-email-token.vue'
import GoogleCallback from '../views/auth/google/callback.vue'

import { TOKEN_KEY, USER_KEY } from '../services/auth/signIn.js'

const PUBLIC_PATHS = [
  '/signin',
  '/signup',
  '/email-validation',
  '/password',
  '/forgot-password',
  '/reset-link',
  '/reset-password',
  '/password-updation',
  '/deleted-message',
  '/verify-email',
  '/verify-email-token',
  '/auth/google/callback',
]

function hasAuthToken() {
  const token = localStorage.getItem(TOKEN_KEY)
  return Boolean(token && token.trim())
}

function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

const routes = [
  {
    path: '/',
    redirect: () => (hasAuthToken() ? '/home' : '/signin'),
  },
  { path: '/login', redirect: '/signin' },
  { path: '/check-email', redirect: '/email-validation' },
  { path: '/reset-password-success', redirect: '/password-updation' },

  { path: '/signin', name: 'SignIn', component: SignIn },
  { path: '/signup', name: 'SignUp', component: SignUp },
  { path: '/email-validation', name: 'EmailValidation', component: EmailValidation },
  { path: '/password', name: 'Password', component: Password },
  { path: '/forgot-password', name: 'ForgotPassword', component: ForgotPassword },
  { path: '/reset-link', name: 'ResetLink', component: ResetLink },
  { path: '/reset-password', name: 'ResetPassword', component: ResetPassword },
  { path: '/password-updation', name: 'PasswordUpdation', component: PasswordUpdation },
  { path: '/deleted-message', name: 'AccountDeleted', component: AccountDeleted },

  { path: '/chat', redirect: '/home' },
  { path: '/dashboard', redirect: '/home' },

  { path: '/auth/google/callback', name: 'GoogleCallback', component: GoogleCallback },
  { path: '/verify-email', name: 'VerifyEmail', component: VerifyEmail },
  { path: '/verify-email-token', name: 'VerifyEmailToken', component: VerifyEmailToken },

  { path: '/home', name: 'Home', component: Dashboard, meta: { requiresAuth: true } },
  {
    path: '/agent-dashboard',
    name: 'AgentDashboard',
    component: AgentDashboardView,
    meta: { requiresAuth: true, standaloneAgentView: true },
  },
  {
    path: '/multi-agent-dashboard',
    name: 'MultiAgentDashboard',
    component: MultiAgentDashboardView,
    meta: { requiresAuth: true, standaloneAgentView: true },
  },
  { path: '/agents', name: 'Agents', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/tasks', name: 'Tasks', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/phone-number', name: 'PhoneNumber', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/settings', name: 'Settings', component: Dashboard, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const normalizedPath = to.path.replace(/\/+$/, '') || '/'
  const authOnlyPaths = ['/signin', '/signup']
  const normalizedPublicPaths = PUBLIC_PATHS.map((path) => path.replace(/\/+$/, '') || '/')

  if (to.query.logout === '1' || to.query.logout === 'true') {
    clearAuthSession()
    return { path: '/signin', query: {} }
  }

  if (normalizedPath === '/signin') {
    const tokenQuery = to.query.token
    const tokenValue = Array.isArray(tokenQuery) ? tokenQuery[0] : tokenQuery

    if (typeof tokenValue === 'string' && tokenValue.trim()) {
      const normalizedToken = tokenValue.replace(/^"+|"+$/g, '').trim()

      if (normalizedToken) {
        localStorage.setItem(TOKEN_KEY, normalizedToken)
        return '/home'
      }
    }
  }

  const isSignedIn = hasAuthToken()

  if (isSignedIn && authOnlyPaths.includes(normalizedPath) && to.query.relogin !== '1') {
    return '/home'
  }

  if (!isSignedIn && !normalizedPublicPaths.includes(normalizedPath)) {
    return '/signin'
  }

  return true
})

router.afterEach((to) => {
  document.title = to.meta.title || 'AI Agent Builder'
})

export default router
