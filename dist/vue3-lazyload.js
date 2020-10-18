/*!
 * Vue3-Lazyload.js v0.1.1
 * A Vue3.x image lazyload plugin
 * (c) 2020 木荣 <admin@imuboy.cn>
 * Released under the MIT License.
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.VueLazyload = factory());
}(this, (function () { 'use strict';

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
    var DEFAULT_LOADING = 'data:image/gif;base64,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';
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
                loading: (options === null || options === void 0 ? void 0 : options.loading) || DEFAULT_LOADING,
                observerOptions: (options === null || options === void 0 ? void 0 : options.observerOptions) || DEFAULT_OBSERVER_OPTIONS,
                error: (options === null || options === void 0 ? void 0 : options.error) || DEFAULT_ERROR
            };
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
                this._listenImageStatus(el, function () {
                    console.log('success');
                }, function () {
                    console.error('error');
                    el.setAttribute('src', _this.options.error || '123');
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

    return index;

})));
