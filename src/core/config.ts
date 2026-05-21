import { readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

export type Config = {
  output: {
    formats: Array<'md' | 'json'>;
  };
  scanning: {
    largeFileSizeMb: number;
    largeFileMaxResults: number;
    ignorePatterns: string[];
  };
  scoring: {
    missingReadme: number;
    missingReadmeInstallSection: number;
    missingTestScript: number;
    missingBuildScript: number;
    missingEnvExample: number;
    largeFileDeductionEach: number;
    largeFileDeductionMax: number;
  };
};

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

export async function loadConfig(): Promise<Config> {
  const configPath = join(projectRoot, 'data', 'defaults.jsonc');
  const raw = await readFile(configPath, 'utf-8');
  const stripped = raw.replace(/\/\/.*$/gm, '');
  return JSON.parse(stripped) as Config;
}
