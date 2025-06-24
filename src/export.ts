import fs from 'fs-extra';
import path from 'path';
import { getAllSets, getAllCards, writeData, parseConcurrency } from './lib';
import { logger } from './logger';

interface CliOptions {
  concurrency?: number;
  out?: string;
}

/**
 * Parse command line arguments for the export CLI.
 *
 * Supported flags:
 *   - `--concurrency` or `-c` followed by a number to limit parallel file reads.
 *   - `--out` or `-o` followed by a directory path for JSON output.
 */
export function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if ((arg === '--concurrency' || arg === '-c') && argv[i + 1]) {
      opts.concurrency = Number(argv[++i]);
    } else if ((arg === '--out' || arg === '-o') && argv[i + 1]) {
      opts.out = argv[++i];
    }
  }
  return opts;
}

export function checkNodeVersion(
  version: string = process.versions.node,
  minimumMajor = 20,
) {
  const major = parseInt(version.split('.')[0], 10);
  if (major < minimumMajor) {
    const message = `Node.js ${minimumMajor}+ is required. Detected ${version}.`;
    logger.error(message);
    throw new Error(message);
  }
}

export async function main(argv = process.argv.slice(2)) {
  checkNodeVersion();
  const cli = parseArgs(argv);
  const concurrency = parseConcurrency(
    cli.concurrency ?? process.env.CONCURRENCY,
  );
  const sets = await getAllSets(concurrency);
  const cards = await getAllCards(concurrency);
  const { cardsOutPath, setsOutPath } = await writeData(cards, sets, cli.out);

  if (process.env.DEBUG) {
    const outRaw = await fs.readFile(cardsOutPath, 'utf-8');
    logger.info('Erste 500 Zeichen aus cards.json:\n', outRaw.slice(0, 500));
    const setsRaw = await fs.readFile(setsOutPath, 'utf-8');
    logger.info('Erste 500 Zeichen aus sets.json:\n', setsRaw.slice(0, 500));
  }

  logger.info(
    `Exported ${cards.length} cards to ${path.relative(process.cwd(), cardsOutPath)} and ${sets.length} sets to ${path.relative(process.cwd(), setsOutPath)}`,
  );
}

if (require.main === module) {
  main().catch((e) => {
    logger.error(e);
    process.exit(1);
  });
}
