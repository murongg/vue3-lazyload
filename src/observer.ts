import type { NormalizedLazyValue, ObservedElementState } from './types'

type DelayResolver<TValue> = (value: TValue) => number | undefined
type IntersectHandler<TValue> = (el: HTMLElement, value: TValue) => void

export class LazyObserver<TValue = NormalizedLazyValue> {
  private observer?: IntersectionObserver
  private readonly observedElements = new Map<HTMLElement, ObservedElementState<TValue>>()

  constructor(
    private observerOptions: IntersectionObserverInit,
    private readonly onIntersect: IntersectHandler<TValue>,
    private readonly resolveDelay: DelayResolver<TValue> = () => undefined,
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

  public observe(el: HTMLElement, value: TValue): void {
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
        const delay = this.resolveDelay(state.value)

        if (delay && delay > 0) {
          if (state.timeoutId)
            continue

          state.timeoutId = setTimeout(() => {
            state.timeoutId = undefined
            this.triggerLoad(el)
          }, delay)

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
