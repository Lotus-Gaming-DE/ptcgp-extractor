import fs from 'fs-extra';
import path from 'path';

/** Build a minimal tcgdex repo with one set and one card */
async function createSampleRepo(): Promise<string> {
  const base = await fs.mkdtemp(path.join(process.cwd(), 'tmp-repo-'));
  const pocketDir = path.join(base, 'data', 'Pokémon TCG Pocket', 'TEST');
  await fs.ensureDir(pocketDir);
  const setFile = path.join(base, 'data', 'Pokémon TCG Pocket', 'TEST.ts');
  await fs.writeFile(
    setFile,
    "export default { id: 'TEST', name: { en: 'Test Set' } };",
  );
  const cardFile = path.join(pocketDir, 'card.ts');
  await fs.writeFile(
    cardFile,
    "export default { set: { id: 'TEST' }, name: { en: 'Card' } };",
  );
  return base;
}

describe('export with sample data', () => {
  let repo: string;
  let cardsBackup: Buffer | null;
  let setsBackup: Buffer | null;

  beforeAll(async () => {
    await fs.ensureDir('data');
    cardsBackup = (await fs.pathExists(path.join('data', 'cards.json')))
      ? fs.readFileSync(path.join('data', 'cards.json'))
      : null;
    setsBackup = (await fs.pathExists(path.join('data', 'sets.json')))
      ? fs.readFileSync(path.join('data', 'sets.json'))
      : null;
  });

  afterEach(async () => {
    await fs.remove(repo);
    delete process.env.TCGDEX_REPO;
    delete process.env.CONCURRENCY;
  });

  afterAll(() => {
    if (cardsBackup) {
      fs.ensureDirSync('data');
      fs.writeFileSync(path.join('data', 'cards.json'), cardsBackup);
    } else {
      fs.removeSync(path.join('data', 'cards.json'));
    }
    if (setsBackup) {
      fs.ensureDirSync('data');
      fs.writeFileSync(path.join('data', 'sets.json'), setsBackup);
    } else {
      fs.removeSync(path.join('data', 'sets.json'));
    }
  });

  it('exports tiny dataset', async () => {
    jest.resetModules();
    repo = await createSampleRepo();
    process.env.TCGDEX_REPO = repo;
    const { logger } = await import('../src/logger');
    const logSpy = jest.spyOn(logger, 'info').mockImplementation(() => {});
    const { main } = await import('../src/export');
    await main();
    await expect(
      fs.readJson(path.join('data', 'cards.json')),
    ).resolves.toHaveLength(1);
    await expect(
      fs.readJson(path.join('data', 'sets.json')),
    ).resolves.toHaveLength(1);
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('Exportierte 1 Karten'),
    );
    logSpy.mockRestore();
  });

  it('respects CONCURRENCY env variable', async () => {
    jest.resetModules();
    repo = await createSampleRepo();
    process.env.TCGDEX_REPO = repo;
    process.env.CONCURRENCY = '1';
    const { main } = await import('../src/export');
    await main();
    await expect(
      fs.readJson(path.join('data', 'cards.json')),
    ).resolves.toHaveLength(1);
    delete process.env.CONCURRENCY;
  });

  it('accepts CLI flags', async () => {
    jest.resetModules();
    repo = await createSampleRepo();
    process.env.TCGDEX_REPO = repo;
    const { main } = await import('../src/export');
    await main(['--concurrency', '1', '--out', 'data']);
    await expect(
      fs.readJson(path.join('data', 'cards.json')),
    ).resolves.toHaveLength(1);
  });

  it('logs excerpts when DEBUG is set', async () => {
    jest.resetModules();
    repo = await createSampleRepo();
    process.env.TCGDEX_REPO = repo;
    process.env.DEBUG = '1';
    const { logger } = await import('../src/logger');
    const spy = jest.spyOn(logger, 'info').mockImplementation(() => {});
    const { main } = await import('../src/export');
    await main();
    expect(spy).toHaveBeenCalledWith(
      expect.stringMatching(/Erste 500 Zeichen/),
      expect.any(String),
    );
    spy.mockRestore();
    delete process.env.DEBUG;
  });
});
