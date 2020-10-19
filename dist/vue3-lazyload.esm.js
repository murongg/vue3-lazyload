/*!
 * Vue3-Lazyload.js v0.1.1
 * A Vue3.x image lazyload plugin
 * (c) 2020 MuRong <admin@imuboy.cn>
 * Released under the MIT License.
 */
var inBrowser = typeof window !== 'undefined' && window !== null;
var hasIntersectionObserver = checkIntersectionObserver();
var isEnumerable = Object.prototype.propertyIsEnumerable;
var getSymbols = Object.getOwnPropertySymbols;
/**
 * is object
 *
 * @param {*} val
 * @returns {boolean}
 */
function isObject(val) {
    return typeof val === 'function' || toString.call(val) === '[object Object]';
}
/**
 * is primitive
 *
 * @param {*} val
 * @returns {boolean}
 */
function isPrimitive(val) {
    return typeof val === 'object' ? val === null : typeof val !== 'function';
}
/**
 * check private key
 *
 * @export
 * @param {*} key
 * @returns {boolean}
 */
function isValidKey(key) {
    return key !== '__proto__' && key !== 'constructor' && key !== 'prototype';
}
/**
 * Check if IntersectionObserver can be used
 *
 * @returns {boolean}
 */
function checkIntersectionObserver() {
    if (inBrowser &&
        'IntersectionObserver' in window &&
        'IntersectionObserverEntry' in window &&
        'intersectionRatio' in window.IntersectionObserverEntry.prototype) {
        // Minimal polyfill for Edge 15's lack of `isIntersecting`
        // See: https://github.com/w3c/IntersectionObserver/issues/211
        if (!('isIntersecting' in window.IntersectionObserverEntry.prototype)) {
            Object.defineProperty(window.IntersectionObserverEntry.prototype, 'isIntersecting', {
                get: function () {
                    return this.intersectionRatio > 0;
                }
            });
        }
        return true;
    }
    return false;
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
function assignSymbols(target) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    if (!isObject(target)) {
        throw new TypeError('expected the first argument to be an object');
    }
    if (args.length === 0 || typeof Symbol !== 'function' || typeof getSymbols !== 'function') {
        return target;
    }
    for (var _a = 0, args_1 = args; _a < args_1.length; _a++) {
        var arg = args_1[_a];
        var names = getSymbols(arg);
        for (var _b = 0, names_1 = names; _b < names_1.length; _b++) {
            var key = names_1[_b];
            if (isEnumerable.call(arg, key)) {
                target[key] = arg[key];
            }
        }
    }
    return target;
}
/**
 * Deeply assign the values of all enumerable-own-properties and symbols
 * from one or more source objects to a target object. Returns the target object.
 * https://github.com/jonschlinkert/assign-deep
 *
 * @param {*} target
 * @param {...any[]} args
 * @returns
 */
function assign(target) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    var i = 0;
    if (isPrimitive(target))
        target = args[i++];
    if (!target)
        target = {};
    for (; i < args.length; i++) {
        if (isObject(args[i])) {
            for (var _a = 0, _b = Object.keys(args[i]); _a < _b.length; _a++) {
                var key = _b[_a];
                if (isValidKey(key)) {
                    if (isObject(target[key]) && isObject(args[i][key])) {
                        assign(target[key], args[i][key]);
                    }
                    else {
                        target[key] = args[i][key];
                    }
                }
            }
            assignSymbols(target, args[i]);
        }
    }
    return target;
}

var DEFAULT_OBSERVER_OPTIONS = {
    rootMargin: '0px',
    threshold: 0
};
var DEFAULT_LOADING = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
var DEFAULT_ERROR = '';
/**
 * Lazyload
 *
 * @export
 * @class Lazy
 */
var Lazy = /** @class */ (function () {
    function Lazy(options) {
        this.options = {
            loading: DEFAULT_LOADING,
            error: DEFAULT_ERROR,
            observerOptions: DEFAULT_OBSERVER_OPTIONS
        };
        this.config(options);
    }
    /**
     * merge config
     *
     * @param {*} [options={}]
     * @memberof Lazy
     */
    Lazy.prototype.config = function (options) {
        if (options === void 0) { options = {}; }
        assign(this.options, options);
    };
    /**
     * mount
     *
     * @param {HTMLElement} el
     * @param {DirectiveBinding<string>} binding
     * @memberof Lazy
     */
    Lazy.prototype.mount = function (el, binding) {
        this._image = el;
        this._image.setAttribute('src', this.options.loading || DEFAULT_LOADING);
        if (!hasIntersectionObserver) {
            this.loadImages(el, binding.value);
            throw new Error('not support IntersectionObserver');
        }
        this._initIntersectionObserver(el, binding.value);
    };
    /**
     * update
     *
     * @param {HTMLElement} el
     * @memberof Lazy
     */
    Lazy.prototype.update = function (el) {
        this._observer.unobserve(el);
        this._observer.observe(el);
    };
    /**
     * unmount
     *
     * @param {HTMLElement} el
     * @memberof Lazy
     */
    Lazy.prototype.unmount = function (el) {
        this._observer.unobserve(el);
    };
    /**
     * force loading
     *
     * @param {HTMLElement} el
     * @param {string} src
     * @memberof Lazy
     */
    Lazy.prototype.loadImages = function (el, src) {
        this._setImageSrc(el, src);
    };
    /**
     * set img tag src
     *
     * @private
     * @param {HTMLElement} el
     * @param {string} src
     * @memberof Lazy
     */
    Lazy.prototype._setImageSrc = function (el, src) {
        var _this = this;
        var srcset = el.getAttribute('srcset');
        if ('img' === el.tagName.toLowerCase()) {
            if (src) {
                el.setAttribute('src', src);
            }
            if (srcset) {
                el.setAttribute('srcset', srcset);
            }
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            this._listenImageStatus(el, function () {
            }, function () {
                el.setAttribute('src', _this.options.error || DEFAULT_ERROR);
            });
        }
        else {
            el.style.backgroundImage = 'url(\'' + src + '\')';
        }
    };
    /**
     * init IntersectionObserver
     *
     * @private
     * @param {HTMLElement} el
     * @param {string} src
     * @memberof Lazy
     */
    Lazy.prototype._initIntersectionObserver = function (el, src) {
        var _this = this;
        var observerOptions = this.options.observerOptions;
        this._observer = new IntersectionObserver(function (entries) {
            Array.prototype.forEach.call(entries, function (entry) {
                if (entry.isIntersecting) {
                    _this._observer.unobserve(entry.target);
                    _this._setImageSrc(el, src);
                }
            });
        }, observerOptions);
        this._observer.observe(this._image);
    };
    /**
     * only listen to image status
     *
     * @private
     * @param {string} src
     * @param {(string | null)} cors
     * @param {() => void} success
     * @param {() => void} error
     * @memberof Lazy
     */
    Lazy.prototype._listenImageStatus = function (image, success, error) {
        image.onload = function () {
            success();
        };
        image.onerror = function () {
            error();
        };
    };
    return Lazy;
}());

var index = {
    /**
     * install plugin
     *
     * @param {App} Vue
     * @param {LazyOptions} options
     */
    install: function (Vue, options) {
        var lazy = new Lazy(options);
        Vue.config.globalProperties.$Lazyload = lazy;
        Vue.provide('Lazyload', lazy);
        Vue.directive('lazy', {
            mounted: lazy.mount.bind(lazy),
            updated: lazy.update.bind(lazy),
            unmounted: lazy.unmount.bind(lazy)
        });
    }
};

export default index;
