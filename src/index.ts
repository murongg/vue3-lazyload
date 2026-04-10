import type { App } from 'vue'
import Lazy from './lazy'
import { LazyComponent } from './lazy-component'
import type { LazyOptions } from './types'
export * from './hooks'
export { LazyComponent }
export type { LazyComponentProps } from './types'

export default {
  /**
   * install plugin
   *
   * @param {App} Vue
   * @param {LazyOptions} options
   */
  install(Vue: App, options?: LazyOptions): void {
    const lazy = new Lazy(options)

    Vue.config.globalProperties.$Lazyload = lazy
    Vue.provide('Lazyload', lazy)
    Vue.component('LazyComponent', LazyComponent)
    Vue.directive('lazy', {
      mounted: lazy.mount.bind(lazy),
      updated: lazy.update.bind(lazy),
      unmounted: lazy.unmount.bind(lazy),
    })
  },
}
