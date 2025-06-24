/**
 * Simple logger with log level prefixes.
 *
 * @module logger
 */
const levelOrder = { error: 0, warn: 1, info: 2 } as const;
type LogLevel = keyof typeof levelOrder;

const currentLevel: number = (() => {
  const env = (process.env.LOG_LEVEL || 'info').toLowerCase();
  return levelOrder[env as LogLevel] ?? levelOrder.info;
})();

function log(level: LogLevel, ...args: unknown[]): void {
  if (levelOrder[level] > currentLevel) {
    return;
  }
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
