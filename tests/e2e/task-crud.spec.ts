// E2E Tests: Task CRUD Operations
// Tests critical user journey for creating, editing, and deleting tasks

import { test, expect } from '@playwright/test';

test.describe('Task CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for app to initialize
    await page.waitForLoadState('networkidle');
  });

  test('should create a new task', async ({ page }) => {
    // Click the "Add New Task" button
    await page.click('button:has-text("+ Add New Task")');

    // Fill in task details
    await page.fill('input[placeholder*="Task title"]', 'E2E Test Task');
    await page.fill('textarea[placeholder*="description"]', 'This is a test task created by E2E');

    // Select priority
    await page.selectOption('select', '3'); // High priority

    // Submit the form
    await page.click('button:has-text("Add Task")');

    // Verify task appears in the list
    await expect(page.locator('text=E2E Test Task')).toBeVisible();
  });

  test('should edit an existing task', async ({ page }) => {
    // First create a task
    await page.click('button:has-text("+ Add New Task")');
    await page.fill('input[placeholder*="Task title"]', 'Task to Edit');
    await page.click('button:has-text("Add Task")');

    // Find and click the task to expand/edit
    await page.click('text=Task to Edit');

    // Edit the title
    const titleInput = page.locator('input[value="Task to Edit"]');
    await titleInput.clear();
    await titleInput.fill('Updated Task Title');

    // Save changes
    await page.click('button:has-text("Save")');

    // Verify the update
    await expect(page.locator('text=Updated Task Title')).toBeVisible();
    await expect(page.locator('text=Task to Edit')).not.toBeVisible();
  });

  test('should delete a task', async ({ page }) => {
    // Create a task to delete
    await page.click('button:has-text("+ Add New Task")');
    await page.fill('input[placeholder*="Task title"]', 'Task to Delete');
    await page.click('button:has-text("Add Task")');

    // Verify task exists
    await expect(page.locator('text=Task to Delete')).toBeVisible();

    // Find and click delete button
    const taskRow = page.locator('text=Task to Delete').locator('..');
    await taskRow.hover();
    await taskRow.locator('button[aria-label*="Delete"]').click();

    // Confirm deletion in dialog
    await page.click('button:has-text("Delete")');

    // Verify task is removed
    await expect(page.locator('text=Task to Delete')).not.toBeVisible();
  });

  test('should mark task as complete', async ({ page }) => {
    // Create a task
    await page.click('button:has-text("+ Add New Task")');
    await page.fill('input[placeholder*="Task title"]', 'Task to Complete');
    await page.click('button:has-text("Add Task")');

    // Click the checkbox to mark complete
    const taskRow = page.locator('text=Task to Complete').locator('..');
    await taskRow.locator('input[type="checkbox"]').click();

    // Verify task is marked complete (might have strikethrough or moved to completed section)
    const completedTask = page.locator('text=Task to Complete');
    await expect(completedTask).toHaveCSS('text-decoration', /line-through/);
  });

  test('should filter tasks by priority', async ({ page }) => {
    // Create tasks with different priorities
    await page.click('button:has-text("+ Add New Task")');
    await page.fill('input[placeholder*="Task title"]', 'High Priority Task');
    await page.selectOption('select', '3');
    await page.click('button:has-text("Add Task")');

    await page.click('button:has-text("+ Add New Task")');
    await page.fill('input[placeholder*="Task title"]', 'Low Priority Task');
    await page.selectOption('select', '1');
    await page.click('button:has-text("Add Task")');

    // Filter by high priority
    await page.click('button:has-text("High")');

    // Verify only high priority task is visible
    await expect(page.locator('text=High Priority Task')).toBeVisible();
    await expect(page.locator('text=Low Priority Task')).not.toBeVisible();

    // Clear filter
    await page.click('button:has-text("All")');

    // Verify both tasks are visible
    await expect(page.locator('text=High Priority Task')).toBeVisible();
    await expect(page.locator('text=Low Priority Task')).toBeVisible();
  });
});
