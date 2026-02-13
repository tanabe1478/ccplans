import { beforeEach, describe, expect, it, vi } from 'vitest';
import { writeClipboard } from '../../lib/clipboard';

describe('writeClipboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'electronAPI', {
      value: {
        invoke: vi.fn(),
        on: vi.fn(() => vi.fn()),
        writeClipboard: vi.fn(),
      },
      configurable: true,
      writable: true,
    });
  });

  it('uses navigator.clipboard when available', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    await writeClipboard('hello');

    expect(writeText).toHaveBeenCalledWith('hello');
    expect(window.electronAPI.writeClipboard).not.toHaveBeenCalled();
  });

  it('falls back to preload clipboard bridge when navigator API fails', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    await writeClipboard('fallback');

    expect(writeText).toHaveBeenCalledWith('fallback');
    expect(window.electronAPI.writeClipboard).toHaveBeenCalledWith('fallback');
  });
});
