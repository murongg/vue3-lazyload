import { inject, onMounted, onUnmounted, ref, watch } from 'vue'
import type { Ref } from 'vue'
import { mergeLazyOptions } from './config'
import Lazy from './lazy'
import type { LazyOptions } from './types'

export function useLazyload(src: Ref<string>, options?: LazyOptions): Ref<HTMLElement | null> {
  const lazyRef = ref<HTMLElement | null>(null)
  const injectedLazy = inject<Lazy | null>('Lazyload', null)
  const hasLocalOverrides = !!options && Object.keys(options).length > 0
  const lazy = injectedLazy && !hasLocalOverrides
    ? injectedLazy
    : new Lazy(injectedLazy && options ? mergeLazyOptions(injectedLazy.options, options) : options)

  onMounted(() => {
    if (lazyRef.value)
      lazy.mount(lazyRef.value, src.value)
  })

  onUnmounted(() => {
    if (lazyRef.value)
      lazy.unmount(lazyRef.value)
  })

  watch(src, (newVal: string) => {
    if (lazyRef.value)
      lazy.update(lazyRef.value, newVal)
  })

  return lazyRef
}
