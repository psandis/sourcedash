import { readFile } from 'fs/promises';
import { join } from 'path';
import type { PackageInfo } from '../core/types.js';

export async function scanPackage(projectPath: string): Promise<PackageInfo> {
  const pkgPath = join(projectPath, 'package.json');

  try {
    const raw = await readFile(pkgPath, 'utf-8');
    const pkg = JSON.parse(raw) as Record<string, unknown>;

    const scripts = Object.keys((pkg.scripts as Record<string, string>) ?? {});
    const deps = Object.keys((pkg.dependencies as Record<string, string>) ?? {});
    const devDeps = Object.keys((pkg.devDependencies as Record<string, string>) ?? {});

    return {
      exists: true,
      name: typeof pkg.name === 'string' ? pkg.name : undefined,
      version: typeof pkg.version === 'string' ? pkg.version : undefined,
      scripts,
      dependenciesCount: deps.length,
      devDependenciesCount: devDeps.length,
      isCli: pkg.bin !== undefined,
    };
  } catch {
    return {
      exists: false,
      scripts: [],
      dependenciesCount: 0,
      devDependenciesCount: 0,
      isCli: false,
    };
  }
}
