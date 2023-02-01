import type { DirectiveBinding } from 'vue-demi'
import type { LazyOptions, Lifecycle, ValueFormatterObject } from './types'
import { LifecycleEnum } from './types'
import { assign, hasIntersectionObserver, isObject } from './util'
import { DEFAULT_ERROR, DEFAULT_LOADING } from './constant'

const DEFAULT_OBSERVER_OPTIONS = {
  rootMargin: '0px',
  threshold: 0,
}

const TIMEOUT_ID_DATA_ATTR = 'data-lazy-timeout-id'

/**
 * Lazyload
 *
 * @export
 * @class Lazy
 */
export default class Lazy {
  public options: LazyOptions = {
    loading: DEFAULT_LOADING,
    error: DEFAULT_ERROR,
    observerOptions: DEFAULT_OBSERVER_OPTIONS,
    log: true,
    lifecycle: {},
  }

  private _images: WeakMap<HTMLElement, IntersectionObserver> = new WeakMap()

  constructor(options?: LazyOptions) {
    this.config(options)
  }

  /**
   * merge config
   *
   * @param {*} [options={}]
   * @memberof Lazy
   */
  public config(options = {}): void {
    assign(this.options, options)
  }

  /**
   * mount
   *
   * @param {HTMLElement} el
   * @param {DirectiveBinding<string>} binding
   * @memberof Lazy
   */
  public mount(el: HTMLElement, binding: string | DirectiveBinding<string | ValueFormatterObject>): void {
    if (!el)
      return
    const { src, loading, error, lifecycle, delay } = this._valueFormatter(typeof binding === 'string' ? binding : binding.value)
    this._lifecycle(LifecycleEnum.LOADING, lifecycle, el)
    el.setAttribute('src', loading || DEFAULT_LOADING)
    this._tryInitIntersectionObserver(el, src, loading, error, lifecycle, delay)
  }

  /**
   * update
   *
   * @param {HTMLElement} el
   * @memberof Lazy
   */
  public update(el: HTMLElement, binding: string | DirectiveBinding<string | ValueFormatterObject>): void {
    if (!el)
      return
    this._realObserver(el)?.unobserve(el)
    const { src, loading, error, lifecycle, delay } = this._valueFormatter(typeof binding === 'string' ? binding : binding.value)
    this._tryInitIntersectionObserver(el, src, loading, error, lifecycle, delay)
  }

  /**
   * unmount
   *
   * @param {HTMLElement} el
   * @memberof Lazy
   */
  public unmount(el: HTMLElement): void {
    if (!el)
      return
    this._realObserver(el)?.unobserve(el)
    this._images.delete(el)
  }

  private _tryLoadImage(el: HTMLElement, src: string, onSuccess: ((this: GlobalEventHandlers, ev: Event) => any) | null, onError: OnErrorEventHandler) {
    const img = new Image()
    img.src = src

    const _onSuccess = el
      ? (...p) => {
          this._setImageSrc(el, src)
          if (onSuccess)
            // eslint-disable-next-line prefer-spread
            onSuccess.apply(undefined, p)
        }
      : onSuccess

    this._listenImageStatus(img, _onSuccess, onError)

    return img
  }

  /**
   * update image with full lifecycles
   *
   * @param {HTMLElement} el
   * @param {string} src
   * @memberof Lazy
   */
  public loadImage(el: HTMLElement, src: string, loading?: string, error?: string, lifecycle?: Lifecycle): void {
    const onSuccess = () => {
      this._lifecycle(LifecycleEnum.LOADED, lifecycle, el)
    }

    const onError = () => {
      this._listenImageStatus(el, null, null)
      this._realObserver(el)?.unobserve(el)

      this._lifecycle(LifecycleEnum.ERROR, lifecycle, el)
      if (error || DEFAULT_ERROR)
        this._setImageSrc(el, error || DEFAULT_ERROR)

      this._log(() => {
        throw new Error(`Image failed to load! And failed src was: ${src} `)
      })
    }

    // loading state
    this._lifecycle(LifecycleEnum.LOADING, lifecycle, el)
    this._setImageSrc(el, loading || DEFAULT_LOADING)

    this._tryLoadImage(el, src, onSuccess, onError)
  }

  /**
   * set img src
   *
   * @private
   * @param {HTMLElement} el
   * @param {string} src
   * @memberof Lazy
   */
  private _setImageSrc(el: HTMLElement, src: string): void {
    if (el.tagName.toLowerCase() === 'img')
      el.setAttribute('src', src)
    else
      el.style.backgroundImage = `url('${src}')`
  }

  private _tryInitIntersectionObserver(el: HTMLElement, src: string, loading?: string, error?: string, lifecycle?: Lifecycle, delay?: number): void {
    if (!hasIntersectionObserver) {
      this.loadImage(el, src, loading, error, lifecycle)
      this._log(() => {
        throw new Error('Not support IntersectionObserver!')
      })
    }
    this._initIntersectionObserver(el, src, loading, error, lifecycle, delay)
  }

  /**
   * init IntersectionObserver
   *
   * @private
   * @param {HTMLElement} el
   * @param {string} src
   * @memberof Lazy
   */
  private _initIntersectionObserver(el: HTMLElement, src: string, loading?: string, error?: string, lifecycle?: Lifecycle, delay?: number): void {
    const observerOptions = this.options.observerOptions
    this._images.set(el, new IntersectionObserver((entries) => {
      Array.prototype.forEach.call(entries, (entry) => {
        if (delay && delay > 0)
          this._delayedIntersectionCallback(el, entry, delay, src, loading, error, lifecycle)
        else
          this._intersectionCallback(el, entry, src, loading, error, lifecycle)
      })
    }, observerOptions))
    this._realObserver(el)?.observe(el)
  }

  private _intersectionCallback(el: HTMLElement, entry: IntersectionObserverEntry, src: string, loading?: string, error?: string, lifecycle?: Lifecycle): void {
    if (entry.isIntersecting) {
      this._realObserver(el)?.unobserve(entry.target)
      this.loadImage(el, src, loading, error, lifecycle)
    }
  }

  private _delayedIntersectionCallback(el: HTMLElement, entry: IntersectionObserverEntry, delay: number, src: string, loading?: string, error?: string, lifecycle?: Lifecycle): void {
    if (entry.isIntersecting) {
      if (entry.target.hasAttribute(TIMEOUT_ID_DATA_ATTR))
        return

      const timeoutId = setTimeout(() => {
        this._intersectionCallback(el, entry, src, loading, error, lifecycle)
        entry.target.removeAttribute(TIMEOUT_ID_DATA_ATTR)
      }, delay)
      entry.target.setAttribute(TIMEOUT_ID_DATA_ATTR, String(timeoutId))
    }
    else {
      if (entry.target.hasAttribute(TIMEOUT_ID_DATA_ATTR)) {
        clearTimeout(Number(entry.target.getAttribute(TIMEOUT_ID_DATA_ATTR)))
        entry.target.removeAttribute(TIMEOUT_ID_DATA_ATTR)
      }
    }
  }

  /**
   * only listen to image status
   *
   * @private
   * @param {string} src
   * @param {(string | null)} cors
   * @param {() => void} success
   * @param {() => void} error
   * @memberof Lazy
   */
  private _listenImageStatus(image: HTMLImageElement | HTMLElement, success: ((this: GlobalEventHandlers, ev: Event) => any) | null, error: OnErrorEventHandler) {
    image.onload = success
    image.onerror = error
  }

  /**
   * to do it differently for object and string
   *
   * @public
   * @param {(ValueFormatterObject | string)} value
   * @returns {*}
   * @memberof Lazy
   */
  public _valueFormatter(value: ValueFormatterObject | string): ValueFormatterObject {
    let src = value as string
    let loading = this.options.loading
    let error = this.options.error
    let lifecycle = this.options.lifecycle
    let delay = this.options.delay
    if (isObject(value)) {
      src = (value as ValueFormatterObject).src
      loading = (value as ValueFormatterObject).loading || this.options.loading
      error = (value as ValueFormatterObject).error || this.options.error
      lifecycle = ((value as ValueFormatterObject).lifecycle || this.options.lifecycle)
      delay = ((value as ValueFormatterObject).delay || this.options.delay)
    }
    return {
      src,
      loading,
      error,
      lifecycle,
      delay,
    }
  }

  /**
   * log
   *
   * @param {() => void} callback
   * @memberof Lazy
   */
  public _log(callback: () => void): void {
    if (this.options.log)
      callback()
  }

  /**
   * lifecycle easy
   *
   * @private
   * @param {LifecycleEnum} life
   * @param {Lifecycle} [lifecycle]
   * @memberof Lazy
   */
  private _lifecycle(life: LifecycleEnum, lifecycle?: Lifecycle, el?: HTMLElement): void {
    switch (life) {
      case LifecycleEnum.LOADING:
        el?.setAttribute('lazy', LifecycleEnum.LOADING)
        if (lifecycle?.loading)
          lifecycle.loading(el)

        break
      case LifecycleEnum.LOADED:
        el?.setAttribute('lazy', LifecycleEnum.LOADED)
        if (lifecycle?.loaded)
          lifecycle.loaded(el)

        break
      case LifecycleEnum.ERROR:
        el?.setAttribute('lazy', LifecycleEnum.ERROR)
        if (lifecycle?.error)
          lifecycle.error(el)

        break
      default:
        break
    }
  }

  private _realObserver(el: HTMLElement): IntersectionObserver | undefined {
    return this._images.get(el)
  }
}
