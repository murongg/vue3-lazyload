import { createApp } from 'vue'
import VueLazyLoad from '../src/index'
import App from './App.vue'

const app = createApp(App)
app.use(VueLazyLoad, {
  log: false,
  observerOptions: {
    threshold: 0.15,
  },
})
app.mount('#app')
