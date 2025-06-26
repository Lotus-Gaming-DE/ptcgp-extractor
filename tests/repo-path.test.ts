import fs from 'fs-extra';
import path from 'path';

describe('resolveRepoDir validation', () => {
  it('rejects newline characters', async () => {
    jest.resetModules();
    process.env.TCGDEX_REPO = 'bad\npath';
    await expect(import('../src/lib')).rejects.toThrow(
      'Ung\xC3\xBCltige Zeichen',
    );
    delete process.env.TCGDEX_REPO;
  });

  it('rejects symlink escaping project', async () => {
    jest.resetModules();
    const tmpDir = await fs.mkdtemp('tmp-link-');
    const linkPath = tmpDir + '/link';
    await fs.symlink(path.join('..', '..'), linkPath);
    process.env.TCGDEX_REPO = linkPath;
    await expect(import('../src/lib')).rejects.toThrow(/Projektordner/);
    await fs.remove(tmpDir);
    delete process.env.TCGDEX_REPO;
  });
});
