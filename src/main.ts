import { createApp } from 'vue'
import './style.css'
import './zoom-compatibility.css'
import App from './App.vue'
// @ts-ignore
import router from './router'
import './firebase/config' // Initialize Firebase

const app = createApp(App)
app.use(router)
app.mount('#app')
