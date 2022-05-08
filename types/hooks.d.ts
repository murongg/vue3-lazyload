import type { Ref } from 'vue'
import type { LazyOptions } from './types'
export declare function useLazyload(src: Ref<string>, options?: LazyOptions): Ref<HTMLElement | null>
