import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the main heading', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toContainText('YouTube Video Knowledge Extractor');
  });

  test('should have a URL input field', async ({ page }) => {
    const input = page.getByPlaceholder(/youtube\.com/i);
    await expect(input).toBeVisible();
  });

  test('should have a summarize button', async ({ page }) => {
    const button = page.getByRole('button', { name: /summarize/i });
    await expect(button).toBeVisible();
  });

  test('should disable button when input is empty', async ({ page }) => {
    const button = page.getByRole('button', { name: /summarize/i });
    await expect(button).toBeDisabled();
  });

  test('should enable button when URL is entered', async ({ page }) => {
    const input = page.getByPlaceholder(/youtube\.com/i);
    const button = page.getByRole('button', { name: /summarize/i });
    
    await input.fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    await expect(button).toBeEnabled();
  });

  test('should show error for invalid URL', async ({ page }) => {
    const input = page.getByPlaceholder(/youtube\.com/i);
    const button = page.getByRole('button', { name: /summarize/i });
    
    await input.fill('https://example.com/not-youtube');
    await button.click();
    
    // Wait for error message
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 10000 });
  });

  test('should be accessible', async ({ page }) => {
    // Check for skip to content link
    const skipLink = page.getByText('Skip to main content');
    await expect(skipLink).toBeAttached();
    
    // Check for proper heading hierarchy
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();
    
    // Check for form accessibility
    const input = page.getByRole('textbox');
    await expect(input).toHaveAttribute('aria-label');
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    
    const input = page.getByPlaceholder(/youtube\.com/i);
    await expect(input).toBeVisible();
  });
});
