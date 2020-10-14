import { DEFAULT_EVENTS } from './enums'

export interface AdapterOptions {
  loaded?: Function,
  loading?: Function,
  error?: Function
}

export interface LazyOptions {
  [x: string]: any;
  preLoad: number;
  error?: string;
  loading?: string;
  attempt?: number;
  listenEvents?: string[];
  adapter?: any;
  filter?: any;
  dispatchEvent?: boolean;
  throttleWait?: number;
  observer?: boolean;
  observerOptions?: IntersectionObserverInit;
  silent?: boolean;
  preLoadTop?: number;
  scale?: number;
  hasbind?: boolean;
  supportWebp?: boolean
}

export interface Options extends LazyOptions {
  lazyComponent?: boolean;
}

export interface ImageCacheOptions {
  max: number
}