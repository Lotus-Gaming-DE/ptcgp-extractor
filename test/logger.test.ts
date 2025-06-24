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
    const spy = jest
      .spyOn(process.stdout, 'write')
      .mockImplementation(() => true);
    logger.info('hello');
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('outputs JSON lines', () => {
    const spy = jest
      .spyOn(process.stdout, 'write')
      .mockImplementation(() => true);
    logger.error('fail');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('"msg":"fail"'));
    spy.mockRestore();
  });
});
