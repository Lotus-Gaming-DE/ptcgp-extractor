import fs from "fs-extra";
import path from "path";
import { glob } from "glob";

// 1. Alle Set-Dateien einlesen
const SETS_GLOB = "tcgdex/data/Pokémon TCG Pocket/*.ts";
const CARDS_GLOB = "tcgdex/data/Pokémon TCG Pocket/*/*.ts";

// Hilfsfunktion, um dynamisch zu importieren (require)
function importTSFile(file: string) {
  return require(path.resolve(file));
}

async function getAllSets() {
  const setFiles = await glob(SETS_GLOB);
  const sets: Record<string, any> = {};

  for (const file of setFiles) {
    const set = importTSFile(file).default;
    // Manche Set-Dateien haben vielleicht keinen Namen in "en"
    sets[set.id] = {
      id: set.id,
      name: (set.name && set.name.en) ? set.name.en : path.basename(file, ".ts")
    };
  }
  return sets;
}

async function getAllCards(sets: Record<string, any>) {
  const files = await glob(CARDS_GLOB);
  console.log("Files found:", files.length);

  const cards: any[] = [];

  for (const file of files) {
    const mod = importTSFile(file);
    const card = mod.default || mod;

    let setId: string | undefined = undefined;
    let setName: string | undefined = undefined;

    if (card.set && card.set.id) {
      setId = card.set.id;
      setName = sets[setId]?.name || "";
    } else {
      // Fallback: Überordner-Name
      setName = path.basename(path.dirname(file));
    }

    // Set-Daten als eigene Felder zur Karte
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
  const outPath = path.join(__dirname, "..", "..", "data", "cards.json");
  await fs.ensureDir(path.dirname(outPath));
  await fs.writeJson(outPath, cards, { spaces: 2 });

  console.log(`Exported ${cards.length} cards to data/cards.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
