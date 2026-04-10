import { computed, defineComponent, h, inject, onMounted, onUnmounted, ref, watch } from 'vue'
import type { PropType } from 'vue'
import { DEFAULT_OBSERVER_OPTIONS } from './config'
import type Lazy from './lazy'
import type { LazyComponentMode, LazyComponentProps } from './types'
import { hasIntersectionObserver } from './util'

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
    mode: {
      default: 'once',
      type: String as PropType<LazyComponentMode>,
    },
    observerOptions: Object as PropType<IntersectionObserverInit>,
    tag: {
      default: 'div',
      type: String,
    },
  },
  emits: ['load', 'unload', 'visible-change'],
  setup(props: LazyComponentProps, { attrs, emit, slots }) {
    const target = ref<HTMLElement | null>(null)
    const isLoaded = ref(false)
    const isVisible = ref(false)
    const lazy = inject<Lazy | null>('Lazyload', null)
    let observer: IntersectionObserver | undefined
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    const resolvedDelay = computed(() => props.delay ?? lazy?.options.delay)
    const resolvedMode = computed(() => props.mode ?? 'once')
    const resolvedObserverOptions = computed(() => resolveObserverOptions(lazy, props.observerOptions))

    function clearPendingLoad(): void {
      if (!timeoutId)
        return

      clearTimeout(timeoutId)
      timeoutId = undefined
    }

    function stopObserving(): void {
      clearPendingLoad()
      observer?.disconnect()
      observer = undefined
    }

    function updateVisible(nextValue: boolean): void {
      if (isVisible.value === nextValue)
        return

      isVisible.value = nextValue
      emit('visible-change', nextValue)
    }

    function mountContent(): void {
      clearPendingLoad()

      if (isLoaded.value)
        return

      isLoaded.value = true
      emit('load')
    }

    function unmountContent(): void {
      clearPendingLoad()

      if (!isLoaded.value)
        return

      isLoaded.value = false
      emit('unload')
    }

    function scheduleLoad(): void {
      clearPendingLoad()

      if (isLoaded.value)
        return

      const delay = resolvedDelay.value
      if (!delay || delay <= 0) {
        mountContent()
        return
      }

      timeoutId = setTimeout(() => {
        timeoutId = undefined
        mountContent()
      }, delay)
    }

    function handleEnter(): void {
      updateVisible(true)

      if (resolvedMode.value === 'once' && isLoaded.value)
        return

      scheduleLoad()
    }

    function handleLeave(): void {
      updateVisible(false)
      clearPendingLoad()

      if (resolvedMode.value === 'visible')
        unmountContent()
    }

    function connectObserver(): void {
      if (!target.value)
        return

      if (!hasIntersectionObserver()) {
        updateVisible(true)
        mountContent()
        return
      }

      observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.target !== target.value)
            continue

          if (entry.isIntersecting)
            handleEnter()
          else
            handleLeave()
        }
      }, resolvedObserverOptions.value)

      observer.observe(target.value)
    }

    function observeTarget(): void {
      if (!target.value)
        return

      stopObserving()
      connectObserver()
    }

    onMounted(() => {
      observeTarget()
    })

    watch([resolvedDelay, resolvedMode, resolvedObserverOptions], () => {
      if (resolvedMode.value === 'visible' && !isVisible.value)
        unmountContent()

      observeTarget()

      if (isVisible.value && !isLoaded.value)
        scheduleLoad()
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
