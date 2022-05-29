export interface LazyOptions {
  error?: string
  loading?: string
  observerOptions?: IntersectionObserverInit
  log?: boolean
  lifecycle?: Lifecycle
  delay?: number
}

export interface ValueFormatterObject {
  src: string
  error?: string
  loading?: string
  lifecycle?: Lifecycle
  delay?: number
}

export enum LifecycleEnum {
  LOADING = 'loading',
  LOADED = 'loaded',
  ERROR = 'error',
}

export type Lifecycle = {
  [x in LifecycleEnum]?: (el?: HTMLElement) => void;
}
