var LifecycleEnum = /* @__PURE__ */ ((LifecycleEnum2) => {
  LifecycleEnum2["LOADING"] = "loading";
  LifecycleEnum2["LOADED"] = "loaded";
  LifecycleEnum2["ERROR"] = "error";
  return LifecycleEnum2;
})(LifecycleEnum || {});

const inBrowser = typeof window !== "undefined" && window !== null;
const hasIntersectionObserver = checkIntersectionObserver();
const isEnumerable = Object.prototype.propertyIsEnumerable;
const getSymbols = Object.getOwnPropertySymbols;
function isObject(val) {
  return typeof val === "function" || toString.call(val) === "[object Object]";
}
function isPrimitive(val) {
  return typeof val === "object" ? val === null : typeof val !== "function";
}
function isValidKey(key) {
  return key !== "__proto__" && key !== "constructor" && key !== "prototype";
}
function checkIntersectionObserver() {
  if (inBrowser && "IntersectionObserver" in window && "IntersectionObserverEntry" in window && "intersectionRatio" in window.IntersectionObserverEntry.prototype) {
    if (!("isIntersecting" in window.IntersectionObserverEntry.prototype)) {
      Object.defineProperty(window.IntersectionObserverEntry.prototype, "isIntersecting", {
        get() {
          return this.intersectionRatio > 0;
        }
      });
    }
    return true;
  }
  return false;
}
function assignSymbols(target, ...args) {
  if (!isObject(target))
    throw new TypeError("expected the first argument to be an object");
  if (args.length === 0 || typeof Symbol !== "function" || typeof getSymbols !== "function")
    return target;
  for (const arg of args) {
    const names = getSymbols(arg);
    for (const key of names) {
      if (isEnumerable.call(arg, key))
        target[key] = arg[key];
    }
  }
  return target;
}
function assign(target, ...args) {
  let i = 0;
  if (isPrimitive(target))
    target = args[i++];
  if (!target)
    target = {};
  for (; i < args.length; i++) {
    if (isObject(args[i])) {
      for (const key of Object.keys(args[i])) {
        if (isValidKey(key)) {
          if (isObject(target[key]) && isObject(args[i][key]))
            assign(target[key], args[i][key]);
          else
            target[key] = args[i][key];
        }
      }
      assignSymbols(target, args[i]);
    }
  }
  return target;
}

const DEFAULT_OBSERVER_OPTIONS = {
  rootMargin: "0px",
  threshold: 0
};
const DEFAULT_LOADING = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
const DEFAULT_ERROR = "";
class Lazy {
  constructor(options) {
    this.options = {
      loading: DEFAULT_LOADING,
      error: DEFAULT_ERROR,
      observerOptions: DEFAULT_OBSERVER_OPTIONS,
      log: true,
      lifecycle: {}
    };
    this._images = /* @__PURE__ */ new WeakMap();
    this.config(options);
  }
  config(options = {}) {
    assign(this.options, options);
  }
  mount(el, binding) {
    const { src, loading, error, lifecycle } = this._valueFormatter(binding.value);
    this._lifecycle(LifecycleEnum.LOADING, lifecycle, el);
    el.setAttribute("src", loading || DEFAULT_LOADING);
    if (!hasIntersectionObserver) {
      this.loadImages(el, src, error, lifecycle);
      this._log(() => {
        throw new Error("Not support IntersectionObserver!");
      });
    }
    this._initIntersectionObserver(el, src, error, lifecycle);
  }
  update(el, binding) {
    this._realObserver(el)?.unobserve(el);
    const { src, error, lifecycle } = this._valueFormatter(binding.value);
    this._initIntersectionObserver(el, src, error, lifecycle);
  }
  unmount(el) {
    this._realObserver(el)?.unobserve(el);
    this._images.delete(el);
  }
  loadImages(el, src, error, lifecycle) {
    this._setImageSrc(el, src, error, lifecycle);
  }
  _setImageSrc(el, src, error, lifecycle) {
    if (el.tagName.toLowerCase() === "img") {
      if (src) {
        const preSrc = el.getAttribute("src");
        if (preSrc !== src)
          el.setAttribute("src", src);
      }
      this._listenImageStatus(el, () => {
        this._lifecycle(LifecycleEnum.LOADED, lifecycle, el);
      }, () => {
        el.onload = null;
        this._lifecycle(LifecycleEnum.ERROR, lifecycle, el);
        this._realObserver(el)?.disconnect();
        if (error)
          el.setAttribute("src", error);
        this._log(() => {
          throw new Error(`Image failed to load!And failed src was: ${src} `);
        });
      });
    } else {
      el.style.backgroundImage = `url('${src}')`;
    }
  }
  _initIntersectionObserver(el, src, error, lifecycle) {
    const observerOptions = this.options.observerOptions;
    this._images.set(el, new IntersectionObserver((entries) => {
      Array.prototype.forEach.call(entries, (entry) => {
        if (entry.isIntersecting) {
          this._realObserver(el)?.unobserve(entry.target);
          this._setImageSrc(el, src, error, lifecycle);
        }
      });
    }, observerOptions));
    this._realObserver(el)?.observe(el);
  }
  _listenImageStatus(image, success, error) {
    image.onload = success;
    image.onerror = error;
  }
  _valueFormatter(value) {
    let src = value;
    let loading = this.options.loading;
    let error = this.options.error;
    let lifecycle = this.options.lifecycle;
    if (isObject(value)) {
      src = value.src;
      loading = value.loading || this.options.loading;
      error = value.error || this.options.error;
      lifecycle = value.lifecycle || this.options.lifecycle;
    }
    return {
      src,
      loading,
      error,
      lifecycle
    };
  }
  _log(callback) {
    if (this.options.log)
      callback();
  }
  _lifecycle(life, lifecycle, el) {
    switch (life) {
      case LifecycleEnum.LOADING:
        el?.setAttribute("lazy", LifecycleEnum.LOADING);
        if (lifecycle?.loading)
          lifecycle.loading(el);
        break;
      case LifecycleEnum.LOADED:
        el?.setAttribute("lazy", LifecycleEnum.LOADED);
        if (lifecycle?.loaded)
          lifecycle.loaded(el);
        break;
      case LifecycleEnum.ERROR:
        el?.setAttribute("lazy", LifecycleEnum.ERROR);
        if (lifecycle?.error)
          lifecycle.error(el);
        break;
    }
  }
  _realObserver(el) {
    return this._images.get(el);
  }
}

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
