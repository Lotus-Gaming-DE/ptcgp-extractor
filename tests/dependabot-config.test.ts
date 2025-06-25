import fs from 'fs';

describe('dependabot config', () => {
  it('contains npm and GitHub Actions updates', () => {
    const content = fs.readFileSync('.github/dependabot.yml', 'utf-8');
    expect(content).toContain('package-ecosystem: npm');
    expect(content).toContain('package-ecosystem: github-actions');
  });
});
