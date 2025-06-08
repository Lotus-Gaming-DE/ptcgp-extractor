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
  images?: { [lang: string]: { [quality: string]: string } };
  // additional card information
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface DatasJson {
  [lang: string]: {
    [serieId: string]: {
      [setId: string]: {
        [cardId: string]: string[];
      };
    };
  };
}

// Hilfsfunktion, um datas.json von tcgdex zu laden
async function fetchDatasJson(): Promise<DatasJson> {
  const url = 'https://assets.tcgdex.net/datas.json';
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch datas.json');
  }
  return (await res.json()) as DatasJson;
}

// Standard-Ordner für das tcgdex-Repo
const repoDir = path.resolve('tcgdex');

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

// Main-Funktion
async function main() {
  // Schritt 1: Bilddaten laden
  console.log('Lade datas.json von tcgdex...');
  const datas = await fetchDatasJson();

  // Schritt 2: Sets einlesen
  const sets = await getAllSets();
  // Map zur schnellen Suche nach Set nach ID (derzeit nicht genutzt)

  // Schritt 3: Karten einlesen und um Set-ID ergänzen
  const files = await glob(CARDS_GLOB);
  console.log('Files found:', files.length);

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

    // --- Image-URLs hinzufügen ---
    const serieId = card.set?.serie?.id;
    const cardId = file.match(/(\d+)\.ts$/)?.[1] || ''; // z.B. "003"
    card.images = {};

    // Finde alle Sprachen aus dem cards-Objekt (z.B. ["de", "en", ...])
    const langs = Object.keys(card.name ?? {});

    for (const lang of langs) {
      // Überprüfe, ob die Bilddaten für die Karte in datas.json verfügbar sind
      if (
        datas[lang] &&
        datas[lang][serieId] &&
        datas[lang][serieId][setId] &&
        datas[lang][serieId][setId][cardId]
      ) {
        card.images[lang] = {};
        const qualities = Object.keys(datas[lang][serieId][setId][cardId]); // z.B. ["high", "medium", ...]
        for (const quality of qualities) {
          card.images[lang][quality] =
            `https://assets.tcgdex.net/${lang}/${serieId}/${setId}/${cardId}/${quality}.webp`;
        }
      }
    }

    cards.push(card);
  }

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

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
