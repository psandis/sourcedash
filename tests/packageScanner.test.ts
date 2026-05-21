import { afterEach, describe, expect, it } from 'vitest';
import { scanPackage } from '../src/scanners/packageScanner.js';
import { makeTempProject, removeTempProject, writeProjectFile } from './helpers.js';

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map(removeTempProject));
});

describe('scanPackage', () => {
  it('returns package information and detects CLI projects', async () => {
    const projectPath = await makeTempProject();
    tempDirs.push(projectPath);

    await writeProjectFile(
      projectPath,
      'package.json',
      JSON.stringify({
        name: 'demo-cli',
        version: '1.2.3',
        scripts: { build: 'tsc', test: 'vitest run' },
        dependencies: { chalk: '^5.0.0' },
        devDependencies: { vitest: '^4.0.0', typescript: '^6.0.0' },
        bin: { sourcedash: 'dist/cli.js' },
      })
    );

    const result = await scanPackage(projectPath);

    expect(result).toMatchObject({
      exists: true,
      name: 'demo-cli',
      version: '1.2.3',
      dependenciesCount: 1,
      devDependenciesCount: 2,
      isCli: true,
    });
    expect(result.scripts).toEqual(['build', 'test']);
  });

  it('returns an empty shape when package.json is missing', async () => {
    const projectPath = await makeTempProject();
    tempDirs.push(projectPath);

    const result = await scanPackage(projectPath);

    expect(result).toEqual({
      exists: false,
      scripts: [],
      dependenciesCount: 0,
      devDependenciesCount: 0,
      isCli: false,
    });
  });
});
