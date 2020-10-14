import { ImageCacheOptions } from './interface'
export default class ImageCache {
  private _caches: any[] = []
  private _options: ImageCacheOptions
  constructor({ max }: ImageCacheOptions) {
    this._options = {
      max: max || 100
    }
  }

  public has(key: any) {
    return this._caches.indexOf(key) > -1
  }

  public add(key: any) {
    if (this.has(key)) return
    this._caches.push(key)
    if (this._caches.length > this._options.max) {
      this.free()
    }
  }

  public free() {
    this._caches.shift()
  }
}
