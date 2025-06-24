import fs from 'fs-extra';
import path from 'path';

describe('resolveRepoDir validation', () => {
  it('rejects newline characters', async () => {
    jest.resetModules();
    process.env.TCGDEX_REPO = 'bad\npath';
    await expect(import('../src/lib')).rejects.toThrow('Invalid characters');
    delete process.env.TCGDEX_REPO;
  });

  it('rejects symlink escaping project', async () => {
    jest.resetModules();
    const tmpDir = await fs.mkdtemp('tmp-link-');
    const linkPath = tmpDir + '/link';
    await fs.symlink(path.join('..', '..'), linkPath);
    process.env.TCGDEX_REPO = linkPath;
    await expect(import('../src/lib')).rejects.toThrow(/project directory/);
    await fs.remove(tmpDir);
    delete process.env.TCGDEX_REPO;
  });
});
