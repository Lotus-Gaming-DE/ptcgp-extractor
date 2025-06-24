describe('resolveRepoDir validation', () => {
  it('rejects newline characters', async () => {
    jest.resetModules();
    process.env.TCGDEX_REPO = 'bad\npath';
    await expect(import('../src/lib')).rejects.toThrow('Invalid characters');
    delete process.env.TCGDEX_REPO;
  });
});
