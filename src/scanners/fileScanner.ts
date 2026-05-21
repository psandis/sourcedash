import { stat } from 'fs/promises';
import { join } from 'path';
import fg from 'fast-glob';
import type { FileInfo } from '../core/types.js';

const LARGE_FILE_THRESHOLD_MB = 1;
const LARGE_FILE_MAX_RESULTS = 20;

async function exists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function findLargeFiles(projectPath: string): Promise<Array<{ path: string; sizeMb: number }>> {
  const files = await fg('**/*', {
    cwd: projectPath,
    ignore: ['node_modules/**', '.git/**', 'dist/**', 'build/**', '.sourcedash/**'],
    onlyFiles: true,
    absolute: false,
  });

  const results: Array<{ path: string; sizeMb: number }> = [];

  for (const file of files) {
    const s = await stat(join(projectPath, file));
    const sizeMb = s.size / (1024 * 1024);
    if (sizeMb >= LARGE_FILE_THRESHOLD_MB) {
      results.push({ path: file, sizeMb: Math.round(sizeMb * 10) / 10 });
    }
    if (results.length >= LARGE_FILE_MAX_RESULTS) break;
  }

  return results.sort((a, b) => b.sizeMb - a.sizeMb);
}

export async function scanFiles(projectPath: string): Promise<FileInfo> {
  const [hasEnvExample, hasDockerfile, hasDockerCompose, hasGitHubActions, largeFiles] =
    await Promise.all([
      exists(join(projectPath, '.env.example')),
      exists(join(projectPath, 'Dockerfile')),
      exists(join(projectPath, 'docker-compose.yml')).then(
        (v) => v || exists(join(projectPath, 'docker-compose.yaml'))
      ),
      exists(join(projectPath, '.github', 'workflows')),
      findLargeFiles(projectPath),
    ]);

  return {
    hasEnvExample,
    hasDockerfile,
    hasDockerCompose,
    hasGitHubActions,
    largeFiles,
  };
}
