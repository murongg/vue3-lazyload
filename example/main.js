import { createApp } from 'vue'
import App from './App.vue'
import VueLazyLoad from '../src/index'

const app = createApp(App)
app.use(VueLazyLoad, {
  log: true,
  lifecycle: {
    loading: () => {
      console.log('loading')
    },
    error: () => {
      console.log('error')
    },
    loaded: () => {
      console.log('loaded')
    }
  }
})
app.mount('#app')
