import { afterEach, describe, expect, it } from 'vitest';
import { scanFiles } from '../src/scanners/fileScanner.js';
import { makeTempProject, removeTempProject, writeProjectFile } from './helpers.js';

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map(removeTempProject));
});

const config = {
  largeFileSizeMb: 1,
  largeFileMaxResults: 20,
  ignorePatterns: ['node_modules/**', '.git/**', 'dist/**', 'build/**', '.sourcedash/**'],
};

describe('scanFiles', () => {
  it('detects project files and large files', async () => {
    const projectPath = await makeTempProject();
    tempDirs.push(projectPath);

    await writeProjectFile(projectPath, '.env.example', 'API_KEY=\n');
    await writeProjectFile(projectPath, 'Dockerfile', 'FROM node:22\n');
    await writeProjectFile(projectPath, 'docker-compose.yml', 'services:\n  app:\n    image: demo\n');
    await writeProjectFile(projectPath, '.github/workflows/ci.yml', 'name: ci\n');
    await writeProjectFile(projectPath, 'assets/large.bin', 'a'.repeat(1024 * 1024 + 32));

    const result = await scanFiles(projectPath, config);

    expect(result.hasEnvExample).toBe(true);
    expect(result.hasDockerfile).toBe(true);
    expect(result.hasDockerCompose).toBe(true);
    expect(result.hasGitHubActions).toBe(true);
    expect(result.largeFiles).toHaveLength(1);
    expect(result.largeFiles[0].path).toBe('assets/large.bin');
    expect(result.largeFiles[0].sizeMb).toBeGreaterThanOrEqual(1);
  });
});
