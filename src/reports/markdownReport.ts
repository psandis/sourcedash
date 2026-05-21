import type { ProjectScanResult } from '../core/types.js';

function yesNo(value: boolean): string {
  return value ? 'yes' : 'no';
}

export function generateMarkdownReport(result: ProjectScanResult): string {
  const lines: string[] = [];

  lines.push('# SourceDash Project Report');
  lines.push('');
  lines.push(`Generated: ${result.scannedAt}`);
  lines.push('');
  lines.push('Project path:');
  lines.push('');
  lines.push('```');
  lines.push(result.path);
  lines.push('```');
  lines.push('');

  lines.push('## Score');
  lines.push('');
  lines.push(`${result.score}/100`);
  lines.push('');

  lines.push('## Package');
  lines.push('');
  if (!result.packageInfo.exists) {
    lines.push('- package.json: not found');
  } else {
    lines.push(`- package.json: yes`);
    if (result.packageInfo.name) lines.push(`- name: ${result.packageInfo.name}`);
    if (result.packageInfo.version) lines.push(`- version: ${result.packageInfo.version}`);
    lines.push(`- scripts: ${result.packageInfo.scripts.join(', ') || 'none'}`);
    lines.push(`- dependencies: ${result.packageInfo.dependenciesCount}`);
    lines.push(`- devDependencies: ${result.packageInfo.devDependenciesCount}`);
  }
  lines.push('');

  lines.push('## README');
  lines.push('');
  lines.push(`- README exists: ${yesNo(result.readmeInfo.exists)}`);
  if (result.readmeInfo.exists) {
    lines.push(`- install/setup section: ${yesNo(result.readmeInfo.hasInstallSection)}`);
    lines.push(`- usage/run section: ${yesNo(result.readmeInfo.hasUsageSection)}`);
    lines.push(`- environment section: ${yesNo(result.readmeInfo.hasEnvSection)}`);
    lines.push(`- license section: ${yesNo(result.readmeInfo.hasLicenseSection)}`);
  }
  lines.push('');

  lines.push('## Project Files');
  lines.push('');
  lines.push(`- .env.example: ${yesNo(result.fileInfo.hasEnvExample)}`);
  lines.push(`- Dockerfile: ${yesNo(result.fileInfo.hasDockerfile)}`);
  lines.push(`- Docker Compose: ${yesNo(result.fileInfo.hasDockerCompose)}`);
  lines.push(`- GitHub Actions: ${yesNo(result.fileInfo.hasGitHubActions)}`);
  lines.push('');

  if (result.fileInfo.largeFiles.length > 0) {
    lines.push('## Large Files');
    lines.push('');
    for (const f of result.fileInfo.largeFiles) {
      lines.push(`- ${f.path} (${f.sizeMb} MB)`);
    }
    lines.push('');
  }

  if (result.warnings.length > 0) {
    lines.push('## Warnings');
    lines.push('');
    for (const w of result.warnings) {
      lines.push(`- ${w}`);
    }
    lines.push('');
  }

  if (result.recommendations.length > 0) {
    lines.push('## Recommendations');
    lines.push('');
    result.recommendations.forEach((r, i) => {
      lines.push(`${i + 1}. ${r}`);
    });
    lines.push('');
  }

  return lines.join('\n');
}
