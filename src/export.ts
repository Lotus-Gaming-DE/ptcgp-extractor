import 'ts-node/register';
import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';

// Typdefinitionen
interface SetInfo {
  id: string;
  [key: string]: unknown;
}

interface Card {
  set_id?: string;
  [key: string]: unknown;
}

// Standard-Ordner für das tcgdex-Repo
const repoDir = path.resolve('tcgdex');

export function checkNodeVersion(
  version: string = process.versions.node,
  requiredMajor = 20,
) {
  const major = parseInt(version.split('.')[0], 10);
  if (major !== requiredMajor) {
    console.error(`Node.js ${requiredMajor} is required. Detected ${version}.`);
    process.exit(1);
  }
}

async function ensureRepoDir() {
  if (!(await fs.pathExists(repoDir))) {
    console.error(
      `Repo directory '${repoDir}' not found. Clone tcgdex/cards-database into this folder.`,
    );
    process.exit(1);
  }
}

const SETS_GLOB = path.join(repoDir, 'data', 'Pokémon TCG Pocket', '*.ts');
const CARDS_GLOB = path.join(
  repoDir,
  'data',
  'Pokémon TCG Pocket',
  '*',
  '*.ts',
);

async function importTSFile(file: string) {
  const pathToFile = path.resolve(file);
  return await import(pathToFile);
}

async function getAllSets(): Promise<SetInfo[]> {
  const setFiles = await glob(SETS_GLOB);
  const sets: SetInfo[] = [];

  for (const file of setFiles) {
    const set = (await importTSFile(file)).default;
    // Entferne das "serie"-Feld!
    if (set.serie) {
      delete set.serie;
    }
    if (!set.name) {
      set.name = { en: path.basename(file, '.ts') };
    }
    sets.push(set);
  }
  return sets;
}

async function getAllCards(): Promise<Card[]> {
  const files = await glob(CARDS_GLOB);
  const cards: Card[] = [];

  for (const file of files) {
    const mod = await importTSFile(file);
    const card = mod.default || mod;

    let setId: string;
    if (card.set && card.set.id) {
      setId = card.set.id;
    } else {
      setId = path.basename(path.dirname(file));
    }
    card.set_id = setId;

    // Entferne das Set-Objekt komplett aus der Karte!
    delete card.set;

    cards.push(card);
  }
  return cards;
}

async function main() {
  checkNodeVersion();
  await ensureRepoDir();
  // Schritt 1: Sets einlesen
  const sets = await getAllSets();

  // Schritt 2: Karten einlesen
  const cards = await getAllCards();

  // Schritt 3: Schreibe Karten und Sets in getrennte Dateien
  const dataDir = path.join(__dirname, '..', 'data');
  await fs.ensureDir(dataDir);

  const cardsOutPath = path.join(dataDir, 'cards.json');
  const setsOutPath = path.join(dataDir, 'sets.json');

  await fs.writeJson(cardsOutPath, cards, { spaces: 2 });
  await fs.writeJson(setsOutPath, sets, { spaces: 2 });

  // Debug-Ausgabe
  if (process.env.DEBUG) {
    const outRaw = await fs.readFile(cardsOutPath, 'utf-8');
    console.log('Erste 500 Zeichen aus cards.json:\n', outRaw.slice(0, 500));
    const setsRaw = await fs.readFile(setsOutPath, 'utf-8');
    console.log('Erste 500 Zeichen aus sets.json:\n', setsRaw.slice(0, 500));
  }

  console.log(
    `Exported ${cards.length} cards to data/cards.json and ${sets.length} sets to data/sets.json`,
  );
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
