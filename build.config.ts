import { resolve } from 'node:path'

export const libraryEntry = resolve(__dirname, 'src/index.ts')
export const libraryName = 'VueLazyLoad'
export const libraryFormats = ['es', 'cjs', 'iife'] as const

export function libraryFileName(format: string): string {
  switch (format) {
    case 'es':
      return 'index.mjs'
    case 'cjs':
      return 'index.cjs'
    case 'iife':
      return 'index.iife.js'
    default:
      return `index.${format}.js`
  }
}
