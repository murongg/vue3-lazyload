import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = []

  public readonly elements = new Set<Element>()

  constructor(
    private readonly callback: IntersectionObserverCallback,
    public readonly options?: IntersectionObserverInit,
  ) {
    MockIntersectionObserver.instances.push(this)
  }

  observe = (element: Element): void => {
    this.elements.add(element)
  }

  unobserve = (element: Element): void => {
    this.elements.delete(element)
  }

  disconnect = (): void => {
    this.elements.clear()
  }

  takeRecords = (): IntersectionObserverEntry[] => {
    return []
  }

  trigger(element: Element, isIntersecting = true): void {
    this.callback([
      {
        boundingClientRect: element.getBoundingClientRect(),
        intersectionRatio: isIntersecting ? 1 : 0,
        intersectionRect: element.getBoundingClientRect(),
        isIntersecting,
        rootBounds: null,
        target: element,
        time: Date.now(),
      } as IntersectionObserverEntry,
    ], this as unknown as IntersectionObserver)
  }

  static reset(): void {
    MockIntersectionObserver.instances = []
  }
}

class MockIntersectionObserverEntry {
  intersectionRatio = 1
}

function createDemoComponent(delay?: number) {
  return defineComponent({
    setup() {
      return { delay }
    },
    template: `
      <LazyComponent :delay="delay">
        <template #placeholder>
          <p data-test="placeholder">Waiting to enter the viewport</p>
        </template>

        <section data-test="lazy-content">
          Deferred content is now mounted
        </section>
      </LazyComponent>
    `,
  })
}

async function loadPlugin() {
  vi.doMock('../src/util', async () => {
    const actual = await vi.importActual<typeof import('../src/util')>('../src/util')
    return {
      ...actual,
      hasIntersectionObserver: true,
    }
  })

  const module = await import('../src')
  return module.default
}

describe('LazyComponent', () => {
  beforeEach(() => {
    vi.resetModules()
    MockIntersectionObserver.reset()
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
    vi.stubGlobal('IntersectionObserverEntry', MockIntersectionObserverEntry)
  })

  afterEach(() => {
    vi.doUnmock('../src/util')
    vi.unstubAllGlobals()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('renders placeholder content before the wrapper intersects', async () => {
    const VueLazyLoad = await loadPlugin()

    const wrapper = mount(createDemoComponent(), {
      global: {
        plugins: [[VueLazyLoad, { log: false }]],
      },
    })

    expect(wrapper.find('[data-test="placeholder"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="lazy-content"]').exists()).toBe(false)
    expect(wrapper.get('[data-lazy-component]').attributes('data-lazy-component')).toBe('loading')
    expect(MockIntersectionObserver.instances).toHaveLength(1)
  })

  it('mounts the default slot after intersection', async () => {
    const VueLazyLoad = await loadPlugin()

    const wrapper = mount(createDemoComponent(), {
      global: {
        plugins: [[VueLazyLoad, { log: false }]],
      },
    })

    const observer = MockIntersectionObserver.instances[0]
    observer.trigger(wrapper.get('[data-lazy-component]').element)
    await nextTick()

    expect(wrapper.find('[data-test="placeholder"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="lazy-content"]').exists()).toBe(true)
    expect(wrapper.get('[data-lazy-component]').attributes('data-lazy-component')).toBe('loaded')
  })

  it('respects delay before mounting the default slot', async () => {
    vi.useFakeTimers()
    const VueLazyLoad = await loadPlugin()

    const wrapper = mount(createDemoComponent(240), {
      global: {
        plugins: [[VueLazyLoad, { log: false }]],
      },
    })

    const observer = MockIntersectionObserver.instances[0]
    observer.trigger(wrapper.get('[data-lazy-component]').element)
    await nextTick()

    expect(wrapper.find('[data-test="lazy-content"]').exists()).toBe(false)

    vi.advanceTimersByTime(239)
    await nextTick()
    expect(wrapper.find('[data-test="lazy-content"]').exists()).toBe(false)

    vi.advanceTimersByTime(1)
    await nextTick()
    expect(wrapper.find('[data-test="lazy-content"]').exists()).toBe(true)
  })
})
