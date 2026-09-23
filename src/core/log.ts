import type { Logger } from './backend'

export type { Logger }

export type LogLevel = 'info' | 'warn' | 'error'

export interface LogEntry {
  /** Epoch ms. */
  time: number
  level: LogLevel
  scope: string
  message: string
  /** Extra arguments passed after the message (errors, objects). */
  details: unknown[]
}

export type LogSink = (entry: LogEntry) => void

/** Writes `2026-09-23T10:00:00.000Z WARN  [scope] message` lines to the console. */
export const consoleSink: LogSink = ({ time, level, scope, message, details }) => {
  console[level](
    `${new Date(time).toISOString()} ${level.toUpperCase().padEnd(5)} [${scope}] ${message}`,
    ...details
  )
}

/** A logger that stamps every entry with time, level and scope; prints to the console unless given a sink. */
export function createLogger(scope: string, sink: LogSink = consoleSink): Logger {
  const write =
    (level: LogLevel) =>
    (message: string, ...details: unknown[]): void => {
      try {
        sink({ time: Date.now(), level, scope, message, details })
      } catch {
        // Logging must never take the caller down.
      }
    }
  return { info: write('info'), warn: write('warn'), error: write('error') }
}

/** Wrap a logger so every message is prefixed with a sub-scope, e.g. `[reader] …`. */
export function scopeLogger(logger: Logger, scope: string): Logger {
  const prefix = `[${scope}] `
  return {
    info: (message, ...details) => logger.info(prefix + message, ...details),
    warn: (message, ...details) => logger.warn(prefix + message, ...details),
    error: (message, ...details) => logger.error(prefix + message, ...details)
  }
}

/** Best-effort one-line description of a thrown value. */
export function describeError(error: unknown): string {
  if (error instanceof Error) {
    const cause = error.cause instanceof Error ? ` (${error.cause.message})` : ''
    return `${error.message}${cause}`
  }
  return String(error)
}
