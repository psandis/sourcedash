import { homedir } from 'os';
import { join, basename, resolve } from 'path';

function timestampSlug(): string {
  return new Date().toISOString().replace(/[:.]/g, '-').replace('T', 'T').slice(0, 19);
}

function extractGitHubOwnerRepo(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com[/:]([^/]+)\/([^/.\s]+?)(?:\.git)?$/);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

export function resolveStorePath(input: string): string {
  const base = join(homedir(), '.sourcedash', 'scans');
  const ts = timestampSlug();

  const github = extractGitHubOwnerRepo(input);
  if (github) {
    return join(base, github.owner, github.repo, ts);
  }

  const folderName = basename(resolve(input));
  return join(base, 'local', folderName, ts);
}
