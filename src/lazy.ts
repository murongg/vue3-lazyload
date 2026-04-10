import type { DirectiveBinding } from 'vue'
import { applyLoadingState, loadElementSource } from './dom'
import { emitLog } from './logger'
import { LazyObserver } from './observer'
import { hasIntersectionObserver } from './util'
import { mergeLazyOptions, normalizeLazyValue, resolveLazyOptions } from './config'
import type { LazyOptions, Lifecycle, NormalizedLazyValue, ResolvedLazyOptions, ValueFormatterObject } from './types'

export default class Lazy {
  public options: ResolvedLazyOptions

  private readonly observer: LazyObserver

  constructor(options?: LazyOptions) {
    this.options = resolveLazyOptions(options)
    this.observer = new LazyObserver(this.options.observerOptions, (el, value) => {
      this.loadImages(el, value.src, value.error, value.lifecycle)
    }, value => value.delay)
  }

  public config(options: LazyOptions = {}): void {
    this.options = mergeLazyOptions(this.options, options)
    this.observer.setOptions(this.options.observerOptions)
  }

  public mount(el: HTMLElement, binding: string | DirectiveBinding<string | ValueFormatterObject>): void {
    if (!el)
      return

    const value = this._valueFormatter(this._getBindingValue(binding))
    applyLoadingState(el, value)

    if (!hasIntersectionObserver) {
      this.loadImages(el, value.src, value.error, value.lifecycle)
      this._logger('IntersectionObserver is not supported; loading immediately.')
      return
    }

    this.observer.observe(el, value)
  }

  public update(el: HTMLElement, binding: string | DirectiveBinding<string | ValueFormatterObject>): void {
    if (!el)
      return

    const value = this._valueFormatter(this._getBindingValue(binding))
    applyLoadingState(el, value)

    if (!hasIntersectionObserver) {
      this.loadImages(el, value.src, value.error, value.lifecycle)
      return
    }

    this.observer.observe(el, value)
  }

  public unmount(el: HTMLElement): void {
    if (!el)
      return

    this.observer.unobserve(el)
  }

  public loadImages(el: HTMLElement, src: string, error?: string, lifecycle?: Lifecycle): void {
    loadElementSource(el, {
      delay: this.options.delay,
      error: error ?? this.options.error,
      lifecycle: lifecycle ?? this.options.lifecycle,
      loading: this.options.loading,
      src,
    }, (message, ...optionalParams) => {
      this._logger(message, ...optionalParams)
    })
  }

  public _valueFormatter(value: ValueFormatterObject | string): NormalizedLazyValue {
    return normalizeLazyValue(value, this.options)
  }

  public _log(callback: () => void): void {
    if (this.options.log)
      callback()
  }

  private _getBindingValue(binding: string | DirectiveBinding<string | ValueFormatterObject>): string | ValueFormatterObject {
    return typeof binding === 'string' ? binding : binding.value
  }

  private _logger(message?: unknown, ...optionalParams: unknown[]): void {
    emitLog(this.options.log, this.options.logLevel, message, ...optionalParams)
  }
}
