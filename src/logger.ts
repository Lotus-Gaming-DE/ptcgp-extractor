/**
 * Simple logger with log level prefixes.
 *
 * @module logger
 */
function log(level: 'info' | 'warn' | 'error', ...args: unknown[]): void {
  const timestamp = new Date().toISOString();
  const prefix = `[${level.toUpperCase()} ${timestamp}]`;
  if (level === 'error') {
    console.error(prefix, ...args);
  } else if (level === 'warn') {
    console.warn(prefix, ...args);
  } else {
    console.log(prefix, ...args);
  }
}

export const logger = {
  /** Log informational message */
  info: (...args: unknown[]): void => {
    log('info', ...args);
  },

  /** Log warning message */
  warn: (...args: unknown[]): void => {
    log('warn', ...args);
  },

  /** Log error message */
  error: (...args: unknown[]): void => {
    log('error', ...args);
  },
};
