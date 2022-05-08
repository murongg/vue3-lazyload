import { beforeEach, describe, expect, it } from 'vitest'
import type { ValueFormatterObject } from '../src/types'
import Lazy from '../src/lazy'

describe('Vue3-lazyload Test', () => {
  let lazy: Lazy
  beforeEach(() => {
    lazy = new Lazy()
  })

  it('test _valueFormatter for string', () => {
    const result = lazy._valueFormatter('test')
    expect(result).toEqual({
      src: 'test',
      loading: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      error: '',
      lifecycle: {},
    })
  })

  it('test _valueFormatter for object', () => {
    const options: ValueFormatterObject = {
      src: 'test src',
      loading: 'test loading',
      error: 'test error',
      lifecycle: {},
    }
    const result = lazy._valueFormatter(options)
    expect(result).toEqual(options)
  })

  it('test _log', () => {
    lazy.config({ silent: false })
    let ThrowError
    lazy._log(() => {
      ThrowError = () => {
        throw new Error('test error')
      }
    })
    expect(ThrowError).toThrowError()
  })
})
