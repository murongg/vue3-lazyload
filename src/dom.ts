import { LifecycleEnum } from './types'
import type { Lifecycle, NormalizedLazyValue } from './types'

type LogHandler = (message?: unknown, ...optionalParams: unknown[]) => void

function isImageElement(el: HTMLElement): el is HTMLImageElement {
  return el.tagName.toLowerCase() === 'img'
}

function setElementSource(el: HTMLElement, src: string): void {
  if (isImageElement(el)) {
    if (el.getAttribute('src') !== src)
      el.setAttribute('src', src)

    return
  }

  el.style.backgroundImage = src ? `url('${src}')` : ''
}

export function applyLifecycleState(life: LifecycleEnum, lifecycle: Lifecycle, el?: HTMLElement): void {
  el?.setAttribute('lazy', life)
  lifecycle[life]?.(el)
}

export function applyLoadingState(el: HTMLElement, value: NormalizedLazyValue): void {
  applyLifecycleState(LifecycleEnum.LOADING, value.lifecycle, el)
  setElementSource(el, value.loading)
}

export function applyLoadedState(el: HTMLElement, lifecycle: Lifecycle): void {
  applyLifecycleState(LifecycleEnum.LOADED, lifecycle, el)
}

export function applyErrorState(el: HTMLElement, value: NormalizedLazyValue, logger: LogHandler): void {
  applyLifecycleState(LifecycleEnum.ERROR, value.lifecycle, el)

  if (value.error)
    setElementSource(el, value.error)

  logger(`Image failed to load. Source: ${value.src}`)
}

export function loadElementSource(el: HTMLElement, value: NormalizedLazyValue, logger: LogHandler): void {
  if (!isImageElement(el)) {
    setElementSource(el, value.src)
    return
  }

  el.onload = () => {
    applyLoadedState(el, value.lifecycle)
  }

  el.onerror = () => {
    el.onload = null
    applyErrorState(el, value, logger)
  }

  setElementSource(el, value.src)
}
