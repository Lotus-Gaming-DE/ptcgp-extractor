import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import { logger } from '../src/logger';

/** Build a minimal tcgdex repo with one set and one card */
async function createSampleRepo(): Promise<string> {
  const base = await fs.mkdtemp(path.join(os.tmpdir(), 'tcgdex-'));
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
  let cardsBackup: Buffer;
  let setsBackup: Buffer;

  beforeAll(() => {
    cardsBackup = fs.readFileSync(path.join('data', 'cards.json'));
    setsBackup = fs.readFileSync(path.join('data', 'sets.json'));
  });

  afterEach(async () => {
    await fs.remove(repo);
    delete process.env.TCGDEX_REPO;
  });

  afterAll(() => {
    fs.writeFileSync(path.join('data', 'cards.json'), cardsBackup);
    fs.writeFileSync(path.join('data', 'sets.json'), setsBackup);
  });

  it('exports tiny dataset', async () => {
    repo = await createSampleRepo();
    process.env.TCGDEX_REPO = repo;
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
      expect.stringContaining('Exported 1 cards'),
    );
    logSpy.mockRestore();
  });
});
