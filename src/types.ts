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

export interface LazyComponentProps {
  delay?: number
  mode?: LazyComponentMode
  observerOptions?: IntersectionObserverInit
  tag?: string
}

export type LazyComponentMode = 'once' | 'visible'

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

export interface ObservedElementState<TValue = NormalizedLazyValue> {
  timeoutId?: ReturnType<typeof setTimeout>
  value: TValue
}

export enum LifecycleEnum {
  LOADING = 'loading',
  LOADED = 'loaded',
  ERROR = 'error',
}

export type Lifecycle = {
  [x in LifecycleEnum]?: (el?: HTMLElement) => void
}
