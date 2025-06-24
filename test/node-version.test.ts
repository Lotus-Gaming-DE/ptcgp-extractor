import { checkNodeVersion } from '../src/export';
import { logger } from '../src/logger';

describe('checkNodeVersion', () => {
  it('throws when node major version is below 20', () => {
    const errorSpy = jest.spyOn(logger, 'error').mockImplementation(() => {});

    expect(() => checkNodeVersion('18.0.0')).toThrow(
      /Node.js 20\+ is required/,
    );
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Node.js 20+'),
    );

    errorSpy.mockRestore();
  });

  it('does not throw when node version is higher', () => {
    expect(() => checkNodeVersion('21.0.0')).not.toThrow();
  });
});
