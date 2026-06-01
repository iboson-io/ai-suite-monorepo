import { createApp } from 'vue'
import './style.css'
import '@ai-suite/shared-ui/styles/Main.css'

import App from './App.vue'
import router from "./router";

createApp(App)
  .use(router)
  .mount("#app");
