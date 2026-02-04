import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { SearchResult, SearchMatch } from '@ccplans/shared';
import { config } from '../config.js';

/**
 * Extract title from markdown content
 */
function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : 'Untitled';
}

export class SearchService {
  private plansDir: string;

  constructor(plansDir = config.plansDir) {
    this.plansDir = plansDir;
  }

  /**
   * Search for a query in all plan files
   */
  async search(query: string, limit = 50): Promise<SearchResult[]> {
    if (!query.trim()) {
      return [];
    }

    const files = await readdir(this.plansDir);
    const mdFiles = files.filter((f) => f.endsWith('.md'));

    const results: SearchResult[] = [];

    for (const filename of mdFiles) {
      try {
        const filePath = join(this.plansDir, filename);
        const content = await readFile(filePath, 'utf-8');
        const matches = this.findMatches(content, query);

        if (matches.length > 0) {
          results.push({
            filename,
            title: extractTitle(content),
            matches: matches.slice(0, 10), // Limit matches per file
          });
        }
      } catch {
        // Skip files that can't be read
        continue;
      }
    }

    // Sort by number of matches (descending)
    return results.sort((a, b) => b.matches.length - a.matches.length).slice(0, limit);
  }

  /**
   * Find all matches of query in content
   */
  private findMatches(content: string, query: string): SearchMatch[] {
    const matches: SearchMatch[] = [];
    const lines = content.split('\n');
    const lowerQuery = query.toLowerCase();

    lines.forEach((line, index) => {
      const lowerLine = line.toLowerCase();
      const matchIndex = lowerLine.indexOf(lowerQuery);

      if (matchIndex !== -1) {
        // Extract highlight with context
        const start = Math.max(0, matchIndex - 20);
        const end = Math.min(line.length, matchIndex + query.length + 20);
        const highlight = (start > 0 ? '...' : '') + line.slice(start, end) + (end < line.length ? '...' : '');

        matches.push({
          line: index + 1,
          content: line.trim(),
          highlight,
        });
      }
    });

    return matches;
  }
}

export const searchService = new SearchService();
