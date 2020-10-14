import { createApp } from 'vue'
import LazyLoad from '../src'

const App = {
  template: `
    <div>
      <img v-lazy="123" />
    </div>
  `
}

describe('Vue3-lazyload Test', function () {
  it('install', function () {
    const app = createApp(App)
    app.use(LazyLoad)
    expect(app.config.globalProperties['$Lazyload']).not.toBeUndefined()
  })
})