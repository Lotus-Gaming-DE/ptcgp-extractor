import { checkNodeVersion } from '../src/export';

describe('checkNodeVersion', () => {
  it('exits when node version is not 20', () => {
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('exit');
    });
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => checkNodeVersion('18.0.0')).toThrow('exit');
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Node.js 20'),
    );

    exitSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
