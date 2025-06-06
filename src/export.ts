// src/export.ts

import fs from "fs-extra";
import { glob } from "glob";
import path from "path";

// Wo liegen die Karten?
const CARDS_GLOB = path.join(
  __dirname,
  "..",
  "..",
  "tcgdex",
  "data",
  "Pokémon TCG Pocket",
  "**",
  "*.ts"
);

async function getAllCards() {
  const files = await glob(CARDS_GLOB);
  const cards: any[] = [];

  for (const file of files) {
    // Dynamisch importieren (CJS require, weil die .ts Dateien als JS transpiliert werden)
    // Wir nehmen an, dass der "default export" das Card-Objekt ist
    const mod = require(file);
    const card = mod.default || mod;
    cards.push(card);
  }

  return cards;
}

async function main() {
  const cards = await getAllCards();

  // Erzeuge data/cards.json
  const outPath = path.join(__dirname, "..", "..", "data", "cards.json");
  await fs.ensureDir(path.dirname(outPath));
  await fs.writeJson(outPath, cards, { spaces: 2 });

  console.log(`Exported ${cards.length} cards to data/cards.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
