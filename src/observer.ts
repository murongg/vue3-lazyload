import type { NormalizedLazyValue, ObservedElementState } from './types'

type IntersectHandler = (el: HTMLElement, value: NormalizedLazyValue) => void

export class LazyObserver {
  private observer?: IntersectionObserver
  private readonly observedElements = new Map<HTMLElement, ObservedElementState>()

  constructor(
    private observerOptions: IntersectionObserverInit,
    private readonly onIntersect: IntersectHandler,
  ) {}

  public setOptions(observerOptions: IntersectionObserverInit): void {
    this.observerOptions = observerOptions

    if (!this.observer || this.observedElements.size === 0)
      return

    const observedEntries = Array.from(this.observedElements.entries())
    this.disconnect()

    for (const [el, state] of observedEntries)
      this.observe(el, state.value)
  }

  public observe(el: HTMLElement, value: NormalizedLazyValue): void {
    this.unobserve(el)
    this.observedElements.set(el, { value })
    this.ensureObserver()
    this.observer?.observe(el)
  }

  public unobserve(el: HTMLElement): void {
    const state = this.observedElements.get(el)
    if (state?.timeoutId)
      clearTimeout(state.timeoutId)

    this.observedElements.delete(el)
    this.observer?.unobserve(el)
  }

  public disconnect(): void {
    for (const [el, state] of this.observedElements.entries()) {
      if (state.timeoutId)
        clearTimeout(state.timeoutId)

      this.observer?.unobserve(el)
    }

    this.observedElements.clear()
    this.observer?.disconnect()
    this.observer = undefined
  }

  private readonly handleIntersections = (entries: IntersectionObserverEntry[]): void => {
    for (const entry of entries) {
      const el = entry.target as HTMLElement
      const state = this.observedElements.get(el)

      if (!state)
        continue

      if (entry.isIntersecting) {
        if (state.value.delay && state.value.delay > 0) {
          if (state.timeoutId)
            continue

          state.timeoutId = setTimeout(() => {
            state.timeoutId = undefined
            this.triggerLoad(el)
          }, state.value.delay)

          continue
        }

        this.triggerLoad(el)
        continue
      }

      if (state.timeoutId) {
        clearTimeout(state.timeoutId)
        state.timeoutId = undefined
      }
    }
  }

  private ensureObserver(): void {
    if (this.observer || typeof IntersectionObserver === 'undefined')
      return

    this.observer = new IntersectionObserver(this.handleIntersections, this.observerOptions)
  }

  private triggerLoad(el: HTMLElement): void {
    const state = this.observedElements.get(el)
    if (!state)
      return

    this.unobserve(el)
    this.onIntersect(el, state.value)
  }
}
