import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';

/**
 * Simple async pool to process promises with limited concurrency.
 *
 * @param items Array of items to process
 * @param limit Maximum number of concurrent executions
 * @param fn    Async function applied to each item
 * @returns Results in the same order as `items`
 */
async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const result: R[] = new Array(items.length);
  let index = 0;
  const workers = new Array(Math.min(limit, items.length))
    .fill(0)
    .map(async () => {
      while (index < items.length) {
        const current = index++;
        result[current] = await fn(items[current]);
      }
    });
  await Promise.all(workers);
  return result;
}

// Type definitions shared with consumers
export interface SetInfo {
  /** Unique identifier of the set */
  id: string;
  /** Set name in multiple languages */
  name?: Record<string, string>;
  /** Number of cards in the set */
  cardCount?: { official: number };
  /** Mapping of booster IDs to booster info */
  boosters?: Record<string, { name: Record<string, string> }>;
  /** Release date as ISO string */
  releaseDate?: string;
  [key: string]: unknown;
}

export interface Card {
  /** Identifier of the set this card belongs to */
  set_id: string;
  /** List of booster IDs this card appears in */
  boosters?: string[];
  [key: string]: unknown;
}

const projectRoot = path.resolve(__dirname, '..');

/**
 * Resolve the tcgdex repository directory from the environment variable.
 *
 * @throws Error when the resolved path is outside the project or does not exist.
 */
export function resolveRepoDir(): string {
  const dir = path.resolve(process.env.TCGDEX_REPO || 'tcgdex');
  const relative = path.relative(projectRoot, dir);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`TCGDEX_REPO must be inside the project directory: ${dir}`);
  }
  if (!fs.existsSync(dir)) {
    throw new Error(
      `Repo directory '${dir}' not found. Clone tcgdex/cards-database into this folder.`,
    );
  }
  return dir;
}

export const repoDir = resolveRepoDir();

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
 * @param concurrency Maximum number of files loaded in parallel
 * @returns Array of `SetInfo` objects
 */
export async function getAllSets(
  concurrency = Number(process.env.CONCURRENCY) || 10,
): Promise<SetInfo[]> {
  try {
    const setFiles = await glob(SETS_GLOB);

    const sets = await mapLimit(setFiles, concurrency, async (file) => {
      try {
        const set = (await importTSFile(file)).default;
        if (set.serie) {
          delete set.serie;
        }
        if (!set.name) {
          set.name = { en: path.basename(file, '.ts') };
        }
        return set as SetInfo;
      } catch (e) {
        throw new Error(
          `Failed to import set file ${file}: ${(e as Error).message}`,
        );
      }
    });
    return sets;
  } catch (e) {
    throw new Error(`Failed to load sets: ${(e as Error).message}`);
  }
}

/**
 * Load all card files and attach the corresponding set identifier.
 *
 * @param concurrency Maximum number of files loaded in parallel
 * @returns Array of `Card` objects
 */
export async function getAllCards(
  concurrency = Number(process.env.CONCURRENCY) || 10,
): Promise<Card[]> {
  try {
    const files = await glob(CARDS_GLOB);

    const cards = await mapLimit(files, concurrency, async (file) => {
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

        delete card.set;

        return card as Card;
      } catch (e) {
        throw new Error(
          `Failed to import card file ${file}: ${(e as Error).message}`,
        );
      }
    });
    return cards;
  } catch (e) {
    throw new Error(`Failed to load cards: ${(e as Error).message}`);
  }
}

/**
 * Write card and set data into JSON files within the given directory.
 *
 * @param cards Array of card objects to write
 * @param sets  Array of set objects to write
 * @param dataDir Output directory for the JSON files
 * @returns Paths of the written files for further processing
 */
export async function writeData(
  cards: Card[],
  sets: SetInfo[],
  dataDir = path.join(__dirname, '..', 'data'),
): Promise<{ cardsOutPath: string; setsOutPath: string }> {
  await fs.ensureDir(dataDir);

  const cardsOutPath = path.join(dataDir, 'cards.json');
  const setsOutPath = path.join(dataDir, 'sets.json');

  await fs.writeJson(cardsOutPath, cards, { spaces: 2 });
  await fs.writeJson(setsOutPath, sets, { spaces: 2 });

  return { cardsOutPath, setsOutPath };
}
