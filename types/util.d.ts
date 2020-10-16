export declare const inBrowser: boolean;
export declare const hasIntersectionObserver: boolean;
/**
 * is object
 *
 * @param {*} val
 * @returns {boolean}
 */
export declare function isObject(val: any): boolean;
/**
 * is primitive
 *
 * @param {*} val
 * @returns {boolean}
 */
export declare function isPrimitive(val: any): boolean;
/**
 * check private key
 *
 * @export
 * @param {*} key
 * @returns {boolean}
 */
export declare function isValidKey(key: any): boolean;
/**
 * Check if IntersectionObserver can be used
 *
 * @returns {boolean}
 */
export declare function checkIntersectionObserver(): boolean;
/**
 * Deeply assign the values of all enumerable-own-properties and symbols
 * from one or more source objects to a target object. Returns the target object.
 * https://github.com/jonschlinkert/assign-deep
 *
 * @param {*} target
 * @param {...any[]} args
 * @returns
 */
export declare function assign(target: any, ...args: any[]): void;
