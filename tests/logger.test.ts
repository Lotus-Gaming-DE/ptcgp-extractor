import fs from 'fs-extra';
import path from 'path';

let logger: typeof import('../src/logger').logger;
let logDir: string;

beforeEach(async () => {
  logDir = await fs.mkdtemp(path.join(process.cwd(), 'logs-test-'));
  process.env.LOG_LEVEL = 'warn';
  process.env.LOG_DIR = logDir;
  process.env.LOG_ROTATION_INTERVAL = '1s';
  process.env.LOG_MAX_SIZE = '1k';
  jest.resetModules();
  ({ logger } = await import('../src/logger'));
});

afterEach(async () => {
  delete process.env.LOG_LEVEL;
  delete process.env.LOG_DIR;
  delete process.env.LOG_ROTATION_INTERVAL;
  delete process.env.LOG_MAX_SIZE;
  await fs.remove(logDir);
});

describe('logger', () => {
  it('writes log file and rotates', async () => {
    const big = 'x'.repeat(2048);
    logger.info(big);
    await new Promise((r) => setTimeout(r, 1100));
    logger.info(big);
    const files = await fs.readdir(logDir);
    expect(files.length).toBeGreaterThanOrEqual(2);
  });
});
