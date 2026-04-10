import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
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

function createDemoComponent(delay?: number, mode?: 'once' | 'visible') {
  return defineComponent({
    setup() {
      const loadCount = ref(0)
      const unloadCount = ref(0)
      const visibleChanges = ref<boolean[]>([])

      function handleLoad(): void {
        loadCount.value += 1
      }

      function handleUnload(): void {
        unloadCount.value += 1
      }

      function handleVisibleChange(value: boolean): void {
        visibleChanges.value = [...visibleChanges.value, value]
      }

      return {
        delay,
        handleLoad,
        handleUnload,
        handleVisibleChange,
        loadCount,
        mode,
        unloadCount,
        visibleChanges,
      }
    },
    template: `
      <LazyComponent
        :delay="delay"
        :mode="mode"
        @load="handleLoad"
        @unload="handleUnload"
        @visible-change="handleVisibleChange"
      >
        <template #placeholder>
          <p data-test="placeholder">Waiting to enter the viewport</p>
        </template>

        <section data-test="lazy-content">
          Deferred content is now mounted
        </section>
      </LazyComponent>

      <output data-test="load-count">{{ loadCount }}</output>
      <output data-test="unload-count">{{ unloadCount }}</output>
      <output data-test="visible-history">{{ visibleChanges.join(',') }}</output>
    `,
  })
}

async function loadPlugin() {
  vi.doMock('../src/util', async () => {
    const actual = await vi.importActual<typeof import('../src/util')>('../src/util')
    return {
      ...actual,
      hasIntersectionObserver: () => true,
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
    expect(wrapper.get('[data-test="load-count"]').text()).toBe('1')
    expect(wrapper.get('[data-test="unload-count"]').text()).toBe('0')
    expect(wrapper.get('[data-test="visible-history"]').text()).toBe('true')
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

  it('keeps content mounted after leaving the viewport in once mode', async () => {
    const VueLazyLoad = await loadPlugin()

    const wrapper = mount(createDemoComponent(undefined, 'once'), {
      global: {
        plugins: [[VueLazyLoad, { log: false }]],
      },
    })

    const observer = MockIntersectionObserver.instances[0]
    observer.trigger(wrapper.get('[data-lazy-component]').element, true)
    await nextTick()
    observer.trigger(wrapper.get('[data-lazy-component]').element, false)
    await nextTick()

    expect(wrapper.find('[data-test="lazy-content"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="placeholder"]').exists()).toBe(false)
    expect(wrapper.get('[data-test="load-count"]').text()).toBe('1')
    expect(wrapper.get('[data-test="unload-count"]').text()).toBe('0')
    expect(wrapper.get('[data-test="visible-history"]').text()).toBe('true,false')
  })

  it('unloads content after leaving the viewport in visible mode', async () => {
    const VueLazyLoad = await loadPlugin()

    const wrapper = mount(createDemoComponent(undefined, 'visible'), {
      global: {
        plugins: [[VueLazyLoad, { log: false }]],
      },
    })

    const observer = MockIntersectionObserver.instances[0]
    observer.trigger(wrapper.get('[data-lazy-component]').element, true)
    await nextTick()
    observer.trigger(wrapper.get('[data-lazy-component]').element, false)
    await nextTick()

    expect(wrapper.find('[data-test="lazy-content"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="placeholder"]').exists()).toBe(true)
    expect(wrapper.get('[data-test="load-count"]').text()).toBe('1')
    expect(wrapper.get('[data-test="unload-count"]').text()).toBe('1')
    expect(wrapper.get('[data-test="visible-history"]').text()).toBe('true,false')
  })

  it('remounts visible mode content on re-entry', async () => {
    const VueLazyLoad = await loadPlugin()

    const wrapper = mount(createDemoComponent(undefined, 'visible'), {
      global: {
        plugins: [[VueLazyLoad, { log: false }]],
      },
    })

    const observer = MockIntersectionObserver.instances[0]
    const element = wrapper.get('[data-lazy-component]').element

    observer.trigger(element, true)
    await nextTick()
    observer.trigger(element, false)
    await nextTick()
    observer.trigger(element, true)
    await nextTick()

    expect(wrapper.find('[data-test="lazy-content"]').exists()).toBe(true)
    expect(wrapper.get('[data-test="load-count"]').text()).toBe('2')
    expect(wrapper.get('[data-test="unload-count"]').text()).toBe('1')
    expect(wrapper.get('[data-test="visible-history"]').text()).toBe('true,false,true')
  })

  it('cancels delayed mount when visible mode leaves before the timer completes', async () => {
    vi.useFakeTimers()
    const VueLazyLoad = await loadPlugin()

    const wrapper = mount(createDemoComponent(240, 'visible'), {
      global: {
        plugins: [[VueLazyLoad, { log: false }]],
      },
    })

    const observer = MockIntersectionObserver.instances[0]
    const element = wrapper.get('[data-lazy-component]').element

    observer.trigger(element, true)
    await nextTick()
    vi.advanceTimersByTime(120)
    observer.trigger(element, false)
    await nextTick()
    vi.advanceTimersByTime(200)
    await nextTick()

    expect(wrapper.find('[data-test="lazy-content"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="placeholder"]').exists()).toBe(true)
    expect(wrapper.get('[data-test="load-count"]').text()).toBe('0')
    expect(wrapper.get('[data-test="unload-count"]').text()).toBe('0')
    expect(wrapper.get('[data-test="visible-history"]').text()).toBe('true,false')
  })

  it('renders the placeholder during SSR before client-side reveal', async () => {
    const { createSSRApp, h } = await import('vue')
    const { renderToString } = await import('@vue/server-renderer')
    const { LazyComponent } = await import('../src')

    const app = createSSRApp({
      render() {
        return h(LazyComponent, null, {
          default: () => h('section', { 'data-test': 'lazy-content' }, 'Deferred content is now mounted'),
          placeholder: () => h('p', { 'data-test': 'placeholder' }, 'Waiting to enter the viewport'),
        })
      },
    })

    const html = await renderToString(app)

    expect(html).toContain('data-test="placeholder"')
    expect(html).not.toContain('data-test="lazy-content"')
  })
})
