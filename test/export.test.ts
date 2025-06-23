import 'ts-node/register';
import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';

interface SetInfo {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface Card {
  set_id?: string;
  // additional card information
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

// Standard-Ordner für das tcgdex-Repo
const repoDir = path.resolve('tcgdex');

async function ensureRepoDir(): Promise<boolean> {
  if (!(await fs.pathExists(repoDir))) {
    console.log('Skipping export test: repo directory not found');
    return false;
  }
  return true;
}

const SETS_GLOB = path.join(repoDir, 'data', 'Pokémon TCG Pocket', '*.ts');
const CARDS_GLOB = path.join(
  repoDir,
  'data',
  'Pokémon TCG Pocket',
  '*',
  '*.ts',
);

// Hilfsfunktion, um dynamisch zu importieren
async function importTSFile(file: string) {
  const pathToFile = path.resolve(file);
  return await import(pathToFile);
}

async function getAllSets(): Promise<SetInfo[]> {
  const setFiles = await glob(SETS_GLOB);

  const sets = await Promise.all(
    setFiles.map(async (file) => {
      const set = (await importTSFile(file)).default;
      if (!set.name) {
        set.name = { en: path.basename(file, '.ts') };
      }
      return set;
    }),
  );
  return sets;
}

// Main-Funktion
async function main() {
  if (!(await ensureRepoDir())) {
    return;
  }
  // Sets einlesen
  const sets = await getAllSets();

  // Schritt 3: Karten einlesen und um Set-ID ergänzen
  const files = await glob(CARDS_GLOB);
  console.log('Files found:', files.length);

  const cards: Card[] = await Promise.all(
    files.map(async (file) => {
      const mod = await importTSFile(file);
      const card = mod.default || mod;

      let setId: string;
      if (card.set && card.set.id) {
        setId = card.set.id;
      } else {
        setId = path.basename(path.dirname(file));
      }
      card.set_id = setId;
      return card;
    }),
  );

  // Schritt 4: Schreibe Karten und Sets in getrennte Dateien
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
  }

  console.log(
    `Exported ${cards.length} cards to data/cards.json and ${sets.length} sets to data/sets.json`,
  );
}

test('run export script', async () => {
  if (!(await ensureRepoDir())) {
    return;
  }
  await main();
});
