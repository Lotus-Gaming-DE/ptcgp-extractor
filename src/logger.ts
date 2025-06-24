import fs from 'fs-extra';
import { format as fmt } from 'util';
import { createLogger, transports, format } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

export type LogLevel = 'error' | 'warn' | 'info';

const logDir = process.env.LOG_DIR || 'logs';
fs.ensureDirSync(logDir);

const loggerInstance = createLogger({
  level: (process.env.LOG_LEVEL || 'info').toLowerCase(),
  format: format.combine(format.timestamp(), format.printf(({ level, message, timestamp }) => {
    return JSON.stringify({ level, time: timestamp, msg: message });
  })),
  transports: [
    new transports.Console(),
    new DailyRotateFile({
      dirname: logDir,
      filename: 'app-%DATE%.log',
      datePattern: process.env.LOG_ROTATION_INTERVAL ? 'YYYY-MM-DD-HH-mm-ss' : 'YYYY-MM-DD',
      maxFiles: '7d',
      frequency: process.env.LOG_ROTATION_INTERVAL,
      maxSize: process.env.LOG_MAX_SIZE,
    }),
  ],
});

function log(level: LogLevel, ...args: unknown[]): void {
  loggerInstance.log(level, fmt(...args));
}

export const logger = {
  info: (...args: unknown[]): void => log('info', ...args),
  warn: (...args: unknown[]): void => log('warn', ...args),
  error: (...args: unknown[]): void => log('error', ...args),
};
