import {
  inBrowser,
  CustomEvent,
  remove,
  some,
  find,
  _,
  throttle,
  supportWebp,
  getDPR,
  scrollParent,
  getBestSelectionFromSrcset,
  isObject,
  hasIntersectionObserver,
} from './util'
import ImageCache from './image-cache'
import ReactiveListener from './listener'
import { nextTick } from 'vue'
import { LazyOptions } from './interface'
import { MODE_TYPE, DEFAULT_EVENTS as DEFAULT_EVENTS_ENUMS } from './enums'

const DEFAULT_URL = 'http://t7.baidu.com/it/u=378254553,3884800361&fm=79&app=86&f=JPEG?w=1280&h=2030'
const DEFAULT_EVENTS = [
  DEFAULT_EVENTS_ENUMS.SCROLL,
  DEFAULT_EVENTS_ENUMS.WHEEL,
  DEFAULT_EVENTS_ENUMS.MOUSEWHEEL,
  DEFAULT_EVENTS_ENUMS.RESIZE,
  DEFAULT_EVENTS_ENUMS.ANIMATIONEND,
  DEFAULT_EVENTS_ENUMS.TRANSITIONEND,
  DEFAULT_EVENTS_ENUMS.TOUCHMOVE
]
const DEFAULT_OBSERVER_OPTIONS = {
  rootMargin: '0px',
  threshold: 0
}

export default class Lazy {
  public version: string = '__VUE_LAZYLOAD_VERSION__'
  public mode: MODE_TYPE = MODE_TYPE.EVENT
  public ListenerQueue: any[] = []
  public TargetIndex: number = 0
  public TargetQueue: any[] = []
  public options: LazyOptions
  private _imageCache: ImageCache
  public lazyLoadHandler: () => void
  private _observer!: IntersectionObserver | null
  public Event!: any
  public $on!: (event: string | number, func: any) => void
  public $once!: (event: any, func: any) => void
  public $emit!: (event: string | number, context: any, inCache: any) => void
  constructor(options: LazyOptions) {
    const { preLoad = 1.3, silent, scale, throttleWait, preLoadTop, error, loading, attempt, listenEvents, adapter, observer, observerOptions } = options
    this.options = {
      silent: silent,
      dispatchEvent: !!dispatchEvent,
      throttleWait: throttleWait || 200,
      preLoad: preLoad,
      preLoadTop: preLoadTop || 0,
      error: error || DEFAULT_URL,
      loading: loading || DEFAULT_URL,
      attempt: attempt || 3,
      scale: scale || getDPR(scale),
      listenEvents: listenEvents || DEFAULT_EVENTS,
      hasbind: false,
      supportWebp: supportWebp(),
      adapter: adapter || {},
      observer: !!observer,
      observerOptions: observerOptions || DEFAULT_OBSERVER_OPTIONS
    }
    this._initEvent()
    this._imageCache = new ImageCache({ max: 200 })
    this.lazyLoadHandler = throttle(this._lazyLoadHandler.bind(this), this.options.throttleWait)

    this.setMode(this.options.observer ? MODE_TYPE.OBSERVER : MODE_TYPE.EVENT)
  }

  /**
   * update config
   * @param  {Object} config params
   * @return
   */
  // config (options = {}) {
  //   assign(this.options, options)
  // }

  /**
   * output listener's load performance
   * @return {Array}
   */
  performance() {
    let list: any[] = []

    this.ListenerQueue.map((item: { performance: () => any }) => {
      list.push(item.performance())
    })

    return list
  }

  /*
   * add lazy component to queue
   * @param  {Vue} vm lazy component instance
   * @return
   */
  addLazyBox(vm: HTMLElement) {
    this.ListenerQueue.push(vm)
    if (inBrowser) {
      this._addListenerTarget(window)
      this._observer && this._observer.observe(vm)
      if (vm && vm.parentNode) {
        this._addListenerTarget(vm.parentNode)
      }
    }
  }

  /*
   * add image listener to queue
   * @param  {DOM} el
   * @param  {object} binding vue directive binding
   * @param  {vnode} vnode vue directive vnode
   * @return
   */
  add(el: HTMLElement, binding: any, vnode: any) {
    if (some(this.ListenerQueue, item => item.el === el)) {
      this.update(el, binding)
      return nextTick(this.lazyLoadHandler)
    }

    let { src, loading, error } = this._valueFormatter(binding.value)

    nextTick(() => {
      src = getBestSelectionFromSrcset(el, this.options.scale) || src
      this._observer && this._observer.observe(el)

      const container = Object.keys(binding.modifiers)[0]
      let $parent

      if (container) {
        $parent = vnode.context.$refs[container]
        // if there is container passed in, try ref first, then fallback to getElementById to support the original usage
        $parent = $parent ? $parent.$el || $parent : document.getElementById(container)
      }

      if (!$parent) {
        $parent = scrollParent(el)
      }

      const bindType = binding.arg
      const elRenderer = this._elRenderer.bind(this)
      const options = this.options
      const imageCache = this._imageCache
      
      const newListener = new ReactiveListener(
        el,
        src,
        error,
        loading,
        bindType,
        $parent,
        options,
        undefined,
        elRenderer,
        imageCache
      )

      this.ListenerQueue.push(newListener)

      if (inBrowser) {
        this._addListenerTarget(window)
        this._addListenerTarget($parent)
      }

      this.lazyLoadHandler()
      nextTick(() => this.lazyLoadHandler())
    })
  }

  /**
  * update image src
  * @param  {DOM} el
  * @param  {object} vue directive binding
  * @return
  */
  update(el: HTMLElement, binding: any, vnode?: any) {
    let { src, loading, error } = this._valueFormatter(binding.value)
    src = getBestSelectionFromSrcset(el, this.options.scale) || src

    const exist = find(this.ListenerQueue, item => item.el === el)
    if (!exist) {
      this.add(el, binding, vnode)
    } else {
      exist.update({
        src,
        loading,
        error
      })
    }
    if (this._observer) {
      this._observer.unobserve(el)
      this._observer.observe(el)
    }
    this.lazyLoadHandler()
    nextTick(() => this.lazyLoadHandler())
  }

  /**
  * remove listener form list
  * @param  {DOM} el
  * @return
  */
  remove(el: any) {
    if (!el) return
    this._observer && this._observer.unobserve(el)
    const existItem = find(this.ListenerQueue, item => item.el === el)
    if (existItem) {
      this._removeListenerTarget(existItem.$parent)
      this._removeListenerTarget(window)
      remove(this.ListenerQueue, existItem)
      existItem.$destroy()
    }
  }

  /*
   * remove lazy components form list
   * @param  {Vue} vm Vue instance
   * @return
   */
  removeComponent(vm: HTMLElement) {
    if (!vm) return
    remove(this.ListenerQueue, vm)
    this._observer && this._observer.unobserve(vm)
    if (vm && vm.parentNode) {
      this._removeListenerTarget(vm.parentNode)
    }
    this._removeListenerTarget(window)
  }

  setMode(mode: MODE_TYPE) {
    if (!hasIntersectionObserver && mode === MODE_TYPE.OBSERVER) {
      mode = MODE_TYPE.EVENT
    }

    this.mode = mode // event or observer

    if (mode === MODE_TYPE.EVENT) {
      if (this._observer) {
        this.ListenerQueue.forEach((listener: { el: any }) => {
          this._observer?.unobserve(listener.el)
        })
        this._observer = null
      }

      this.TargetQueue.forEach((target: { el: any }) => {
        this._initListen(target.el, true)
      })
    } else {
      this.TargetQueue.forEach((target: { el: any }) => {
        this._initListen(target.el, false)
      })
      this._initIntersectionObserver()
    }
  }

  /*
  *** Private functions ***
  */

  /*
   * add listener target
   * @param  {DOM} el listener target
   * @return
   */
  _addListenerTarget(el: Node | Window) {
    if (!el) return
    let target = find(this.TargetQueue, target => target.el === el)
    if (!target) {
      target = {
        el: el,
        id: ++this.TargetIndex,
        childrenCount: 1,
        listened: true
      }
      this.mode === MODE_TYPE.EVENT && this._initListen(target.el, true)
      this.TargetQueue.push(target)
    } else {
      target.childrenCount++
    }
    return this.TargetIndex
  }

  /*
   * remove listener target or reduce target childrenCount
   * @param  {DOM} el or window
   * @return
   */
  _removeListenerTarget(el: Node | Window) {
    this.TargetQueue.forEach((target: any, index: any) => {
      if (target.el === el) {
        target.childrenCount--
        if (!target.childrenCount) {
          this._initListen(target.el, false)
          this.TargetQueue.splice(index, 1)
          target = null
        }
      }
    })
  }

  /*
   * add or remove eventlistener
   * @param  {DOM} el DOM or Window
   * @param  {boolean} start flag
   * @return
   */
  _initListen(el: { addEventListener: (arg0: any, arg1: any, arg2: any) => void } & { removeEventListener: (arg0: any, arg1: any, arg2: boolean) => void }, start: boolean) {
    this.options.ListenEvents.forEach((evt: any) => _[start ? 'on' : 'off'](el, evt, this.lazyLoadHandler))
  }

  _initEvent() {
    this.Event = {
      listeners: {
        loading: [],
        loaded: [],
        error: []
      }
    }

    this.$on = (event: string | number, func: any) => {
      if (!this.Event.listeners[event]) this.Event.listeners[event] = []
      this.Event.listeners[event].push(func)
    }

    this.$once = (event: any, func) => {
      const vm = this
      function on() {
        vm.$off(event, on)
        func.apply(vm, arguments)
      }
      this.$on(event, on)
    }

    this.$off = (event: string | number, func: any) => {
      if (!func) {
        if (!this.Event.listeners[event]) return
        this.Event.listeners[event].length = 0
        return
      }
      remove(this.Event.listeners[event], func)
    }

    this.$emit = (event: string | number, context: any, inCache: any) => {
      if (!this.Event.listeners[event]) return
      this.Event.listeners[event].forEach((func: (arg0: any, arg1: any) => any) => func(context, inCache))
    }
  }
  $off(event: any, on: () => void) {
    throw new Error('Method not implemented.')
  }

  /**
   * find nodes which in viewport and trigger load
   * @return
   */
  _lazyLoadHandler() {
    const freeList: any[] = []
    this.ListenerQueue.forEach((listener: { el: { parentNode: any }; checkInView: () => any; load: () => void }, index: any) => {
      if (!listener.el || !listener.el.parentNode) {
        freeList.push(listener)
      }
      const catIn = listener.checkInView()
      if (!catIn) return
      listener.load()
    })
    freeList.forEach(item => {
      remove(this.ListenerQueue, item)
      item.$destroy()
    })
  }
  /**
  * init IntersectionObserver
  * set mode to observer
  * @return
  */
  _initIntersectionObserver() {
    if (!hasIntersectionObserver) return
    this._observer = new IntersectionObserver(this._observerHandler.bind(this), this.options.observerOptions)
    if (this.ListenerQueue.length) {
      this.ListenerQueue.forEach((listener: { el: any }) => {
        this._observer?.observe(listener.el)
      })
    }
  }

  /**
  * init IntersectionObserver
  * @return
  */
  _observerHandler(entries: any[], observer: any) {
    entries.forEach((entry: { isIntersecting: any; target: any }) => {
      if (entry.isIntersecting) {
        this.ListenerQueue.forEach((listener: { el: any; state: { loaded: any }; load: () => void }) => {
          if (listener.el === entry.target) {
            if (listener.state.loaded) return this._observer?.unobserve(listener.el)
            listener.load()
          }
        })
      }
    })
  }

  /**
  * set element attribute with image'url and state
  * @param  {object} lazyload listener object
  * @param  {string} state will be rendered
  * @param  {bool} inCache  is rendered from cache
  * @return
  */
  _elRenderer(listener: ReactiveListener, state: string, cache: any) {
    if (!listener.el) return
    const { el, bindType } = listener

    let src
    switch (state) {
      case 'loading':
        src = listener.loading
        break
      case 'error':
        src = listener.error
        break
      default:
        src = listener.src
        break
    }

    if (bindType) {
      el.style[bindType] = 'url("' + src + '")'
    } else if (el.getAttribute('src') !== src) {
      el.setAttribute('src', src)
    }

    el.setAttribute('lazy', state)

    this.$emit(state, listener, cache)
    this.options.adapter[state] && this.options.adapter[state](listener, this.options)

    // if (this.options.dispatchEvent) {
    //   const event = new CustomEvent(state, {
    //     detail: listener
    //   })
    //   el.dispatchEvent(event)
    // }
  }

  /**
  * generate loading loaded error image url
  * @param {string} image's src
  * @return {object} image's loading, loaded, error url
  */
  _valueFormatter(value: any) {
    let src = value
    let loading = this.options.loading
    let error = this.options.error

    // value is object
    if (isObject(value)) {
      if (!value.src && !this.options.silent) console.error('Vue Lazyload warning: miss src with ' + value)
      src = value.src
      loading = value.loading || this.options.loading
      error = value.error || this.options.error
    }
    return {
      src,
      loading,
      error
    }
  }
}
