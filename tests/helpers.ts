import { mkdtemp, rm, mkdir, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join, dirname } from 'path';

export async function makeTempProject(): Promise<string> {
  return mkdtemp(join(tmpdir(), 'sourcedash-test-'));
}

export async function writeProjectFile(root: string, relativePath: string, content: string): Promise<void> {
  const fullPath = join(root, relativePath);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, content, 'utf-8');
}

export async function removeTempProject(root: string): Promise<void> {
  await rm(root, { recursive: true, force: true });
}
