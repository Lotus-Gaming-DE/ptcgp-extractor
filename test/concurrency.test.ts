beforeAll(() => {
  process.env.TCGDEX_REPO = process.cwd();
});

afterAll(() => {
  delete process.env.TCGDEX_REPO;
});

import fs from 'fs-extra';
import path from 'path';

async function createSampleRepo(): Promise<string> {
  const base = await fs.mkdtemp(path.join(process.cwd(), 'tmp-repo-'));
  const pocketDir = path.join(base, 'data', 'Pokémon TCG Pocket', 'T');
  await fs.ensureDir(pocketDir);
  await fs.writeFile(
    path.join(base, 'data', 'Pokémon TCG Pocket', 'T.ts'),
    "export default { id: 'T' };",
  );
  await fs.writeFile(
    path.join(pocketDir, 'c.ts'),
    "export default { set: { id: 'T' } };",
  );
  return base;
}

describe('parseConcurrency', () => {
  it('returns default for invalid values', async () => {
    const { parseConcurrency } = await import('../src/lib');
    expect(parseConcurrency('0')).toBe(10);
    expect(parseConcurrency('-2')).toBe(10);
    expect(parseConcurrency('abc')).toBe(10);
  });

  it('parses valid numbers', async () => {
    const { parseConcurrency } = await import('../src/lib');
    expect(parseConcurrency('5')).toBe(5);
  });

  it('caps values above MAX_CONCURRENCY', async () => {
    const { parseConcurrency, MAX_CONCURRENCY } = await import('../src/lib');
    expect(parseConcurrency(String(MAX_CONCURRENCY + 50))).toBe(
      MAX_CONCURRENCY,
    );
  });
});

describe('mapLimit validation via getAllSets', () => {
  it('throws for concurrency 0', async () => {
    const repo = await createSampleRepo();
    process.env.TCGDEX_REPO = repo;
    const { getAllSets } = await import('../src/lib');
    await expect(getAllSets(0)).rejects.toThrow(/Invalid concurrency limit/);
    await fs.remove(repo);
  });
});
