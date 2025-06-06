import fs from "fs-extra";
import path from "path";
import { glob } from "glob";

interface SetInfo {
  id: string;
  name: string;
}

interface Card {
  set_id?: string;
  set_name?: string;
  [key: string]: any;
}

// 1. Alle Set-Dateien einlesen
const SETS_GLOB = "tcgdex/data/Pokémon TCG Pocket/*.ts";
const CARDS_GLOB = "tcgdex/data/Pokémon TCG Pocket/*/*.ts";

// Hilfsfunktion, um dynamisch zu importieren (require)
function importTSFile(file: string) {
  return require(path.resolve(file));
}

async function getAllSets() {
  const setFiles = await glob(SETS_GLOB);
  const sets: Record<string, SetInfo> = {};

  for (const file of setFiles) {
    const set = importTSFile(file).default;
    sets[set.id] = {
      id: set.id,
      name: (set.name && set.name.en) ? set.name.en : path.basename(file, ".ts")
    };
  }
  return sets;
}

async function getAllCards(sets: Record<string, SetInfo>) {
  const files = await glob(CARDS_GLOB);
  console.log("Files found:", files.length);

  const cards: Card[] = [];

  for (const file of files) {
    const mod = importTSFile(file);
    const card = mod.default || mod;

    let setId: string | undefined = undefined;
    let setName: string | undefined = undefined;

    if (card.set && card.set.id) {
      setId = card.set.id;
      setName = setId && sets[setId] ? sets[setId].name : "";
    } else {
      // Backup: Überordner als Set-Name
      setName = path.basename(path.dirname(file));
    }

    card.set_id = setId;
    card.set_name = setName;

    cards.push(card);
  }

  return cards;
}

async function main() {
  // Schritt 1: Sets einlesen
  const sets = await getAllSets();

  // Schritt 2: Karten einlesen und um Set-Daten ergänzen
  const cards = await getAllCards(sets);

  // Schritt 3: Karten als JSON exportieren
  const outPath = path.join(__dirname, "..", "data", "cards.json");
  await fs.ensureDir(path.dirname(outPath));
  await fs.writeJson(outPath, cards, { spaces: 2 });

  // >>> Debug-Block: Inhalt der geschriebenen Datei ausgeben
  const outRaw = await fs.readFile(outPath, "utf-8");
  console.log("Erste 500 Zeichen aus cards.json:\n", outRaw.slice(0, 500));
  // <<< Debug-Block-Ende

  console.log(`Exported ${cards.length} cards to data/cards.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
