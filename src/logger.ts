/**
 * Simple logger with log level prefixes.
 *
 * @module logger
 */
export const logger = {
  /** Log informational message */
  info: (...args: unknown[]): void => {
    console.log('[INFO]', ...args);
  },

  /** Log warning message */
  warn: (...args: unknown[]): void => {
    console.warn('[WARN]', ...args);
  },

  /** Log error message */
  error: (...args: unknown[]): void => {
    console.error('[ERROR]', ...args);
  },
};
