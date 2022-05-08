import { createApp } from 'vue'
import VueLazyLoad from '../src/index'
import App from './App.vue'

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
    },
  },
})
app.mount('#app')
