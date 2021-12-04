/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-empty-function */
import { LazyOptions, Lifecycle, LifecycleEnum, ValueFormatterObject } from './types'
import { hasIntersectionObserver, assign, isObject } from './util'
import { DirectiveBinding } from 'vue'

const DEFAULT_OBSERVER_OPTIONS = {
  rootMargin: '0px',
  threshold: 0
}

const DEFAULT_LOADING = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
const DEFAULT_ERROR = ''
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
    lifecycle: {}
  };
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
  public mount(el: HTMLElement, binding: DirectiveBinding<string | ValueFormatterObject>): void {
    const { src, loading, error, lifecycle } = this._valueFormatter(binding.value)
    this._lifecycle(LifecycleEnum.LOADING, lifecycle, el)
    el.setAttribute('src', loading || DEFAULT_LOADING)
    if (!hasIntersectionObserver) {
      this.loadImages(el, src, error, lifecycle)
      this._log(() => {
        throw new Error('Not support IntersectionObserver!')
      })
    }
    this._initIntersectionObserver(el, src, error, lifecycle)
  }

  /**
   * update
   *
   * @param {HTMLElement} el
   * @memberof Lazy
   */
  public update(el: HTMLElement, binding: DirectiveBinding<string | ValueFormatterObject>): void {
    this._realObserver(el)?.unobserve(el)
    const { src, error, lifecycle } = this._valueFormatter(binding.value)
    this._initIntersectionObserver(el, src, error, lifecycle)
  }

  /**
   * unmount
   *
   * @param {HTMLElement} el
   * @memberof Lazy
   */
  public unmount(el: HTMLElement): void {
    this._realObserver(el)?.unobserve(el)
    this._images.delete(el)
  }

  /**
   * force loading
   *
   * @param {HTMLElement} el
   * @param {string} src
   * @memberof Lazy
   */
  public loadImages(el: HTMLElement, src: string, error?: string, lifecycle?: Lifecycle): void {
    this._setImageSrc(el, src, error, lifecycle)
  }

  /**
   * set img tag src
   *
   * @private
   * @param {HTMLElement} el
   * @param {string} src
   * @memberof Lazy
   */
  private _setImageSrc(el: HTMLElement, src: string, error?: string, lifecycle?: Lifecycle): void {
    if ('img' === el.tagName.toLowerCase()) {
      if (src) {
        const preSrc = el.getAttribute('src')
        if (preSrc !== src) {
          el.setAttribute('src', src)
        }
      }
      this._listenImageStatus(el as HTMLImageElement, () => {
        this._lifecycle(LifecycleEnum.LOADED, lifecycle, el)
      }, () => {
        // Fix onload trigger twice, clear onload event
        // Reload on update
        el.onload = null
        this._lifecycle(LifecycleEnum.ERROR, lifecycle, el)
        this._realObserver(el)?.disconnect()
        if (error) el.setAttribute('src', error)
        this._log(() => { throw new Error('Image failed to load!') })
      })
    } else {
      el.style.backgroundImage = 'url(\'' + src + '\')'
    }
  }

  /**
   * init IntersectionObserver
   *
   * @private
   * @param {HTMLElement} el
   * @param {string} src
   * @memberof Lazy
   */
  private _initIntersectionObserver(el: HTMLElement, src: string, error?: string, lifecycle?: Lifecycle): void {
    const observerOptions = this.options.observerOptions
    this._images.set(el, new IntersectionObserver((entries) => {
      Array.prototype.forEach.call(entries, (entry) => {
        if (entry.isIntersecting) {
          this._realObserver(el)?.unobserve(entry.target)
          this._setImageSrc(el, src, error, lifecycle)
        }
      })
    }, observerOptions))
    this._realObserver(el)?.observe(el)
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
  private _listenImageStatus(image: HTMLImageElement, success: ((this: GlobalEventHandlers, ev: Event) => any) | null, error: OnErrorEventHandler) {
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
    if (isObject(value)) {
      src = (value as ValueFormatterObject).src
      loading = (value as ValueFormatterObject).loading || this.options.loading
      error = (value as ValueFormatterObject).error || this.options.error
      lifecycle = ((value as ValueFormatterObject).lifecycle || this.options.lifecycle)
    }
    return {
      src,
      loading,
      error,
      lifecycle
    }
  }

  /**
   * log
   *
   * @param {() => void} callback
   * @memberof Lazy
   */
  public _log(callback: () => void): void {
    if (this.options.log) {
      callback()
    }
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
      if (lifecycle?.loading) {
        lifecycle.loading(el)
      }
      break
    case LifecycleEnum.LOADED:
      el?.setAttribute('lazy', LifecycleEnum.LOADED)
      if (lifecycle?.loaded) {
        lifecycle.loaded(el)
      }
      break
    case LifecycleEnum.ERROR:
      el?.setAttribute('lazy', LifecycleEnum.ERROR)
      if (lifecycle?.error) {
        lifecycle.error(el)
      }
      break
    default:
      break
    }
  }

  private _realObserver(el: HTMLElement): IntersectionObserver | undefined {
    return this._images.get(el)
  }
}