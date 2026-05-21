import { describe, expect, it } from 'vitest';
import { resolveStorePath } from '../src/core/store.js';

describe('resolveStorePath', () => {
  it('creates owner and repo paths for GitHub URLs', () => {
    const result = resolveStorePath('https://github.com/psandis/dietclaw');

    expect(result).toContain('/.sourcedash/scans/psandis/dietclaw/');
    expect(result).toMatch(/\/\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}$/);
  });

  it('creates local paths for filesystem inputs', () => {
    const result = resolveStorePath('/tmp/example-project');

    expect(result).toContain('/.sourcedash/scans/local/example-project/');
    expect(result).toMatch(/\/\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}$/);
  });
});
