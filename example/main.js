import { createApp } from 'vue'
import App from './App.vue'
import VueLazyLoad from '../src/index'
import './index.css'

const app = createApp(App)
app.use(VueLazyLoad, {
    attempt: 1,
    observer: true,
    // lazyComponent: true,
    lazyImage: true
})
app.mount('#app')
