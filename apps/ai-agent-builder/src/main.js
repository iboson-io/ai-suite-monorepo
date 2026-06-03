import { createApp } from 'vue'
import './style.css'
import '@ai-suite/shared-ui/styles/Main.css'

import App from './App.vue'
import router from './router'
import { TOKEN_KEY, USER_KEY } from './services/auth/signIn.js'
import { apiService } from './services/agentApi.js'

// Drop corrupted session values that block the login screen
for (const key of [TOKEN_KEY, USER_KEY]) {
  const value = localStorage.getItem(key)
  if (value === 'undefined' || value === 'null' || value === '') {
    localStorage.removeItem(key)
  }
}

const storedToken = localStorage.getItem(TOKEN_KEY)
if (storedToken) {
  apiService.setAuthToken(storedToken)
}

createApp(App)
  .use(router)
  .mount('#app')
