import { test, expect } from '@playwright/test';

// Run tests serially to avoid state conflicts
test.describe.configure({ mode: 'serial' });

// Test file that will be created and deleted
const TEST_PLAN_FILENAME = 'test-delete-plan.md';
const TEST_PLAN_CONTENT = `# Test Plan for Delete

This is a test plan that will be deleted.

## Overview
Testing the delete functionality.
`;

test.describe('Delete functionality (from detail page)', () => {
  test.beforeEach(async ({ request }) => {
    // Create a test plan via API before each test
    await request.post('http://localhost:3001/api/plans', {
      data: {
        filename: TEST_PLAN_FILENAME,
        content: TEST_PLAN_CONTENT,
      },
    });
  });

  test.afterEach(async ({ request }) => {
    // Clean up: try to delete the test plan if it still exists
    await request.delete(`http://localhost:3001/api/plans/${TEST_PLAN_FILENAME}`).catch(() => {});
  });

  test('should show delete confirmation dialog on detail page', async ({ page }) => {
    // Navigate to the test plan detail page
    await page.goto(`/plan/${TEST_PLAN_FILENAME}`);
    await expect(page.getByRole('heading', { name: 'Test Plan for Delete' }).first()).toBeVisible();

    // Click the more actions menu (three dots button - the last button with an icon)
    const moreButton = page.locator('button').filter({ has: page.locator('svg.lucide-more-vertical') });
    await moreButton.click();

    // Wait for menu to appear and click delete option
    const deleteMenuItem = page.locator('button.text-destructive').filter({ hasText: '削除' });
    await expect(deleteMenuItem).toBeVisible();
    await deleteMenuItem.click();

    // Verify confirmation dialog appears
    await expect(page.getByRole('heading', { name: 'プランを削除' })).toBeVisible();
    await expect(page.getByText('この操作は取り消せません')).toBeVisible();
    await expect(page.getByText(TEST_PLAN_FILENAME).first()).toBeVisible();
  });

  test('should delete plan when confirmed and redirect to home', async ({ page, request }) => {
    // Navigate to the test plan detail page
    await page.goto(`/plan/${TEST_PLAN_FILENAME}`);
    await expect(page.getByRole('heading', { name: 'Test Plan for Delete' }).first()).toBeVisible();

    // Click the more actions menu
    const moreButton = page.locator('button').filter({ has: page.locator('svg.lucide-more-vertical') });
    await moreButton.click();

    // Click delete option
    const deleteMenuItem = page.locator('button.text-destructive').filter({ hasText: '削除' });
    await expect(deleteMenuItem).toBeVisible();
    await deleteMenuItem.click();

    // Wait for dialog to appear then confirm deletion
    const dialogHeading = page.getByRole('heading', { name: 'プランを削除' });
    await expect(dialogHeading).toBeVisible();
    // Find the dialog content area (relative z-10) and click the delete button within it
    const dialogContent = page.locator('div.relative.z-10.bg-background');
    const deleteConfirmButton = dialogContent.getByRole('button', { name: '削除' });
    await expect(deleteConfirmButton).toBeVisible();

    // Wait for network to be idle after clicking delete
    await Promise.all([
      page.waitForResponse((resp) => resp.url().includes('/api/plans/') && resp.request().method() === 'DELETE'),
      deleteConfirmButton.click(),
    ]);

    // Wait for dialog to close
    await expect(dialogHeading).not.toBeVisible({ timeout: 5000 });

    // Wait for redirect to home page
    await expect(page).toHaveURL('/', { timeout: 10000 });

    // Verify via API that plan no longer exists (should return 404)
    const response = await request.get(`http://localhost:3001/api/plans/${TEST_PLAN_FILENAME}`);
    expect(response.status()).toBe(404);
  });

  test('should cancel delete when clicking cancel', async ({ page, request }) => {
    // Navigate to the test plan detail page
    await page.goto(`/plan/${TEST_PLAN_FILENAME}`);
    await expect(page.getByRole('heading', { name: 'Test Plan for Delete' }).first()).toBeVisible();

    // Click the more actions menu
    const moreButton = page.locator('button').filter({ has: page.locator('svg.lucide-more-vertical') });
    await moreButton.click();

    // Click delete option
    const deleteMenuItem = page.locator('button.text-destructive').filter({ hasText: '削除' });
    await expect(deleteMenuItem).toBeVisible();
    await deleteMenuItem.click();

    // Cancel deletion
    await page.getByRole('button', { name: 'キャンセル' }).click();

    // Should still be on the same page
    await expect(page).toHaveURL(`/plan/${TEST_PLAN_FILENAME}`);

    // Verify via API that plan still exists
    const response = await request.get(`http://localhost:3001/api/plans/${TEST_PLAN_FILENAME}`);
    expect(response.ok()).toBeTruthy();
  });
});

test.describe('Bulk delete functionality', () => {
  const BULK_TEST_FILES = ['bulk-delete-test-1.md', 'bulk-delete-test-2.md'];

  test.beforeEach(async ({ request }) => {
    // Create test plans
    for (const filename of BULK_TEST_FILES) {
      await request.post('http://localhost:3001/api/plans', {
        data: {
          filename,
          content: `# ${filename}\n\nTest content for bulk delete.`,
        },
      });
    }
  });

  test.afterEach(async ({ request }) => {
    // Clean up
    for (const filename of BULK_TEST_FILES) {
      await request.delete(`http://localhost:3001/api/plans/${filename}`).catch(() => {});
    }
  });

  test('should bulk delete selected plans', async ({ page, request }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'プラン一覧' })).toBeVisible();

    // Enter selection mode
    await page.getByRole('button', { name: '選択' }).click();

    // Wait for checkboxes to appear
    await page.waitForTimeout(500);

    // Select both test plans by clicking their checkboxes
    for (const filename of BULK_TEST_FILES) {
      const planCard = page.locator('div.rounded-lg.border').filter({ hasText: filename });
      await expect(planCard).toBeVisible();
      const checkbox = planCard.locator('input[type="checkbox"]');
      await checkbox.click();
    }

    // Click bulk delete button (button with text "件を削除")
    const deleteButton = page.getByRole('button').filter({ hasText: '件を削除' });
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();

    // Verify confirmation dialog
    const bulkDialogHeading = page.getByRole('heading', { name: 'プランを一括削除' });
    await expect(bulkDialogHeading).toBeVisible();
    await expect(page.getByText('2件のプランを完全に削除しますか')).toBeVisible();

    // Find dialog container and confirm deletion
    const bulkDialogContent = page.locator('div.relative.z-10.bg-background');
    const bulkConfirmButton = bulkDialogContent.getByRole('button', { name: '削除', exact: true });
    await bulkConfirmButton.click();

    // Wait for deletion to complete
    await page.waitForTimeout(1000);

    // Verify via API that plans no longer exist
    for (const filename of BULK_TEST_FILES) {
      const response = await request.get(`http://localhost:3001/api/plans/${filename}`);
      expect(response.status()).toBe(404);
    }
  });
});
