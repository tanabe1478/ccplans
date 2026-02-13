export async function writeClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    // Fall through to electron preload bridge.
  }

  if (window.electronAPI?.writeClipboard) {
    window.electronAPI.writeClipboard(text);
    return;
  }

  throw new Error('Clipboard API is not available');
}
