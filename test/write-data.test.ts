import fs from 'fs-extra';
process.env.TCGDEX_REPO = process.cwd();
import { writeData } from '../src/lib';

jest.mock('fs-extra', () => {
  const actual = jest.requireActual('fs-extra');
  return {
    ...actual,
    writeJson: jest.fn(),
    move: jest.fn(actual.move),
  };
});

describe('writeData', () => {
  afterAll(() => {
    delete process.env.TCGDEX_REPO;
  });

  it('throws when fs.writeJson fails', async () => {
    const error = new Error('disk full');
    (fs.writeJson as jest.Mock).mockRejectedValueOnce(error);
    await expect(writeData([], [])).rejects.toThrow('disk full');
    const tmpExists = await fs.pathExists('data/cards.json.tmp');
    expect(tmpExists).toBe(false);
  });

  it('cleans up temp files when fs.move fails', async () => {
    (fs.writeJson as jest.Mock).mockResolvedValue(undefined);
    (fs.move as jest.Mock).mockRejectedValueOnce(new Error('perm'));
    await expect(writeData([], [])).rejects.toThrow('perm');
    await expect(fs.pathExists('data/cards.json.tmp')).resolves.toBe(false);
    await expect(fs.pathExists('data/sets.json.tmp')).resolves.toBe(false);
    (fs.move as jest.Mock).mockReset();
  });
});
