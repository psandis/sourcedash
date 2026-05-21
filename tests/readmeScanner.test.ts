import { afterEach, describe, expect, it } from 'vitest';
import { scanReadme } from '../src/scanners/readmeScanner.js';
import { makeTempProject, removeTempProject, writeProjectFile } from './helpers.js';

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map(removeTempProject));
});

describe('scanReadme', () => {
  it('detects the expected README sections', async () => {
    const projectPath = await makeTempProject();
    tempDirs.push(projectPath);

    await writeProjectFile(
      projectPath,
      'README.md',
      [
        '# Demo',
        '',
        '## Install',
        'Run npm install',
        '',
        '## Usage',
        'Run the command',
        '',
        '## Configuration',
        'Set values in .env',
        '',
        '## License',
        'MIT',
      ].join('\n')
    );

    const result = await scanReadme(projectPath);

    expect(result).toEqual({
      exists: true,
      hasInstallSection: true,
      hasUsageSection: true,
      hasEnvSection: true,
      hasLicenseSection: true,
    });
  });

  it('returns false values when README is missing', async () => {
    const projectPath = await makeTempProject();
    tempDirs.push(projectPath);

    const result = await scanReadme(projectPath);

    expect(result).toEqual({
      exists: false,
      hasInstallSection: false,
      hasUsageSection: false,
      hasEnvSection: false,
      hasLicenseSection: false,
    });
  });
});
