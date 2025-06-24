import fs from 'fs-extra';
import path from 'path';
import { logger } from '../src/logger';

async function repoExists(repoDir: string): Promise<boolean> {
  return fs.pathExists(repoDir);
}

describe('export script', () => {
  const dataDir = path.resolve('data');

  it('runs export when repo present', async () => {
    const defaultRepo = path.resolve('tcgdex');
    if (!(await repoExists(defaultRepo))) {
      logger.info('Skipping export test: repo directory not found');
      return;
    }
    jest.resetModules();
    delete process.env.TCGDEX_REPO;
    const { main } = await import('../src/export');
    await main();
    await expect(fs.pathExists(path.join(dataDir, 'cards.json'))).resolves.toBe(
      true,
    );
    await expect(fs.pathExists(path.join(dataDir, 'sets.json'))).resolves.toBe(
      true,
    );
  });

  it('fails with invalid repo path', async () => {
    jest.resetModules();
    process.env.TCGDEX_REPO = '__invalid__';
    await expect(import('../src/export')).rejects.toThrow(/Repo directory/);
    delete process.env.TCGDEX_REPO;
  });

  it('rejects repo path outside project', async () => {
    jest.resetModules();
    process.env.TCGDEX_REPO = path.resolve('..');
    await expect(import('../src/export')).rejects.toThrow(/project directory/);
    delete process.env.TCGDEX_REPO;
  });
});
