
const inBrowser = typeof window !== 'undefined' && window !== null

export const hasIntersectionObserver = checkIntersectionObserver()

function checkIntersectionObserver() {
  if (inBrowser &&
    'IntersectionObserver' in window &&
    'IntersectionObserverEntry' in window &&
    'intersectionRatio' in window.IntersectionObserverEntry.prototype) {
    // Minimal polyfill for Edge 15's lack of `isIntersecting`
    // See: https://github.com/w3c/IntersectionObserver/issues/211
    if (!('isIntersecting' in window.IntersectionObserverEntry.prototype)) {
      Object.defineProperty(window.IntersectionObserverEntry.prototype,
        'isIntersecting', {
        get: function () {
          return this.intersectionRatio > 0
        }
      })
    }
    return true
  }
  return false
}



// CustomEvent polyfill
// function CustomEvent () {
//   if (!inBrowser) return
//   if (typeof window.CustomEvent === 'function') return window.CustomEvent

// }
const CustomEvent = (function () {
  if (!inBrowser) return
  if (typeof window.CustomEvent === 'function') return window.CustomEvent
  function CustomEvent (event: string, params: { bubbles: any; cancelable: any; detail: any }) {
    params = params || { bubbles: false, cancelable: false, detail: undefined }
    var evt = document.createEvent('CustomEvent')
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail)
    return evt
  }
  CustomEvent.prototype = window.Event.prototype
  return CustomEvent
})()


function remove(arr: any[], item: any) {
  if (!arr.length) return
  const index = arr.indexOf(item)
  if (index > -1) return arr.splice(index, 1)
}

function some(arr: string | any[], fn: (arg0: any) => any) {
  let has = false
  for (let i = 0, len = arr.length; i < len; i++) {
    if (fn(arr[i])) {
      has = true
      break
    }
  }
  return has
}

function getBestSelectionFromSrcset(el: any, scale: number = 1) {
  if (el.tagName !== 'IMG' || !el.getAttribute('data-srcset')) return

  let options = el.getAttribute('data-srcset')
  const result: any[] = []
  const container = el.parentNode
  const containerWidth = container.offsetWidth * scale

  let spaceIndex
  let tmpSrc
  let tmpWidth

  options = options.trim().split(',')

  options.map((item: string) => {
    item = item.trim()
    spaceIndex = item.lastIndexOf(' ')
    if (spaceIndex === -1) {
      tmpSrc = item
      tmpWidth = 999998
    } else {
      tmpSrc = item.substr(0, spaceIndex)
      tmpWidth = parseInt(item.substr(spaceIndex + 1, item.length - spaceIndex - 2), 10)
    }
    result.push([tmpWidth, tmpSrc])
  })

  result.sort(function (a, b) {
    if (a[0] < b[0]) {
      return 1
    }
    if (a[0] > b[0]) {
      return -1
    }
    if (a[0] === b[0]) {
      if (b[1].indexOf('.webp', b[1].length - 5) !== -1) {
        return 1
      }
      if (a[1].indexOf('.webp', a[1].length - 5) !== -1) {
        return -1
      }
    }
    return 0
  })
  let bestSelectedSrc = ''
  let tmpOption

  for (let i = 0; i < result.length; i++) {
    tmpOption = result[i]
    bestSelectedSrc = tmpOption[1]
    const next = result[i + 1]
    if (next && next[0] < containerWidth) {
      bestSelectedSrc = tmpOption[1]
      break
    } else if (!next) {
      bestSelectedSrc = tmpOption[1]
      break
    }
  }

  return bestSelectedSrc
}

function find(arr: string | any[], fn: (arg0: any) => any) {
  let item
  for (let i = 0, len = arr.length; i < len; i++) {
    if (fn(arr[i])) {
      item = arr[i]
      break
    }
  }
  return item
}

const getDPR = (scale = 1) => inBrowser ? (window.devicePixelRatio || scale) : scale

function supportWebp(): boolean {
  if (!inBrowser) return false

  let support = true

  try {
    const elem = document.createElement('canvas');

    if (!!(elem.getContext && elem.getContext('2d'))) {
      support = elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }
  } catch (err) {
    support = false
  }

  return support
}

function throttle(action: any, delay: number = 200) {
  let timeout: boolean | NodeJS.Timeout | null = null
  let lastRun = 0
  return function () {
    if (timeout) {
      return
    }
    let elapsed = Date.now() - lastRun
    let context = this
    let args = arguments
    let runCallback = function () {
      lastRun = Date.now()
      timeout = false
      action.apply(context, args)
    }
    if (elapsed >= delay) {
      runCallback()
    } else {
      timeout = setTimeout(runCallback, delay)
    }
  }
}

function testSupportsPassive() {
  if (!inBrowser) return
  let support = false
  try {
    let opts = Object.defineProperty({}, 'passive', {
      get: function () {
        support = true
      }
    })
    window.addEventListener('test', () => { }, opts)
  } catch (e) { }
  return support
}

const supportsPassive = testSupportsPassive()

const _ = {
  on(
    el: { addEventListener: (arg0: any, arg1: any, arg2: any) => void },
    type: any,
    func: any,
    capture = false
  ) {
    if (supportsPassive) {
      el.addEventListener(type, func, {
        capture: capture,
        passive: true
      })
    } else {
      el.addEventListener(type, func, capture)
    }
  },
  off(el: { removeEventListener: (arg0: any, arg1: any, arg2: boolean) => void }, type: any, func: any, capture = false) {
    el.removeEventListener(type, func, capture)
  }
}

const loadImageAsync = (item: any, resolve: any, reject: (arg0: string | Event | Error) => void) => {
  let image = new Image()
  if (!item || !item.src) {
    const err = new Error('image src is required')
    return reject(err)
  }

  image.src = item.src
  if (item.cors) {
    image.crossOrigin = item.cors
  }

  image.onload = function () {
    resolve({
      naturalHeight: image.naturalHeight,
      naturalWidth: image.naturalWidth,
      src: image.src
    })
  }

  image.onerror = function (e) {
    reject(e)
  }
}

const style = (el: HTMLElement, prop: any) => {
  return typeof getComputedStyle !== 'undefined'
    ? getComputedStyle(el, null).getPropertyValue(prop)
    : el.style[prop]
}

const overflow = (el: any) => {
  return style(el, 'overflow') + style(el, 'overflow-y') + style(el, 'overflow-x')
}

const scrollParent = (el: HTMLElement) => {
  if (!inBrowser) return
  if (!(el instanceof HTMLElement)) {
    return window
  }

  let parent: Node = el

  while (parent) {
    if (parent === document.body || parent === document.documentElement) {
      break
    }

    if (!parent.parentNode) {
      break
    }

    if (/(scroll|auto)/.test(overflow(parent))) {
      return parent
    }

    parent = parent.parentNode
  }

  return window
}

function isObject(obj: any) {
  return obj !== null && typeof obj === 'object'
}

function ObjectKeys(obj: { hasOwnProperty?: any }) {
  if (!(obj instanceof Object)) return []
  if (Object.keys) {
    return Object.keys(obj)
  } else {
    let keys = []
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        keys.push(key)
      }
    }
    return keys
  }
}

function ArrayFrom(arrLike: string | any[]) {
  let len = arrLike.length
  const list = []
  for (let i = 0; i < len; i++) {
    list.push(arrLike[i])
  }
  return list
}

function noop() { }


export {
  inBrowser,
  CustomEvent,
  remove,
  some,
  find,
  noop,
  ArrayFrom,
  _,
  isObject,
  throttle,
  supportWebp,
  getDPR,
  scrollParent,
  loadImageAsync,
  getBestSelectionFromSrcset,
  ObjectKeys
}
