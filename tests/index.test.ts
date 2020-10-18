import { createApp, App } from 'vue'
import LazyLoad from '../src'
import Lazy from '../src/lazy'
import 'jest-canvas-mock'
const AppContanier = {
  template: `
    <div>
      <img v-lazy="123" />
    </div>
  `
}
let app:App
let $Lazyload: Lazy
const options = {
  loading: 'loading'
}
describe('Vue3-lazyload Test', function () {
  beforeEach(() => {
    app = createApp(AppContanier)
    app.use(LazyLoad, options)
    $Lazyload = app.config.globalProperties['$Lazyload']
  })
  it('install', function () {    
    expect($Lazyload instanceof Lazy).toBeTruthy()
  })

  it('test options', function() {
    expect($Lazyload.options.loading).toBe(options.loading)
  })

  it('test merge config', function() {
    const newOptions = {
      error: 'error'
    }
    $Lazyload.config(newOptions)
    expect($Lazyload.options.error).toBe(newOptions.error)
  })
})