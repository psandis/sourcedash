import { readFile } from 'fs/promises';
import { join } from 'path';
import type { ReadmeInfo } from '../core/types.js';

const INSTALL_PATTERNS = [/##\s*(install|setup|getting started|quick start)/i];
const USAGE_PATTERNS = [/##\s*(usage|run|running|how to use)/i];
const ENV_PATTERNS = [/##\s*(env|environment|configuration|config)/i, /\.env/i];
const LICENSE_PATTERNS = [/##\s*licen[sc]e/i];

function matches(content: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(content));
}

export async function scanReadme(projectPath: string): Promise<ReadmeInfo> {
  const candidates = ['README.md', 'readme.md', 'README.MD'];

  for (const name of candidates) {
    try {
      const content = await readFile(join(projectPath, name), 'utf-8');
      return {
        exists: true,
        hasInstallSection: matches(content, INSTALL_PATTERNS),
        hasUsageSection: matches(content, USAGE_PATTERNS),
        hasEnvSection: matches(content, ENV_PATTERNS),
        hasLicenseSection: matches(content, LICENSE_PATTERNS),
      };
    } catch {
      continue;
    }
  }

  return {
    exists: false,
    hasInstallSection: false,
    hasUsageSection: false,
    hasEnvSection: false,
    hasLicenseSection: false,
  };
}
