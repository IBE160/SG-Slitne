// E2E Tests: Project Operations
// Tests project creation, assignment, and filtering

import { test, expect } from '@playwright/test';

test.describe('Project Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should create a new project', async ({ page }) => {
    // Click "New Project" button
    await page.click('button:has-text("+ New Project")');

    // Fill in project details
    await page.fill('input[placeholder*="project name"]', 'E2E Test Project');
    await page.fill('textarea[placeholder*="description"]', 'Project created by E2E test');

    // Select a color
    await page.locator('input[type="color"]').fill('#FF5733');

    // Create the project
    await page.click('button:has-text("Create")');

    // Verify project appears in the list
    await expect(page.locator('text=E2E Test Project')).toBeVisible();
  });

  test('should assign task to project', async ({ page }) => {
    // First create a project
    await page.click('button:has-text("+ New Project")');
    await page.fill('input[placeholder*="project name"]', 'Assignment Project');
    await page.click('button:has-text("Create")');

    // Create a task and assign to project
    await page.click('button:has-text("+ Add New Task")');
    await page.fill('input[placeholder*="Task title"]', 'Task with Project');
    await page.selectOption('select[aria-label*="Project"]', 'Assignment Project');
    await page.click('button:has-text("Add Task")');

    // Verify task shows project badge
    const taskRow = page.locator('text=Task with Project').locator('..');
    await expect(taskRow.locator('text=Assignment Project')).toBeVisible();
  });

  test('should filter tasks by project', async ({ page }) => {
    // Create two projects
    await page.click('button:has-text("+ New Project")');
    await page.fill('input[placeholder*="project name"]', 'Project A');
    await page.click('button:has-text("Create")');

    await page.click('button:has-text("+ New Project")');
    await page.fill('input[placeholder*="project name"]', 'Project B');
    await page.click('button:has-text("Create")');

    // Create tasks in different projects
    await page.click('button:has-text("+ Add New Task")');
    await page.fill('input[placeholder*="Task title"]', 'Task in Project A');
    await page.selectOption('select[aria-label*="Project"]', 'Project A');
    await page.click('button:has-text("Add Task")');

    await page.click('button:has-text("+ Add New Task")');
    await page.fill('input[placeholder*="Task title"]', 'Task in Project B');
    await page.selectOption('select[aria-label*="Project"]', 'Project B');
    await page.click('button:has-text("Add Task")');

    // Filter by Project A
    await page.selectOption('select[id="filterProject"]', 'Project A');

    // Verify only Project A task is visible
    await expect(page.locator('text=Task in Project A')).toBeVisible();
    await expect(page.locator('text=Task in Project B')).not.toBeVisible();
  });

  test('should use bulk operations to move tasks to project', async ({ page }) => {
    // Create a project
    await page.click('button:has-text("+ New Project")');
    await page.fill('input[placeholder*="project name"]', 'Bulk Move Project');
    await page.click('button:has-text("Create")');

    // Create multiple tasks without project
    await page.click('button:has-text("+ Add New Task")');
    await page.fill('input[placeholder*="Task title"]', 'Task 1');
    await page.click('button:has-text("Add Task")');

    await page.click('button:has-text("+ Add New Task")');
    await page.fill('input[placeholder*="Task title"]', 'Task 2');
    await page.click('button:has-text("Add Task")');

    // Enter selection mode
    await page.click('button:has-text("Select Tasks")');

    // Select both tasks
    await page.locator('text=Task 1').locator('..').locator('input[type="checkbox"]').click();
    await page.locator('text=Task 2').locator('..').locator('input[type="checkbox"]').click();

    // Move to project using bulk actions
    await page.selectOption('select:has-text("Move to...")', 'Bulk Move Project');

    // Exit selection mode
    await page.click('button:has-text("Exit Selection")');

    // Verify both tasks show project badge
    await expect(page.locator('text=Task 1').locator('..').locator('text=Bulk Move Project')).toBeVisible();
    await expect(page.locator('text=Task 2').locator('..').locator('text=Bulk Move Project')).toBeVisible();
  });

  test('should toggle project dashboard visibility', async ({ page }) => {
    // Create a project
    await page.click('button:has-text("+ New Project")');
    await page.fill('input[placeholder*="project name"]', 'Dashboard Test');
    await page.click('button:has-text("Create")');

    // Verify project is visible
    await expect(page.locator('text=Dashboard Test')).toBeVisible();

    // Find and click collapse button
    await page.locator('button[aria-label*="Collapse"]').click();

    // Verify project details are hidden (but header remains)
    const projectDetails = page.locator('text=Dashboard Test').locator('..');
    await expect(projectDetails).not.toBeVisible();

    // Expand again
    await page.locator('button[aria-label*="Expand"]').click();

    // Verify project details are visible again
    await expect(page.locator('text=Dashboard Test')).toBeVisible();
  });
});
