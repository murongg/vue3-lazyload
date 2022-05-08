import type { App } from 'vue'
import type { LazyOptions } from './types'
declare const _default: {
  /**
     * install plugin
     *
     * @param {App} Vue
     * @param {LazyOptions} options
     */
  install(Vue: App, options: LazyOptions): void
}
export default _default
export * from './hooks'
