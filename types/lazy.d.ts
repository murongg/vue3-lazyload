import { LazyOptions } from './interface';
import { DirectiveBinding } from 'vue';
/**
 * Lazyload
 *
 * @export
 * @class Lazy
 */
export default class Lazy {
    options: LazyOptions;
    private _image;
    private _observer;
    constructor(options?: LazyOptions);
    /**
     * merge config
     *
     * @param {*} [options={}]
     * @memberof Lazy
     */
    config(options?: {}): void;
    /**
     * mount
     *
     * @param {HTMLElement} el
     * @param {DirectiveBinding<string>} binding
     * @memberof Lazy
     */
    mount(el: HTMLElement, binding: DirectiveBinding<string>): void;
    /**
     * update
     *
     * @param {HTMLElement} el
     * @memberof Lazy
     */
    update(el: HTMLElement): void;
    /**
     * unmount
     *
     * @param {HTMLElement} el
     * @memberof Lazy
     */
    unmount(el: HTMLElement): void;
    /**
     * force loading
     *
     * @param {HTMLElement} el
     * @param {string} src
     * @memberof Lazy
     */
    loadImages(el: HTMLElement, src: string): void;
    /**
     * set img tag src
     *
     * @private
     * @param {HTMLElement} el
     * @param {string} src
     * @memberof Lazy
     */
    private _setImageSrc;
    /**
     * init IntersectionObserver
     *
     * @private
     * @param {HTMLElement} el
     * @param {string} src
     * @memberof Lazy
     */
    private _initIntersectionObserver;
}
