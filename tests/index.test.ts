import { createApp, App } from 'vue'
import LazyLoad from '../src'
import 'jest-canvas-mock'
const AppContanier = {
  template: `
    <div>
      <img v-lazy="123" />
    </div>
  `
}
let app:App


describe('Vue3-lazyload Test', function () {
  beforeEach(() => {
    app = createApp(AppContanier)
    app.use(LazyLoad, {
      preLoad: 1.3
    })
  })
  it('install', function () {    
    expect(app.config.globalProperties['$Lazyload']).not.toBeUndefined()
  })
})