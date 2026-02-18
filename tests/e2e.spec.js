const { test, expect } = require('@playwright/test');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

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

  // ── New tests ─────────────────────────────────────────────────────────────

  test('Section Navigation: About -> Back to Home', async ({ page }) => {
    // Click the About nav button on the home screen
    await page.locator('#about').click();

    // About section must be visible and home must be hidden
    await expect(page.locator('#about_scroll')).toBeVisible();
    await expect(page.locator('#index')).toBeHidden();

    // Click the "Back to home" link inside the About section
    await page.locator('#about_scroll a[href="#index"]').click();

    // Home returns, About section hides
    await expect(page.locator('#index')).toBeVisible();
    await expect(page.locator('#about_scroll')).toBeHidden();
  });

  test('Easter Egg: show Where To Find Me and return to Resources', async ({ page }) => {
    // Step 1 — navigate to Resources first (Easter egg trigger lives there)
    await page.locator('#resources').click();
    await expect(page.locator('#resources_scroll')).toBeVisible();

    // Step 2 — click the Easter egg trigger button inside Resources
    await page.locator('#where-to-find-me').click();

    // Easter egg section should now be visible; Resources scroll should hide
    await expect(page.locator('#where_to_find_me')).toBeVisible();
    await expect(page.locator('#resources_scroll')).toBeHidden();

    // Step 3 — click the "Back to Resources" button inside the Easter egg section
    await page.locator('#back-to-resources').click();

    // Resources section returns; Easter egg section hides
    await expect(page.locator('#resources_scroll')).toBeVisible();
    await expect(page.locator('#where_to_find_me')).toBeHidden();
  });

  test('Contact form: rejects empty submission and marks fields invalid', async ({ page }) => {
    // Navigate to the Contact section
    await page.locator('#contact').click();
    await expect(page.locator('#contact_scroll')).toBeVisible();

    // Disable native HTML5 validation so our custom JS validation in handleSubmit runs
    await page.evaluate(() => {
      document.getElementById('contactForm').setAttribute('novalidate', '');
    });

    // Click submit without filling any fields
    await page.locator('#contactForm button[type="submit"]').click();

    // At least the first required input should be marked invalid by our JS validation
    const firstRequired = page
      .locator('#contactForm input[required], #contactForm textarea[required]')
      .first();
    await expect(firstRequired).toHaveAttribute('aria-invalid', 'true');
    await expect(firstRequired).toHaveClass(/is-invalid/);
  });

  test('Contact form: rejects invalid email format', async ({ page }) => {
    // Navigate to the Contact section
    await page.locator('#contact').click();
    await expect(page.locator('#contact_scroll')).toBeVisible();

    // Disable native HTML5 validation so our custom JS email validation runs
    await page.evaluate(() => {
      document.getElementById('contactForm').setAttribute('novalidate', '');
    });

    // Fill name and message (valid), but enter a bad email
    await page
      .locator('#contactForm input[name="name"], #contactForm input[type="text"]')
      .first()
      .fill('Test User');
    await page.locator('#contactForm input[type="email"]').fill('notanemail');
    await page.locator('#contactForm textarea').fill('Hello world');

    // Submit the form
    await page.locator('#contactForm button[type="submit"]').click();

    // Email input should be flagged as invalid by our isValidEmail() function
    const emailInput = page.locator('#contactForm input[type="email"]');
    await expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    await expect(emailInput).toHaveClass(/is-invalid/);
  });

  test('Theme toggle persists theme choice to localStorage', async ({ page }) => {
    const html = page.locator('html');
    const initial = await html.getAttribute('data-theme');
    const expected = initial === 'dark' ? 'light' : 'dark';

    // Click the theme toggle button
    await page.locator('.theme-toggle').click();

    // Verify the DOM attribute flipped
    await expect(html).toHaveAttribute('data-theme', expected);

    // Verify localStorage was updated to match
    const stored = await page.evaluate(() => localStorage.getItem('theme'));
    expect(stored).toBe(expected);
  });
});
