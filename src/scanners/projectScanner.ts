import { resolve } from 'path';
import { scanPackage } from './packageScanner.js';
import { scanReadme } from './readmeScanner.js';
import { scanFiles } from './fileScanner.js';
import type { ProjectScanResult } from '../core/types.js';

function calculateScore(result: Omit<ProjectScanResult, 'score' | 'warnings' | 'recommendations'>): {
  score: number;
  warnings: string[];
  recommendations: string[];
} {
  let score = 100;
  const warnings: string[] = [];
  const recommendations: string[] = [];

  const { packageInfo, readmeInfo, fileInfo } = result;

  if (!readmeInfo.exists) {
    score -= 20;
    warnings.push('No README file found.');
    recommendations.push('Add a README.md with at minimum a project description and setup instructions.');
  } else if (!readmeInfo.hasInstallSection) {
    score -= 8;
    warnings.push('README does not include installation or setup instructions.');
    recommendations.push('Add an install or setup section to README.md.');
  }

  if (!fileInfo.hasEnvExample && !packageInfo.isCli) {
    score -= 10;
    warnings.push('.env.example is missing.');
    recommendations.push('Add .env.example so the project can be configured locally without guessing variable names.');
  }

  if (packageInfo.exists && !packageInfo.scripts.includes('test')) {
    score -= 8;
    warnings.push('No test script found in package.json.');
    recommendations.push('Add a test script or document the testing approach.');
  }

  if (packageInfo.exists && !packageInfo.scripts.includes('build')) {
    score -= 8;
    warnings.push('No build script found in package.json.');
    recommendations.push('Add a build script to package.json.');
  }

  if (fileInfo.largeFiles.length > 0) {
    const deduction = Math.min(fileInfo.largeFiles.length * 3, 15);
    score -= deduction;
    warnings.push(`${fileInfo.largeFiles.length} large file(s) found in the repository.`);
    recommendations.push('Review large files and remove generated artifacts or binaries from the repository.');
  }

  return { score: Math.max(0, score), warnings, recommendations };
}

export async function scanProject(targetPath: string): Promise<ProjectScanResult> {
  const absolutePath = resolve(targetPath);

  const [packageInfo, readmeInfo, fileInfo] = await Promise.all([
    scanPackage(absolutePath),
    scanReadme(absolutePath),
    scanFiles(absolutePath),
  ]);

  const base = { scannedAt: new Date().toISOString(), path: absolutePath, packageInfo, readmeInfo, fileInfo };
  const { score, warnings, recommendations } = calculateScore(base);

  return { ...base, score, warnings, recommendations };
}
