import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';

describe('export script', () => {
  const outPath = path.join(__dirname, '..', 'data', 'cards.json');
  const tempDir = path.join(__dirname, 'tmp');
  let original: Buffer;

  beforeAll(async () => {
    original = await fs.readFile(outPath);
    await fs.emptyDir(tempDir);

    // create minimal tcgdex structure
    const base = path.join(tempDir, 'data', 'Pokémon TCG Pocket');
    await fs.ensureDir(path.join(base, 'set1'));

    await fs.writeFile(
      path.join(base, 'set1.ts'),
      `export default { id: 'SET1', name: { en: 'Set 1' } };`,
    );
    await fs.writeFile(
      path.join(base, 'set1', '1.ts'),
      `export default { id: 'SET1-1', set: { id: 'SET1' } };`,
    );

    execSync('npm run build', { stdio: 'inherit' });
    execSync(`node dist/export.js --tcgdex ${tempDir}`, { stdio: 'inherit' });
  });

  afterAll(async () => {
    await fs.writeFile(outPath, original);
    await fs.remove(tempDir);
  });

  it('writes cards.json with expected content', async () => {
    const cards = await fs.readJson(outPath);
    expect(Array.isArray(cards)).toBe(true);
    expect(cards[0].set_id).toBe('SET1');
    expect(cards[0].set_name).toBe('Set 1');
  });
});
