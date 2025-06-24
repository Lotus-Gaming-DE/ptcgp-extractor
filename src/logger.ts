import { format } from 'util';

/**
 * Simple JSON logger with log level filtering.
 */
const levelOrder = { error: 0, warn: 1, info: 2 } as const;
export type LogLevel = keyof typeof levelOrder;

const currentLevel: number = (() => {
  const env = (process.env.LOG_LEVEL || 'info').toLowerCase();
  return levelOrder[env as LogLevel] ?? levelOrder.info;
})();

function log(level: LogLevel, ...args: unknown[]): void {
  if (levelOrder[level] > currentLevel) {
    return;
  }
  const entry = {
    level,
    time: new Date().toISOString(),
    msg: format(...args),
  };
  const line = JSON.stringify(entry);
  if (level === 'error') {
    console.error(line);
  } else if (level === 'warn') {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  info: (...args: unknown[]): void => {
    log('info', ...args);
  },
  warn: (...args: unknown[]): void => {
    log('warn', ...args);
  },
  error: (...args: unknown[]): void => {
    log('error', ...args);
  },
};
