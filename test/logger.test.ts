let logger: typeof import('../src/logger').logger;

beforeEach(async () => {
  process.env.LOG_LEVEL = 'warn';
  jest.resetModules();
  ({ logger } = await import('../src/logger'));
});

afterEach(() => {
  delete process.env.LOG_LEVEL;
});

describe('logger with LOG_LEVEL', () => {
  it('suppresses info messages when level is warn', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    logger.info('hello');
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('outputs JSON when enabled', async () => {
    delete process.env.LOG_LEVEL;
    jest.resetModules();
    ({ logger } = await import('../src/logger'));
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    logger.info('hello');
    expect(spy).toHaveBeenCalledWith(expect.stringMatching(/"msg":"hello"/));
    spy.mockRestore();
  });
});
