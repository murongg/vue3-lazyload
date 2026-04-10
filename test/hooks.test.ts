import type { App } from 'vue'
import { createApp, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import LazyLoad, { useLazyload } from '../src'
import Lazy from '../src/lazy'

describe('useLazyload', () => {
  let app: App

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('reuses the injected lazy instance when local options are not provided', () => {
    const component = {
      template: '<img ref="lazyRef" alt="shared hook demo">',
      setup() {
        const lazyRef = useLazyload(ref('shared-src'))
        return { lazyRef }
      },
    }

    app = createApp(component)
    app.use(LazyLoad, { loading: 'global-loading' })

    const injectedLazy = app.config.globalProperties.$Lazyload as Lazy
    const mountSpy = vi.spyOn(injectedLazy, 'mount')

    const root = document.createElement('div')
    app.mount(root)

    expect(mountSpy).toHaveBeenCalledTimes(1)
  })

  it('applies hook-local options without mutating the injected instance', () => {
    const mountCalls: string[] = []
    const originalMount = Lazy.prototype.mount

    vi.spyOn(Lazy.prototype, 'mount').mockImplementation(function (this: Lazy, el, binding) {
      mountCalls.push(this.options.loading)
      return originalMount.call(this, el, binding)
    })

    const component = {
      template: '<img ref="lazyRef" alt="local override hook demo">',
      setup() {
        const lazyRef = useLazyload(ref('local-src'), {
          loading: 'local-loading',
        })
        return { lazyRef }
      },
    }

    app = createApp(component)
    app.use(LazyLoad, { loading: 'global-loading' })

    const injectedLazy = app.config.globalProperties.$Lazyload as Lazy
    const root = document.createElement('div')
    app.mount(root)

    expect(mountCalls).toContain('local-loading')
    expect(injectedLazy.options.loading).toBe('global-loading')
  })
})
