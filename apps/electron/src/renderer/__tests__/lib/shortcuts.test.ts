import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  formatShortcutLabel,
  getShortcutFromKeyboardEvent,
  hasModifier,
  matchesShortcut,
  normalizeShortcut,
} from '@/lib/shortcuts';

describe('shortcuts utils', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('normalizes shortcut token order and casing', () => {
    expect(normalizeShortcut('shift+mod+k')).toBe('Mod+Shift+K');
  });

  it('formats Mod shortcut for mac label', () => {
    expect(formatShortcutLabel('Mod+K', true)).toBe('Cmd+K');
  });

  it('captures shortcut from keyboard event', () => {
    const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
    expect(getShortcutFromKeyboardEvent(event)).toBe('Meta+K');
  });

  it('requires modifiers when configured', () => {
    expect(hasModifier('K')).toBe(false);
    expect(hasModifier('Meta+K')).toBe(true);
  });

  it('matches keyboard events against shortcut', () => {
    vi.spyOn(window.navigator, 'platform', 'get').mockReturnValue('Linux');
    const event = new KeyboardEvent('keydown', { key: 'p', ctrlKey: true });
    expect(matchesShortcut(event, 'Mod+P')).toBe(true);
    expect(matchesShortcut(event, 'Meta+P')).toBe(false);
  });

  it('resolves Mod to Meta on macOS', () => {
    vi.spyOn(window.navigator, 'platform', 'get').mockReturnValue('MacIntel');

    const cmdEvent = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
    const ctrlEvent = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });

    expect(matchesShortcut(cmdEvent, 'Mod+K')).toBe(true);
    expect(matchesShortcut(ctrlEvent, 'Mod+K')).toBe(false);
  });
});
