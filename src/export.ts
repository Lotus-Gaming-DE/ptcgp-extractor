import 'ts-node/register';
import fs from 'fs-extra';
import path from 'path';
import { repoDir, getAllSets, getAllCards, writeData } from './lib';

export function checkNodeVersion(
  version: string = process.versions.node,
  minimumMajor = 20,
) {
  const major = parseInt(version.split('.')[0], 10);
  if (major < minimumMajor) {
    console.error(`Node.js ${minimumMajor}+ is required. Detected ${version}.`);
    process.exit(1);
  }
}

async function ensureRepoDir() {
  if (!(await fs.pathExists(repoDir))) {
    throw new Error(
      `Repo directory '${repoDir}' not found. Clone tcgdex/cards-database into this folder.`,
    );
  }
}

export async function main() {
  try {
    checkNodeVersion();
    await ensureRepoDir();
    const sets = await getAllSets();
    const cards = await getAllCards();
    const { cardsOutPath, setsOutPath } = await writeData(cards, sets);

    if (process.env.DEBUG) {
      const outRaw = await fs.readFile(cardsOutPath, 'utf-8');
      console.log('Erste 500 Zeichen aus cards.json:\n', outRaw.slice(0, 500));
      const setsRaw = await fs.readFile(setsOutPath, 'utf-8');
      console.log('Erste 500 Zeichen aus sets.json:\n', setsRaw.slice(0, 500));
    }

    console.log(
      `Exported ${cards.length} cards to ${path.relative(process.cwd(), cardsOutPath)} and ${sets.length} sets to ${path.relative(process.cwd(), setsOutPath)}`,
    );
  } catch (err) {
    console.error(err);
    throw err;
  }
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
