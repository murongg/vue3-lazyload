
export const inBrowser = typeof window !== 'undefined' && window !== null

export const hasIntersectionObserver = checkIntersectionObserver()
const isEnumerable = Object.prototype.propertyIsEnumerable;
const getSymbols = Object.getOwnPropertySymbols;

/**
 * is object
 *
 * @param {*} val
 * @returns {boolean}
 */
export function isObject(val: any): boolean {
  return typeof val === 'function' || toString.call(val) === '[object Object]';
}

/**
 * is primitive
 *
 * @param {*} val
 * @returns {boolean}
 */
export function isPrimitive(val: any): boolean {
  return typeof val === 'object' ? val === null : typeof val !== 'function';
}

/**
 * check private key
 *
 * @export
 * @param {*} key
 * @returns {boolean}
 */
export function isValidKey(key: any): boolean {
  return key !== '__proto__' && key !== 'constructor' && key !== 'prototype';
};

/**
 * Remove an item from the array
 *
 * @param {any[]} arr
 * @param {*} item
 * @returns
 */
export function remove(arr: any[], item: any) {
  if (!arr.length) return
  const index = arr.indexOf(item)
  if (index > -1) return arr.splice(index, 1)
}

/**
 * Find if this item exists in the array
 *
 * @param {any[]} arr
 * @param {(arg: any) => any} fn
 * @returns
 */
export function some(arr: any[], fn: (arg: any) => any) {
  let has = false
  for (let i = 0, len = arr.length; i < len; i++) {
    if (fn(arr[i])) {
      has = true
      break
    }
  }
  return has
}

/**
 * Find an item from the array
 *
 * @param {any[]} arr
 * @param {(arg: any) => boolean} fn
 * @returns {*}
 */
export function find(arr: any[], fn: (arg: any) => boolean): any {
  let item
  for (let i = 0, len = arr.length; i < len; i++) {
    if (fn(arr[i])) {
      item = arr[i]
      break
    }
  }
  return item
}

/**
 * Check if IntersectionObserver can be used
 *
 * @returns {boolean}
 */
export function checkIntersectionObserver(): boolean {
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

export const CustomEvent = (function () {
  if (!inBrowser) return
  if (typeof window.CustomEvent === 'function') return window.CustomEvent
  function CustomEvent(event: string, params: { bubbles: any; cancelable: any; detail: any }) {
    params = params || { bubbles: false, cancelable: false, detail: undefined }
    var evt = document.createEvent('CustomEvent')
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail)
    return evt
  }
  CustomEvent.prototype = window.Event.prototype
  return CustomEvent
})()

export function getBestSelectionFromSrcset(el: any | HTMLImageElement, scale: number = 1): string {
  if (el.tagName !== 'IMG' || !el.getAttribute('data-srcset')) return ''

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

/**
 * get device pixel ratio
 *
 * @export
 * @param {number} [scale=1]
 * @returns {number}
 */
export function getDPR(scale = 1): number {
  return inBrowser ? (window.devicePixelRatio || scale) : scale
}

/**
 * is support webp
 *
 * @returns {boolean}
 */
export function supportWebp(): boolean {
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

/**
 * throttle
 *
 * @param {*} action
 * @param {number} [delay=200]
 * @returns
 */
export function throttle(action: any, delay: number = 200) {
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

/**
 * test supports passive
 *
 * @returns {boolean}
 */
export function testSupportsPassive(): boolean {
  if (!inBrowser) return false
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

export const _ = {
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
/**
 * async load image
 *
 * @param {{ src: string, cors: string }} item
 * @param {(arg: { naturalWidth: number, naturalHeight: number, src: string }) => void} resolve
 * @param {((arg: string | Error | Event) => void)} reject
 * @returns
 */
export function loadImageAsync(item: { src?: string, cors?: string }, resolve: (arg: { naturalWidth: number, naturalHeight: number, src: string }) => void, reject: (arg: string | Error | Event) => void) {
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

export function scrollParent(el: HTMLElement) {
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

/**
 * get object keys
 *
 * @param {object} obj
 * @returns {any[]}
 */
export function ObjectKeys(obj: object): any[] {
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

/**
 * Assign the enumerable es6 Symbol properties from one 
 * or more objects to the first object passed on the arguments. 
 * Can be used as a supplement to other extend, assign or 
 * merge methods as a polyfill for the Symbols part of 
 * the es6 Object.assign method.
 * https://github.com/jonschlinkert/assign-symbols
 *
 * @param {*} target
 * @param {...any[]} args
 * @returns
 */
function assignSymbols(target: any, ...args: any[]) {
  if (!isObject(target)) {
    throw new TypeError('expected the first argument to be an object');
  }

  if (args.length === 0 || typeof Symbol !== 'function' || typeof getSymbols !== 'function') {
    return target;
  }

  for (let arg of args) {
    let names = getSymbols(arg);

    for (let key of names) {
      if (isEnumerable.call(arg, key)) {
        target[key] = arg[key];
      }
    }
  }
  return target;
};

/**
 * Deeply assign the values of all enumerable-own-properties and symbols 
 * from one or more source objects to a target object. Returns the target object.
 * https://github.com/jonschlinkert/assign-deep
 *
 * @param {*} target
 * @param {...any[]} args
 * @returns
 */
export function assign(target: any, ...args: any[]) {
  let i = 0;
  if (isPrimitive(target)) target = args[i++];
  if (!target) target = {};
  for (; i < args.length; i++) {
    if (isObject(args[i])) {
      for (const key of Object.keys(args[i])) {
        if (isValidKey(key)) {
          if (isObject(target[key]) && isObject(args[i][key])) {
            assign(target[key], args[i][key]);
          } else {
            target[key] = args[i][key];
          }
        }
      }
      assignSymbols(target, args[i]);
    }
  }
  return target;
};
