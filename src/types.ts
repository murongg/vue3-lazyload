export interface LazyOptions {
  error?: string;
  loading?: string;
  observerOptions?: IntersectionObserverInit;
  silent?: boolean;
  lifecycle?: Lifecycle;
}

export interface ValueFormatterObject {
  src: string,
  error?: string,
  loading?: string,
  lifecycle?: Lifecycle;
}

export enum LifecycleEnum {
  LOADING = 'loading',
  LOADED = 'loaded',
  ERROR = 'error'
}

export type Lifecycle = {
  [x in LifecycleEnum]?: () => void;
};