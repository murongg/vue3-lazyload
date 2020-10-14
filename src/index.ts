import Lazy from './lazy'
import { App } from 'vue';
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

    Vue.config.globalProperties.$Lazyload = lazy
        
    Vue.directive('lazy', {
      mounted: lazy.add.bind(lazy),
      updated: lazy.update.bind(lazy),
      unmounted: lazy.remove.bind(lazy)
    })
  }
}
