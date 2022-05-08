'use strict';

const lazy = require('./chunks/lazy.cjs');

const index = {
  install(Vue, options) {
    const lazy$1 = new lazy.Lazy(options);
    Vue.config.globalProperties.$Lazyload = lazy$1;
    Vue.provide("Lazyload", lazy$1);
    Vue.directive("lazy", {
      mounted: lazy$1.mount.bind(lazy$1),
      updated: lazy$1.update.bind(lazy$1),
      unmounted: lazy$1.unmount.bind(lazy$1)
    });
  }
};

module.exports = index;
