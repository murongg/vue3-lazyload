export interface LazyOptions {
    error?: string;
    loading?: string;
    observerOptions?: IntersectionObserverInit;
    silent?: boolean;
    lifecycle?: Lifecycle;
}
export interface ValueFormatterObject {
    src: string;
    error?: string;
    loading?: string;
    lifecycle?: Lifecycle;
}
export declare enum LifecycleEnum {
    LOADING = "loading",
    LOADED = "loaded",
    ERROR = "error"
}
export declare type Lifecycle = {
    [x in LifecycleEnum]?: () => void;
};
