import { Ref } from 'vue';
import { LazyOptions } from './types';
export declare function useLazyload(src: Ref<string>, options?: LazyOptions): Ref<HTMLElement | null>;
