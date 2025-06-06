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
// Standard-Ordner für das tcgdex-Repo kann über Env oder CLI angepasst werden
function getArg(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  if (index !== -1 && process.argv[index + 1]) {
    return process.argv[index + 1];
  }
  return undefined;
}

const repoDir = getArg('--tcgdex') || process.env.TCGDEX_DIR || 'tcgdex';

// 1. Alle Set-Dateien einlesen
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

async function getAllSets() {
  const setFiles = await glob(SETS_GLOB);
  const sets: SetInfo[] = [];

  for (const file of setFiles) {
    const set = (await importTSFile(file)).default;
    if (!set.name) {
      set.name = { en: path.basename(file, '.ts') };
    }
    sets.push(set);
  }
  return sets;
}

async function getAllCards() {
  const files = await glob(CARDS_GLOB);
  console.log('Files found:', files.length);

  const cards: Card[] = [];

  for (const file of files) {
    const mod = await importTSFile(file);
    const card = mod.default || mod;

    let setId: string | undefined = undefined;

    if (card.set && card.set.id) {
      setId = card.set.id;
    } else {
      // Backup: Überordner als Set-ID
      setId = path.basename(path.dirname(file));
    }

    card.set_id = setId;

    cards.push(card);
  }

  return cards;
}

async function main() {
  // Schritt 1: Sets einlesen
  const sets = await getAllSets();

  // Schritt 2: Karten einlesen und um Set-Daten ergänzen
  const cards = await getAllCards();

  // Schritt 3: Karten als JSON exportieren
  const outPath = path.join(__dirname, '..', 'data', 'cards.json');
  await fs.ensureDir(path.dirname(outPath));
  await fs.writeJson(outPath, { sets, cards }, { spaces: 2 });

  // Optionaler Debug-Block: Inhalt der geschriebenen Datei ausgeben
  if (process.env.DEBUG) {
    const outRaw = await fs.readFile(outPath, 'utf-8');
    console.log('Erste 500 Zeichen aus cards.json:\n', outRaw.slice(0, 500));
  }

  console.log(
    `Exported ${cards.length} cards and ${sets.length} sets to data/cards.json`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
