import fs from 'fs-extra';
process.env.TCGDEX_REPO = process.cwd();
import { writeData } from '../src/lib';

jest.mock('fs-extra', () => {
  const actual = jest.requireActual('fs-extra');
  return {
    ...actual,
    writeJson: jest.fn(),
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
  });
});
