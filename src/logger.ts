/* eslint-disable no-console */
import type { LogLevel } from './types'

type ConsoleMethod = (...args: unknown[]) => void

export function getLogger(level: LogLevel): ConsoleMethod {
  switch (level) {
    case 'warn':
      return console.warn
    case 'info':
      return console.info
    case 'debug':
      return console.debug
    case 'log':
      return console.log
    case 'error':
    default:
      return console.error
  }
}

export function emitLog(enabled: boolean, level: LogLevel, message?: unknown, ...optionalParams: unknown[]): void {
  if (!enabled)
    return

  getLogger(level)(message, ...optionalParams)
}
