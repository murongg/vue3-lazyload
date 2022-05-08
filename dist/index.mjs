import { L as Lazy } from './chunks/lazy.mjs';

const index = {
  install(Vue, options) {
    const lazy = new Lazy(options);
    Vue.config.globalProperties.$Lazyload = lazy;
    Vue.provide("Lazyload", lazy);
    Vue.directive("lazy", {
      mounted: lazy.mount.bind(lazy),
      updated: lazy.update.bind(lazy),
      unmounted: lazy.unmount.bind(lazy)
    });
  }
};

export { index as default };
