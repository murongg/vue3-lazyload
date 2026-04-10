import { DEFAULT_ERROR, DEFAULT_LOADING } from './constant'
import type { LazyOptions, NormalizedLazyValue, ResolvedLazyOptions, ValueFormatterObject } from './types'
import { isObject } from './util'

export const DEFAULT_OBSERVER_OPTIONS: IntersectionObserverInit = {
  rootMargin: '0px',
  threshold: 0,
}

export const DEFAULT_OPTIONS: ResolvedLazyOptions = {
  delay: undefined,
  error: DEFAULT_ERROR,
  lifecycle: {},
  loading: DEFAULT_LOADING,
  log: true,
  logLevel: 'error',
  observerOptions: DEFAULT_OBSERVER_OPTIONS,
}

export function mergeLazyOptions(current: ResolvedLazyOptions, overrides: LazyOptions = {}): ResolvedLazyOptions {
  return {
    ...current,
    ...overrides,
    lifecycle: overrides.lifecycle ?? current.lifecycle,
    observerOptions: {
      ...current.observerOptions,
      ...overrides.observerOptions,
    },
  }
}

export function resolveLazyOptions(options?: LazyOptions): ResolvedLazyOptions {
  return mergeLazyOptions(DEFAULT_OPTIONS, options)
}

export function normalizeLazyValue(value: ValueFormatterObject | string, options: ResolvedLazyOptions): NormalizedLazyValue {
  if (isObject(value)) {
    const formattedValue = value as ValueFormatterObject

    return {
      delay: formattedValue.delay ?? options.delay,
      error: formattedValue.error ?? options.error,
      lifecycle: formattedValue.lifecycle ?? options.lifecycle,
      loading: formattedValue.loading ?? options.loading,
      src: formattedValue.src,
    }
  }

  return {
    delay: options.delay,
    error: options.error,
    lifecycle: options.lifecycle,
    loading: options.loading,
    src: value as string,
  }
}
