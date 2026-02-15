import { beforeEach, describe, expect, it, vi } from 'vitest';

const spawnMock = vi.fn();
const platformMock = vi.fn(() => 'darwin');
const writeTextMock = vi.fn();

vi.mock('node:child_process', () => ({
  spawn: spawnMock,
}));

vi.mock('node:os', () => ({
  platform: platformMock,
}));

vi.mock('electron', () => ({
  clipboard: {
    writeText: writeTextMock,
  },
}));

describe('OpenerService', () => {
  beforeEach(() => {
    spawnMock.mockReset();
    platformMock.mockReset();
    writeTextMock.mockReset();
    platformMock.mockReturnValue('darwin');
    spawnMock.mockReturnValue({
      on: vi.fn(),
      unref: vi.fn(),
    });
  });

  it('opens Terminal at the file directory on macOS', async () => {
    const { OpenerService } = await import('../openerService.js');
    const service = new OpenerService();
    const filePath = '/Users/test/.claude/plans/sample.md';

    await service.openFile(filePath, 'terminal');

    expect(spawnMock).toHaveBeenCalledWith(
      'open',
      ['-a', 'Terminal', '/Users/test/.claude/plans'],
      expect.objectContaining({
        detached: true,
        stdio: 'ignore',
      })
    );
  });

  it('opens Ghostty with a cd command to the file directory on macOS', async () => {
    const { OpenerService } = await import('../openerService.js');
    const service = new OpenerService();
    const filePath = '/Users/test/.claude/plans/sample.md';

    await service.openFile(filePath, 'ghostty');

    expect(spawnMock).toHaveBeenCalledTimes(1);
    const args = spawnMock.mock.calls[0][1] as string[];

    expect(spawnMock.mock.calls[0][0]).toBe('open');
    expect(args.slice(0, 6)).toEqual(['-na', 'Ghostty', '--args', '-e', 'zsh', '-lc']);
    expect(args[6]).toContain("cd -- '/Users/test/.claude/plans'");
    expect(args[6]).not.toContain('sample.md');
  });

  it('copies full file path for copy-path action', async () => {
    const { OpenerService } = await import('../openerService.js');
    const service = new OpenerService();
    const filePath = '/Users/test/.claude/plans/sample.md';

    await service.openFile(filePath, 'copy-path');

    expect(writeTextMock).toHaveBeenCalledWith(filePath);
    expect(spawnMock).not.toHaveBeenCalled();
  });
});
