import pino, { LoggerOptions } from 'pino';
import path from 'path';
import fs from 'fs-extra';
import { createStream } from 'rotating-file-stream';

const logDir = path.join(__dirname, '..', 'logs');
fs.ensureDirSync(logDir);

const level = (process.env.LOG_LEVEL || 'info').toLowerCase();

const fileStream = createStream('ptcgp.log', {
  size: '10M',
  interval: '1d',
  path: logDir,
  maxFiles: 5,
});

const options: LoggerOptions = {
  level,
};

export const logger = pino(
  options,
  pino.multistream([{ stream: process.stdout }, { stream: fileStream }]),
);
