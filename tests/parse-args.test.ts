process.env.TCGDEX_REPO = process.cwd();
import * as exp from '../src/export';

afterAll(() => {
  delete process.env.TCGDEX_REPO;
});

interface CliOptions {
  concurrency?: number;
  out?: string;
}

describe('parseArgs', () => {
  const parse = (
    exp as unknown as { parseArgs: (argv: string[]) => CliOptions }
  ).parseArgs;

  it('reads --concurrency and --out', () => {
    const opts = parse(['--concurrency', '5', '--out', 'foo']);
    expect(opts).toEqual({ concurrency: 5, out: 'foo' });
  });

  it('reads short flags -c and -o', () => {
    const opts = parse(['-c', '7', '-o', 'bar']);
    expect(opts).toEqual({ concurrency: 7, out: 'bar' });
  });
});
