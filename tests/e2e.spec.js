const { test, expect } = require('@playwright/test');
const path = require('path');
const { pathToFileURL } = require('url');

// Build a file:// URL to the local index.html
const fileUrl = pathToFileURL(path.resolve(__dirname, '../index.html')).toString();

// Helpers
async function activeDotIndex(page) {
  return page.$$eval('#owl-demo .owl-dot', (dots) =>
    dots.findIndex((d) => d.classList.contains('active'))
  );
}

test.describe('Portfolio E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(fileUrl, { waitUntil: 'load' });
  });

  test('Page Load & Initial State', async ({ page }) => {
    // Verify document title
    await expect(page).toHaveTitle('Darpan Beri | Data Science & Software Engineering Portfolio');

    // Buttons visible
    await expect(page.locator('#about')).toBeVisible();
    await expect(page.locator('#work')).toBeVisible();
    await expect(page.locator('#resources')).toBeVisible();
    await expect(page.locator('#contact')).toBeVisible();

    // Home (index) visible initially
    await expect(page.locator('#index')).toBeVisible();
  });

  test('Section Navigation: Work -> Back to Home', async ({ page }) => {
    // Navigate to Work
    await page.locator('#work').click();

    // Wait for Work section visible and Home hidden
    await expect(page.locator('#work_scroll')).toBeVisible();
    await expect(page.locator('#index')).toBeHidden();

    // Click the per-section "Back to home" link
    await page.locator('#work_scroll a[href="#index"]').click();

    // Back to Home
    await expect(page.locator('#index')).toBeVisible();
    await expect(page.locator('#work_scroll')).toBeHidden();
  });

  test('Section Navigation: Resources -> Back to Home', async ({ page }) => {
    await page.locator('#resources').click();
    await expect(page.locator('#resources_scroll')).toBeVisible();
    await expect(page.locator('#index')).toBeHidden();

    await page.locator('#resources_scroll a[href="#index"]').click();

    await expect(page.locator('#index')).toBeVisible();
    await expect(page.locator('#resources_scroll')).toBeHidden();
  });

  test('Section Navigation: Contact -> Back to Home', async ({ page }) => {
    await page.locator('#contact').click();
    await expect(page.locator('#contact_scroll')).toBeVisible();
    await expect(page.locator('#index')).toBeHidden();

    await page.locator('#contact_scroll a[href="#index"]').click();

    await expect(page.locator('#index')).toBeVisible();
    await expect(page.locator('#contact_scroll')).toBeHidden();
  });

  test('Carousel Functionality in Work', async ({ page }) => {
    await page.locator('#work').click();

    // Wait for Work section and carousel to initialize
    await expect(page.locator('#work_scroll')).toBeVisible();
    await expect(page.locator('#owl-demo')).toBeVisible();

    // Wait for nav to appear (lazy init)
    const nextArrow = page.locator('#owl-demo .owl-next');
    const prevArrow = page.locator('#owl-demo .owl-prev');
    await expect(nextArrow).toBeVisible();
    await expect(prevArrow).toBeVisible();

    // Assert currently active slide's image is visible
    const activeSlide = page.locator('#owl-demo .owl-item.active');
    await expect(activeSlide).toBeVisible();
    const activeImg = activeSlide.locator('img.img-rabbit').first();
    await expect(activeImg).toBeVisible();

    // Capture active dot index, click next, and verify it changed
    const before = await activeDotIndex(page);
    await nextArrow.click();
    await expect.poll(() => activeDotIndex(page)).not.toBe(before);

    // Assert new active slide's image is visible
    const newActiveSlide = page.locator('#owl-demo .owl-item.active');
    await expect(newActiveSlide).toBeVisible();
    const newActiveImg = newActiveSlide.locator('img.img-rabbit').first();
    await expect(newActiveImg).toBeVisible();
  });

  test('Theme Toggle switches data-theme', async ({ page }) => {
    const html = page.locator('html');
    const initial = await html.getAttribute('data-theme');

    // Ensure initial is either 'light' or 'dark'
    expect(['light', 'dark']).toContain(initial);

    const toggle = page.locator('.theme-toggle');
    await expect(toggle).toBeVisible();

    await toggle.click();

    await expect.poll(async () => (await html.getAttribute('data-theme')) || '').not.toBe(initial);
  });
});
