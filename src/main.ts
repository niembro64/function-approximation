import { createApp, type App as VueApp } from 'vue'
import './style.css'
import App from './App.vue'

const app: VueApp = createApp(App)
app.mount('#app')
