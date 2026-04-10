export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'log'

export interface LazyOptions {
  delay?: number
  error?: string
  lifecycle?: Lifecycle
  loading?: string
  log?: boolean
  logLevel?: LogLevel
  observerOptions?: IntersectionObserverInit
}

export interface ValueFormatterObject {
  delay?: number
  error?: string
  lifecycle?: Lifecycle
  loading?: string
  src: string
}

export interface NormalizedLazyValue {
  delay?: number
  error: string
  lifecycle: Lifecycle
  loading: string
  src: string
}

export interface ResolvedLazyOptions extends Omit<LazyOptions, 'error' | 'lifecycle' | 'loading' | 'log' | 'logLevel' | 'observerOptions'> {
  error: string
  lifecycle: Lifecycle
  loading: string
  log: boolean
  logLevel: LogLevel
  observerOptions: IntersectionObserverInit
}

export interface ObservedElementState {
  timeoutId?: ReturnType<typeof setTimeout>
  value: NormalizedLazyValue
}

export enum LifecycleEnum {
  LOADING = 'loading',
  LOADED = 'loaded',
  ERROR = 'error',
}

export type Lifecycle = {
  [x in LifecycleEnum]?: (el?: HTMLElement) => void
}
