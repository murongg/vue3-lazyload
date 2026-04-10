export const inBrowser = typeof window !== 'undefined' && window !== null

export const hasIntersectionObserver = checkIntersectionObserver()

export function isObject(val: unknown): boolean {
  return typeof val === 'function' || Object.prototype.toString.call(val) === '[object Object]'
}

export function checkIntersectionObserver(): boolean {
  if (
    inBrowser
    && 'IntersectionObserver' in window
    && 'IntersectionObserverEntry' in window
    && 'intersectionRatio' in window.IntersectionObserverEntry.prototype
  ) {
    if (!('isIntersecting' in window.IntersectionObserverEntry.prototype)) {
      Object.defineProperty(window.IntersectionObserverEntry.prototype, 'isIntersecting', {
        get() {
          return this.intersectionRatio > 0
        },
      })
    }

    return true
  }

  return false
}
