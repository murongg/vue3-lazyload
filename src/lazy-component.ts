import { computed, defineComponent, h, inject, onMounted, onUnmounted, ref, watch } from 'vue'
import type { PropType } from 'vue'
import { DEFAULT_OBSERVER_OPTIONS } from './config'
import type Lazy from './lazy'
import { LazyObserver } from './observer'
import type { LazyComponentProps } from './types'
import { hasIntersectionObserver } from './util'

interface LazyComponentObserverValue {
  delay?: number
}

function resolveObserverOptions(lazy: Lazy | null, overrides?: IntersectionObserverInit): IntersectionObserverInit {
  return {
    ...(lazy?.options.observerOptions ?? DEFAULT_OBSERVER_OPTIONS),
    ...overrides,
  }
}

export const LazyComponent = defineComponent({
  name: 'LazyComponent',
  props: {
    delay: Number,
    observerOptions: Object as PropType<IntersectionObserverInit>,
    tag: {
      default: 'div',
      type: String,
    },
  },
  setup(props: LazyComponentProps, { attrs, slots }) {
    const target = ref<HTMLElement | null>(null)
    const isLoaded = ref(false)
    const lazy = inject<Lazy | null>('Lazyload', null)
    let observer: LazyObserver<LazyComponentObserverValue> | undefined

    const resolvedDelay = computed(() => props.delay ?? lazy?.options.delay)
    const resolvedObserverOptions = computed(() => resolveObserverOptions(lazy, props.observerOptions))

    function stopObserving(): void {
      observer?.disconnect()
      observer = undefined
    }

    function reveal(): void {
      if (isLoaded.value)
        return

      isLoaded.value = true
      stopObserving()
    }

    function observeTarget(): void {
      if (isLoaded.value) {
        stopObserving()
        return
      }

      if (!target.value)
        return

      if (!hasIntersectionObserver()) {
        reveal()
        return
      }

      if (!observer) {
        observer = new LazyObserver(resolvedObserverOptions.value, () => {
          reveal()
        }, value => value.delay)
      }

      observer.setOptions(resolvedObserverOptions.value)
      observer.observe(target.value, { delay: resolvedDelay.value })
    }

    onMounted(() => {
      observeTarget()
    })

    watch([resolvedDelay, resolvedObserverOptions], () => {
      observeTarget()
    }, { deep: true })

    onUnmounted(() => {
      stopObserving()
    })

    return () => h(props.tag ?? 'div', {
      ...attrs,
      'ref': target,
      'data-lazy-component': isLoaded.value ? 'loaded' : 'loading',
    }, isLoaded.value ? slots.default?.() : slots.placeholder?.())
  },
})

export default LazyComponent
