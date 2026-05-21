import { afterEach, describe, expect, it } from 'vitest';
import { scanProject } from '../src/scanners/projectScanner.js';
import { makeTempProject, removeTempProject, writeProjectFile } from './helpers.js';

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map(removeTempProject));
});

const config = {
  output: { formats: ['md', 'json'] as Array<'md' | 'json'> },
  scanning: {
    largeFileSizeMb: 1,
    largeFileMaxResults: 20,
    ignorePatterns: ['node_modules/**', '.git/**', 'dist/**', 'build/**', '.sourcedash/**'],
  },
  scoring: {
    missingReadme: 20,
    missingReadmeInstallSection: 8,
    missingTestScript: 8,
    missingBuildScript: 8,
    missingEnvExample: 10,
    largeFileDeductionEach: 3,
    largeFileDeductionMax: 15,
  },
};

describe('scanProject', () => {
  it('does not penalize CLI projects for missing .env.example', async () => {
    const projectPath = await makeTempProject();
    tempDirs.push(projectPath);

    await writeProjectFile(
      projectPath,
      'package.json',
      JSON.stringify({
        name: 'demo-cli',
        version: '0.1.0',
        scripts: { build: 'tsc', test: 'vitest run' },
        bin: { demo: 'dist/cli.js' },
      })
    );
    await writeProjectFile(projectPath, 'README.md', ['# Demo', '', '## Install', 'npm install', '', '## License', 'MIT'].join('\n'));

    const result = await scanProject(projectPath, config);

    expect(result.score).toBe(100);
    expect(result.warnings).not.toContain('.env.example is missing.');
  });

  it('applies deductions for missing setup information and large files', async () => {
    const projectPath = await makeTempProject();
    tempDirs.push(projectPath);

    await writeProjectFile(
      projectPath,
      'package.json',
      JSON.stringify({
        name: 'demo-app',
        version: '0.1.0',
        scripts: {},
      })
    );
    await writeProjectFile(projectPath, 'README.md', '# Demo\n');
    await writeProjectFile(projectPath, 'assets/large.bin', 'a'.repeat(1024 * 1024 + 32));

    const result = await scanProject(projectPath, config);

    expect(result.score).toBe(63);
    expect(result.warnings).toContain('README does not include installation or setup instructions.');
    expect(result.warnings).toContain('.env.example is missing.');
    expect(result.warnings).toContain('No test script found in package.json.');
    expect(result.warnings).toContain('No build script found in package.json.');
    expect(result.warnings).toContain('1 large file(s) found in the repository.');
  });
});
