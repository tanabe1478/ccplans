import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, writeFile, rm, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { PlanService } from '../services/planService.js';

describe('PlanService', () => {
  let testDir: string;
  let archiveDir: string;
  let service: PlanService;

  beforeEach(async () => {
    // Create temp directories
    testDir = join(tmpdir(), `ccplans-test-${Date.now()}`);
    archiveDir = join(testDir, 'archive');
    await mkdir(testDir, { recursive: true });

    service = new PlanService(testDir, archiveDir);

    // Create test files
    await writeFile(
      join(testDir, 'test-plan.md'),
      '# Test Plan\n\n## Overview\n\nThis is a test plan.\n'
    );
  });

  afterEach(async () => {
    // Cleanup
    await rm(testDir, { recursive: true, force: true });
  });

  describe('listPlans', () => {
    it('should list all markdown files', async () => {
      const plans = await service.listPlans();
      expect(plans).toHaveLength(1);
      expect(plans[0].filename).toBe('test-plan.md');
    });

    it('should extract title from markdown', async () => {
      const plans = await service.listPlans();
      expect(plans[0].title).toBe('Test Plan');
    });

    it('should extract sections', async () => {
      const plans = await service.listPlans();
      expect(plans[0].sections).toContain('Overview');
    });
  });

  describe('getPlan', () => {
    it('should return full plan details', async () => {
      const plan = await service.getPlan('test-plan.md');
      expect(plan.filename).toBe('test-plan.md');
      expect(plan.title).toBe('Test Plan');
      expect(plan.content).toContain('# Test Plan');
    });

    it('should throw for invalid filename', async () => {
      await expect(service.getPlan('../etc/passwd')).rejects.toThrow('Invalid filename');
    });

    it('should throw for non-existent file', async () => {
      await expect(service.getPlan('nonexistent.md')).rejects.toThrow();
    });
  });

  describe('createPlan', () => {
    it('should create a new plan file', async () => {
      const content = '# New Plan\n\nContent here.';
      const plan = await service.createPlan(content, 'new-plan.md');

      expect(plan.filename).toBe('new-plan.md');
      expect(plan.title).toBe('New Plan');

      const files = await readdir(testDir);
      expect(files).toContain('new-plan.md');
    });

    it('should generate filename if not provided', async () => {
      const content = '# Auto Named Plan\n\nContent.';
      const plan = await service.createPlan(content);

      expect(plan.filename).toMatch(/^[a-z]+-[a-z]+-[a-z]+\.md$/);
    });
  });

  describe('updatePlan', () => {
    it('should update existing plan', async () => {
      const newContent = '# Updated Plan\n\n## New Section\n\nUpdated content.';
      const plan = await service.updatePlan('test-plan.md', newContent);

      expect(plan.title).toBe('Updated Plan');
      expect(plan.sections).toContain('New Section');
    });
  });

  describe('deletePlan', () => {
    it('should archive plan by default', async () => {
      await service.deletePlan('test-plan.md');

      const mainFiles = await readdir(testDir);
      expect(mainFiles).not.toContain('test-plan.md');

      const archiveFiles = await readdir(archiveDir);
      expect(archiveFiles).toContain('test-plan.md');
    });

    it('should permanently delete when archive=false', async () => {
      await service.deletePlan('test-plan.md', false);

      const mainFiles = await readdir(testDir);
      expect(mainFiles).not.toContain('test-plan.md');

      // Archive should not exist or be empty
      try {
        const archiveFiles = await readdir(archiveDir);
        expect(archiveFiles).not.toContain('test-plan.md');
      } catch {
        // Archive dir doesn't exist, which is fine
      }
    });
  });

  describe('renamePlan', () => {
    it('should rename plan file', async () => {
      const plan = await service.renamePlan('test-plan.md', 'renamed-plan.md');

      expect(plan.filename).toBe('renamed-plan.md');

      const files = await readdir(testDir);
      expect(files).toContain('renamed-plan.md');
      expect(files).not.toContain('test-plan.md');
    });
  });

  describe('validateFilename', () => {
    it('should reject path traversal attempts', async () => {
      await expect(service.getPlan('../secret.md')).rejects.toThrow('Invalid filename');
      await expect(service.getPlan('foo/bar.md')).rejects.toThrow('Invalid filename');
      await expect(service.getPlan('test.txt')).rejects.toThrow('Invalid filename');
    });
  });
});
