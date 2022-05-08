import type { App } from 'vue'
import { createApp, inject } from 'vue'
import { beforeEach, describe, expect, it } from 'vitest'
import LazyLoad from '../src'
import Lazy from '../src/lazy'

const AppContanier = {
  template: `
    <div>
      <img v-lazy="123" />
    </div>
  `,
}
let app: App
let $Lazyload: Lazy
const options = {
  loading: 'loading',
}
describe('Vue3-lazyload Test', () => {
  beforeEach(() => {
    app = createApp(AppContanier)
    app.use(LazyLoad, options)
    $Lazyload = app.config.globalProperties.$Lazyload
  })
  it('install', () => {
    expect($Lazyload instanceof Lazy).toBeTruthy()
  })

  it('test options', () => {
    expect($Lazyload.options.loading).toBe(options.loading)
  })

  it('test merge config', () => {
    const newOptions = {
      error: 'error',
    }
    $Lazyload.config(newOptions)
    expect($Lazyload.options.error).toBe(newOptions.error)
  })

  it('test support useLazyload', () => {
    const component = {
      template: '<div></div>',
      setup() {
        const useLazyload = inject<Lazy>('Lazyload')
        expect(useLazyload?.options.loading).toBe(options.loading)
      },
    }
    const root = document.createElement('div')
    createApp(component).use(LazyLoad, options).mount(root)
  })
})
