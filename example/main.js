import { createApp } from 'vue'
import App from './App.vue'
import VueLazyLoad from '../src/index'

const app = createApp(App)
app.use(VueLazyLoad)
app.mount('#app')
