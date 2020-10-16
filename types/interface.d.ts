export interface AdapterOptions {
    loaded?: Function;
    loading?: Function;
    error?: Function;
}
export interface LazyOptions {
    error?: string;
    loading?: string;
    throttleWait?: number;
    observerOptions?: IntersectionObserverInit;
}
