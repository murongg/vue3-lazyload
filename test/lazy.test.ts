import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_ERROR, DEFAULT_LOADING } from '../src/constant'
import Lazy from '../src/lazy'
import type { ValueFormatterObject } from '../src/types'

describe('Lazy', () => {
  let lazy: Lazy

  beforeEach(() => {
    lazy = new Lazy()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.resetModules()
    vi.doUnmock('../src/util')
  })

  it('normalizes string values with global defaults', () => {
    expect(lazy._valueFormatter('test')).toStrictEqual({
      delay: undefined,
      error: DEFAULT_ERROR,
      lifecycle: {},
      loading: DEFAULT_LOADING,
      src: 'test',
    })
  })

  it('normalizes object values', () => {
    const options: ValueFormatterObject = {
      delay: 200,
      error: 'test error',
      lifecycle: {},
      loading: 'test loading',
      src: 'test src',
    }

    expect(lazy._valueFormatter(options)).toStrictEqual(options)
  })

  it('preserves falsy overrides instead of falling back to global defaults', () => {
    lazy.config({
      delay: 500,
      error: 'global-error',
      loading: 'global-loading',
    })

    expect(lazy._valueFormatter({
      delay: 0,
      error: '',
      lifecycle: {},
      loading: '',
      src: 'test src',
    })).toStrictEqual({
      delay: 0,
      error: '',
      lifecycle: {},
      loading: '',
      src: 'test src',
    })
  })

  it('does not invoke log callbacks when logging is disabled', () => {
    const callback = vi.fn()

    lazy.config({ log: false })
    lazy._log(callback)

    expect(callback).not.toHaveBeenCalled()
  })

  it('uses console.log for the log logLevel', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    lazy.config({ logLevel: 'log' })
    ;(lazy as any)._logger('hello')

    expect(logSpy).toHaveBeenCalledWith('hello')
    expect(errorSpy).not.toHaveBeenCalled()
  })

  it('loads immediately without IntersectionObserver support', async () => {
    const originalIntersectionObserver = globalThis.IntersectionObserver

    vi.doMock('../src/util', async () => {
      const actual = await vi.importActual<typeof import('../src/util')>('../src/util')
      return {
        ...actual,
        hasIntersectionObserver: false,
      }
    })

    delete (globalThis as { IntersectionObserver?: typeof IntersectionObserver }).IntersectionObserver

    const { default: LazyWithoutObserver } = await import('../src/lazy')
    const img = document.createElement('img')
    const noObserverLazy = new LazyWithoutObserver({ log: false })

    expect(() => noObserverLazy.mount(img, 'test-src')).not.toThrow()
    expect(img.getAttribute('src')).toBe('test-src')

    globalThis.IntersectionObserver = originalIntersectionObserver
  })

  it('skips reloading when update receives the same normalized value', () => {
    const img = document.createElement('img')
    const loadingSpy = vi.spyOn(img, 'setAttribute')
    const loadSpy = vi.spyOn(lazy, 'loadImages')
    const lifecycle = {}

    lazy.mount(img, {
      value: {
        delay: 120,
        error: 'error-src',
        lifecycle,
        loading: 'loading-src',
        src: 'same-src',
      },
    } as any)
    loadingSpy.mockClear()
    loadSpy.mockClear()

    lazy.update(img, {
      oldValue: {
        delay: 120,
        error: 'error-src',
        lifecycle,
        loading: 'loading-src',
        src: 'same-src',
      },
      value: {
        delay: 120,
        error: 'error-src',
        lifecycle,
        loading: 'loading-src',
        src: 'same-src',
      },
    } as any)

    expect(loadSpy).not.toHaveBeenCalled()
    expect(loadingSpy).not.toHaveBeenCalledWith('lazy', 'loading')
  })

  it('reloads when the normalized value changes', () => {
    const img = document.createElement('img')
    const loadSpy = vi.spyOn(lazy, 'loadImages')

    lazy.mount(img, {
      value: {
        loading: 'loading-src',
        src: 'initial-src',
      },
    } as any)
    loadSpy.mockClear()

    lazy.update(img, {
      oldValue: {
        loading: 'loading-src',
        src: 'initial-src',
      },
      value: {
        loading: 'loading-src',
        src: 'next-src',
      },
    } as any)

    expect(loadSpy).toHaveBeenCalledTimes(1)
    expect(img.getAttribute('lazy')).toBe('loading')
  })
})
