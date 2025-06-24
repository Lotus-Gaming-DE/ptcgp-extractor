import { logger } from '../src/logger';

beforeEach(() => {
  process.env.TCGDEX_REPO = process.cwd();
});

afterEach(() => {
  delete process.env.TCGDEX_REPO;
});

describe('checkNodeVersion', () => {
  it('throws when node major version is below 20', async () => {
    const { checkNodeVersion } = await import('../src/export');
    const errorSpy = jest.spyOn(logger, 'error').mockImplementation(() => {});

    expect(() => checkNodeVersion('18.0.0')).toThrow(
      /Node.js 20\+ is required/,
    );
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Node.js 20+'),
    );

    errorSpy.mockRestore();
  });

  it('does not throw when node version is higher', async () => {
    const { checkNodeVersion } = await import('../src/export');
    expect(() => checkNodeVersion('21.0.0')).not.toThrow();
  });
});
