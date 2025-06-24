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
// Kann über die Umgebungsvariable `TCGDEX_REPO` angepasst werden, um Tests
// oder alternative Pfade zu ermöglichen.
export const repoDir = path.resolve(process.env.TCGDEX_REPO || 'tcgdex');

/**
 * Ensure that the current Node.js version meets the minimum requirement.
 *
 * @param version - Version string to validate. Defaults to `process.versions.node`.
 * @param minimumMajor - Minimum supported major Node.js version. Defaults to `20`.
 *
 * The function prints an error and exits the process with code `1` when the
 * detected major version is lower than the required version.
 */
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

/**
 * Verify that the repository directory containing the tcgdex data exists.
 *
 * @throws Error when the directory is missing.
 */
async function ensureRepoDir() {
  if (!(await fs.pathExists(repoDir))) {
    throw new Error(
      `Repo directory '${repoDir}' not found. Clone tcgdex/cards-database into this folder.`,
    );
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
  const resolved = path.resolve(file);
  if (!resolved.startsWith(repoDir + path.sep)) {
    throw new Error(`Refusing to import outside of repo directory: ${file}`);
  }
  return await import(resolved);
}

/**
 * Read all set definition files and return them as plain objects.
 *
 * The function strips the optional `serie` field and ensures each set has a
 * name. Files are imported dynamically using `import()` which allows TypeScript
 * modules to be consumed at runtime.
 */
async function getAllSets(): Promise<SetInfo[]> {
  try {
    const setFiles = await glob(SETS_GLOB);

    const sets = await Promise.all(
      setFiles.map(async (file) => {
        try {
          const set = (await importTSFile(file)).default;
          // Entferne das "serie"-Feld!
          if (set.serie) {
            delete set.serie;
          }
          if (!set.name) {
            set.name = { en: path.basename(file, '.ts') };
          }
          return set;
        } catch (e) {
          throw new Error(
            `Failed to import set file ${file}: ${(e as Error).message}`,
          );
        }
      }),
    );
    return sets;
  } catch (e) {
    throw new Error(`Failed to load sets: ${(e as Error).message}`);
  }
}

/**
 * Load all card files and attach the corresponding set identifier.
 *
 * Each card is imported as a module. The function deduces the `set_id` from the
 * card data or the parent directory name and removes the original `set` object
 * to keep the output lean.
 */
async function getAllCards(): Promise<Card[]> {
  try {
    const files = await glob(CARDS_GLOB);

    const cards = await Promise.all(
      files.map(async (file) => {
        try {
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

          return card;
        } catch (e) {
          throw new Error(
            `Failed to import card file ${file}: ${(e as Error).message}`,
          );
        }
      }),
    );
    return cards;
  } catch (e) {
    throw new Error(`Failed to load cards: ${(e as Error).message}`);
  }
}

/**
 * Orchestrates the export process from reading the repository files to writing
 * the final JSON output.
 */
export async function main() {
  try {
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
