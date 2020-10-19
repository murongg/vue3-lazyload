import { LazyOptions } from './interface'
import { hasIntersectionObserver, assign } from './util'
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
    observerOptions: DEFAULT_OBSERVER_OPTIONS
  };
  private _image!: HTMLElement;
  private _observer!: IntersectionObserver;

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
  public mount(el: HTMLElement, binding: DirectiveBinding<string>): void {
    this._image = el
    this._image.setAttribute('src', this.options.loading || DEFAULT_LOADING)
    if (!hasIntersectionObserver) {
      this.loadImages(el, binding.value)
      throw new Error('not support IntersectionObserver')
    }
    this._initIntersectionObserver(el, binding.value)
  }

  /**
   * update
   *
   * @param {HTMLElement} el
   * @memberof Lazy
   */
  public update(el: HTMLElement): void {
    this._observer.unobserve(el)
    this._observer.observe(el)
  }

  /**
   * unmount
   *
   * @param {HTMLElement} el
   * @memberof Lazy
   */
  public unmount(el: HTMLElement): void {
    this._observer.unobserve(el)
  }

  /**
   * force loading
   *
   * @param {HTMLElement} el
   * @param {string} src
   * @memberof Lazy
   */
  public loadImages(el: HTMLElement, src: string): void {
    this._setImageSrc(el, src)
  }

  /**
   * set img tag src
   *
   * @private
   * @param {HTMLElement} el
   * @param {string} src
   * @memberof Lazy
   */
  private _setImageSrc(el: HTMLElement, src: string): void {
    const srcset = el.getAttribute('srcset')
    if ('img' === el.tagName.toLowerCase()) {
      if (src) {
        el.setAttribute('src', src)
      }
      if (srcset) {
        el.setAttribute('srcset', srcset)
      }
      this._listenImageStatus(el as HTMLImageElement, () => {
        console.log('success');
      }, () => {
        console.error('error');
        el.setAttribute('src', this.options.error || DEFAULT_ERROR)
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
  private _initIntersectionObserver(el: HTMLElement, src: string): void {
    const observerOptions = this.options.observerOptions
    this._observer = new IntersectionObserver((entries) => {
      Array.prototype.forEach.call(entries, (entry) => {
        if (entry.isIntersecting) {
          this._observer.unobserve(entry.target)
          this._setImageSrc(el, src)
        }
      })
    }, observerOptions)
    this._observer.observe(this._image)
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
  private _listenImageStatus(image: HTMLImageElement, success: () => void, error: () => void) {
    image.onload = () => {
      success()
    }
    image.onerror = () => {
      error()
    }    
  }
}