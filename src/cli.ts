#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import { mkdir, writeFile, rm } from 'fs/promises';
import { join } from 'path';
import { simpleGit } from 'simple-git';
import { loadConfig } from './core/config.js';
import { scanProject } from './scanners/projectScanner.js';
import { generateMarkdownReport } from './reports/markdownReport.js';
import { resolveStorePath } from './core/store.js';

function isGitHubUrl(input: string): boolean {
  return input.startsWith('https://github.com/') || input.startsWith('git@github.com:');
}

program
  .name('sourcedash')
  .description('Local-first codebase inspection and reporting tool')
  .version('0.1.0');

program
  .command('scan <path>')
  .description('Scan a local path or GitHub URL')
  .action(async (targetPath: string) => {
    const config = await loadConfig();
    const outputDir = resolveStorePath(targetPath);
    let cloneDir: string | null = null;
    let scanPath = targetPath;

    try {
      if (isGitHubUrl(targetPath)) {
        cloneDir = join(outputDir, 'tmp');
        console.log(chalk.cyan(`Cloning ${targetPath}...`));
        await mkdir(cloneDir, { recursive: true });
        await simpleGit().clone(targetPath, cloneDir, ['--depth', '1']);
        scanPath = cloneDir;
        console.log(chalk.cyan('Clone complete. Scanning...'));
      } else {
        console.log(chalk.cyan(`Scanning ${targetPath}...`));
      }

      const result = await scanProject(scanPath, config);

      await mkdir(outputDir, { recursive: true });

      if (config.output.formats.includes('json')) {
        await writeFile(join(outputDir, 'report.json'), JSON.stringify(result, null, 2), 'utf-8');
      }
      if (config.output.formats.includes('md')) {
        await writeFile(join(outputDir, 'report.md'), generateMarkdownReport(result), 'utf-8');
      }

      const scoreColor = result.score >= 80 ? chalk.green : result.score >= 60 ? chalk.yellow : chalk.red;

      console.log('');
      console.log(chalk.bold('Scan complete.'));
      console.log(`Score: ${scoreColor(`${result.score}/100`)}`);

      if (result.warnings.length > 0) {
        console.log('');
        console.log(chalk.yellow('Warnings:'));
        for (const w of result.warnings) {
          console.log(`  ${chalk.yellow('!')} ${w}`);
        }
      }

      console.log('');
      console.log(chalk.dim(`Report written to ${outputDir}`));
    } catch (err) {
      console.error(chalk.red('Scan failed:'), err instanceof Error ? err.message : String(err));
      process.exit(1);
    } finally {
      if (cloneDir) {
        await rm(cloneDir, { recursive: true, force: true });
      }
    }
  });

program.parse();
