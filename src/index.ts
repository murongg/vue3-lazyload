import Lazy from './lazy'
import LazyComponent from './lazy-component'
import LazyImage from './lazy-image'
import { App, provide } from 'vue';
import { Options } from './interface';

export default {
  /**
   * install plugin
   *
   * @param {App} Vue
   * @param {LazyOptions} options
   */
  install (Vue: App, options: Options) {
    const lazy = new Lazy(options)

    if (options.lazyComponent) {
      Vue.component('lazy-component', LazyComponent(lazy))
    }

    if (options.lazyImage) {
      Vue.component('lazy-image', LazyImage(lazy))
    }
    Vue.config.globalProperties.$Lazyload = lazy
    Vue.provide('Lazyload', lazy)
    Vue.directive('lazy', {
      mounted: lazy.add.bind(lazy),
      updated: lazy.update.bind(lazy),
      unmounted: lazy.remove.bind(lazy)
    })
  }
}
