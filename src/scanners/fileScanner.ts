import { stat } from 'fs/promises';
import { join } from 'path';
import fg from 'fast-glob';
import type { FileInfo } from '../core/types.js';
import type { Config } from '../core/config.js';

async function exists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function findLargeFiles(
  projectPath: string,
  config: Config['scanning']
): Promise<Array<{ path: string; sizeMb: number }>> {
  const files = await fg('**/*', {
    cwd: projectPath,
    ignore: config.ignorePatterns,
    onlyFiles: true,
    absolute: false,
  });

  const results: Array<{ path: string; sizeMb: number }> = [];

  for (const file of files) {
    const s = await stat(join(projectPath, file));
    const sizeMb = s.size / (1024 * 1024);
    if (sizeMb >= config.largeFileSizeMb) {
      results.push({ path: file, sizeMb: Math.round(sizeMb * 10) / 10 });
    }
    if (results.length >= config.largeFileMaxResults) break;
  }

  return results.sort((a, b) => b.sizeMb - a.sizeMb);
}

export async function scanFiles(projectPath: string, config: Config['scanning']): Promise<FileInfo> {
  const [hasEnvExample, hasDockerfile, hasDockerCompose, hasGitHubActions, largeFiles] =
    await Promise.all([
      exists(join(projectPath, '.env.example')),
      exists(join(projectPath, 'Dockerfile')),
      exists(join(projectPath, 'docker-compose.yml')).then(
        (v) => v || exists(join(projectPath, 'docker-compose.yaml'))
      ),
      exists(join(projectPath, '.github', 'workflows')),
      findLargeFiles(projectPath, config),
    ]);

  return {
    hasEnvExample,
    hasDockerfile,
    hasDockerCompose,
    hasGitHubActions,
    largeFiles,
  };
}
