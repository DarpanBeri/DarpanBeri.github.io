const { test, expect } = require('@playwright/test');
const path = require('node:path');
const fs = require('node:fs');
const { pathToFileURL } = require('node:url');

// Build a file:// URL to the local index.html
const fileUrl = pathToFileURL(path.resolve(__dirname, '../index.html')).toString();
const repoRoot = path.resolve(__dirname, '..');

// Helpers
async function activeDotIndex(page) {
  return page.$$eval('#owl-demo .carousel__dot', (dots) =>
    dots.findIndex((d) => d.getAttribute('aria-current') === 'true')
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

  test('form-status starts hidden via CSS, without an inline style attribute', async ({ page }) => {
    const status = page.locator('#form-status');
    // A strict style-src blocks inline `style="..."` attributes, so there must be none.
    expect(await status.getAttribute('style')).toBeNull();
    // It must still be hidden on load (now enforced by a CSS rule, not the attribute).
    await expect(status).toBeHidden();
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

    // Wait for Work section and carousel to be visible
    await expect(page.locator('#work_scroll')).toBeVisible();
    await expect(page.locator('#owl-demo')).toBeVisible();

    // Prev/next arrows exist (visible on desktop viewport)
    const nextArrow = page.locator('#owl-demo .carousel__arrow--next');
    const prevArrow = page.locator('#owl-demo .carousel__arrow--prev');
    await expect(nextArrow).toBeVisible();
    await expect(prevArrow).toBeVisible();

    // Dots are rendered, one per slide, first is current
    const dots = page.locator('#owl-demo .carousel__dot');
    await expect(dots).not.toHaveCount(0);

    // A carousel image is visible
    await expect(page.locator('#owl-demo img.img-rabbit').first()).toBeVisible();

    // Capture active dot index, click next, and verify it changed
    const before = await activeDotIndex(page);
    await nextArrow.click();
    await expect.poll(() => activeDotIndex(page)).not.toBe(before);
  });

  test('Carousel: one labeled dot per slide from data-dot', async ({ page }) => {
    await page.locator('#work').click();
    await expect(page.locator('#owl-demo')).toBeVisible();

    const slideCount = await page.locator('#owl-demo .carousel__track .item').count();
    const dots = page.locator('#owl-demo .carousel__dot');
    await expect(dots).toHaveCount(slideCount);

    // Each dot's accessible name comes from its slide's data-dot attribute
    const dotLabels = await dots.evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')));
    const slideDots = await page
      .locator('#owl-demo .carousel__track .item')
      .evaluateAll((els) => els.map((e) => e.getAttribute('data-dot')));
    expect(dotLabels).toEqual(slideDots);
    // Exactly one dot is current
    const currentCount = await dots.evaluateAll(
      (els) => els.filter((e) => e.getAttribute('aria-current') === 'true').length
    );
    expect(currentCount).toBe(1);
  });

  test('Carousel: prev arrow navigates to a different slide', async ({ page }) => {
    await page.locator('#work').click();
    await expect(page.locator('#owl-demo')).toBeVisible();

    const prevArrow = page.locator('#owl-demo .carousel__arrow--prev');
    await expect(prevArrow).toBeVisible();

    const before = await activeDotIndex(page);
    await prevArrow.click();
    // prev from slide 0 wraps to the last slide; any change confirms navigation
    await expect.poll(() => activeDotIndex(page)).not.toBe(before);
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

  test('Easter Egg: Escape returns to Resources (regression)', async ({ page }) => {
    await page.locator('#resources').click();
    await expect(page.locator('#resources_scroll')).toBeVisible();
    await page.locator('#where-to-find-me').click();
    await expect(page.locator('#where_to_find_me')).toBeVisible();

    // Press Escape (bound on document, so focus location doesn't matter)
    await page.keyboard.press('Escape');

    // Returns to Resources, and the two sections are not both visible
    await expect(page.locator('#resources_scroll')).toBeVisible();
    await expect(page.locator('#where_to_find_me')).toBeHidden();
  });

  test('Navigation resets scroll to top of the new section (regression)', async ({ page }) => {
    // The real scroll container here is <body> (body{overflow:auto}); scroll it down.
    await page.evaluate(() => {
      document.body.scrollTop = 300;
      document.documentElement.scrollTop = 300;
      window.scrollTo(0, 300);
    });
    await page.locator('#about').click();
    await expect(page.locator('#about_scroll')).toBeVisible();

    // The actual scroller (body) must be reset so the section top is in view.
    const scrolls = await page.evaluate(() => ({
      body: document.body.scrollTop,
      docEl: document.documentElement.scrollTop,
      window: window.scrollY,
    }));
    expect(scrolls.body).toBe(0);
    expect(scrolls.docEl).toBe(0);
    expect(scrolls.window).toBe(0);
  });

  test('Back to home from a scrolled section shows home content, not an empty page (regression)', async ({
    page,
  }) => {
    // Short viewport guarantees content overflows so <body> is actually scrollable
    await page.setViewportSize({ width: 1280, height: 500 });
    await page.locator('#work').click();
    await expect(page.locator('#work_scroll')).toBeVisible();
    const scrolledTo = await page.evaluate(() => {
      document.body.scrollTop = 400;
      document.documentElement.scrollTop = 400;
      window.scrollTo(0, 400);
      return Math.max(document.body.scrollTop, document.documentElement.scrollTop, window.scrollY);
    });
    // Precondition: the page really did scroll (otherwise the test is meaningless)
    expect(scrolledTo).toBeGreaterThan(0);

    // Use the persistent fixed button (needs no scroll-into-view — the clean repro)
    await page.locator('.go-back-home').click();

    await expect(page.locator('#index')).toBeVisible();
    // Home must render at the top: its first content is within the viewport, not scrolled away
    const state = await page.evaluate(() => {
      const idx = document.querySelector('#index');
      const rect = idx.getBoundingClientRect();
      const center = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
      return {
        bodyScroll: Math.max(
          document.body.scrollTop,
          document.documentElement.scrollTop,
          window.scrollY
        ),
        indexTop: Math.round(rect.top),
        centerInsideIndex: !!(center && center.closest('#index')),
        opacity: getComputedStyle(idx).opacity,
      };
    });
    expect(state.bodyScroll).toBe(0);
    expect(state.indexTop).toBeGreaterThanOrEqual(0);
    expect(state.centerInsideIndex).toBe(true); // viewport center is inside home content, not blank
    // Home must be actually painted — a prior fade('out') left opacity:0, which
    // toBeVisible()/elementFromPoint do NOT catch. This is the real "empty page" guard.
    expect(state.opacity).toBe('1');
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

  test('Contact form: Send button is not locked after an invalid-email submit (regression)', async ({
    page,
  }) => {
    await page.locator('#contact').click();
    await expect(page.locator('#contact_scroll')).toBeVisible();
    await page.evaluate(() =>
      document.getElementById('contactForm').setAttribute('novalidate', '')
    );

    // "foo@bar" passes native HTML5 email validation but fails isValidEmail()
    await page.locator('#contactForm input[type="email"]').fill('foo@bar');
    const submit = page.locator('#contactForm button[type="submit"]');
    await submit.click();

    // The button must stay interactive — not stuck in the .btn-loading (pointer-events:none) state
    await expect(submit).not.toHaveClass(/btn-loading/);
    await expect(submit).toBeEnabled();
    const pe = await submit.evaluate((el) => getComputedStyle(el).pointerEvents);
    expect(pe).not.toBe('none');
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

test.describe('Issue #19: debug scaffolding removed', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(fileUrl, { waitUntil: 'load' });
  });

  test('no diagnostic HUD overlay is present on load', async ({ page }) => {
    // The HUD is fully removed; wait a beat to also catch any late/async re-injection, then assert absence.
    await page.waitForTimeout(1000);
    await expect(page.locator('#diag-hud')).toHaveCount(0);
  });

  test('no inline goToHome onclick handlers remain', async ({ page }) => {
    await expect(page.locator('[onclick]')).toHaveCount(0);
  });

  test('persistent "Go Back to Home" button still returns to #index', async ({ page }) => {
    await page.locator('#work').click();
    await expect(page.locator('#work_scroll')).toBeVisible();
    await page.locator('.go-back-home').click();
    await expect(page.locator('#index')).toBeVisible();
  });

  test('an intentional CSP meta is present (replaces the removed #19 SAFE-MODE policy)', async ({
    page,
  }) => {
    const meta = page.locator('meta[http-equiv="Content-Security-Policy"]');
    await expect(meta).toHaveCount(1);
    const content = (await meta.getAttribute('content')) || '';
    // The #19 bug was a script-src that failed to allow the app's own origin.
    // The replacement policy must always permit same-origin scripts.
    expect(content).toMatch(/script-src 'self'/);
  });

  test('Google Analytics is not loaded', async ({ page }) => {
    await expect(page.locator('script[src*="googletagmanager.com"]')).toHaveCount(0);
    const hasGtag = await page.evaluate(() => typeof window.gtag !== 'undefined');
    expect(hasGtag).toBe(false);
  });

  test('no jQuery or Bootstrap JavaScript is loaded', async ({ page }) => {
    // No <script> should reference bootstrap*.js or jquery*.js
    const libScripts = await page.$$eval('script[src]', (els) =>
      els
        .map((e) => e.getAttribute('src'))
        .filter((s) => /(bootstrap|jquery)[^/]*\.js/i.test(s || ''))
    );
    expect(libScripts).toEqual([]);
    // jQuery global must be absent (removed during modernization)
    const hasJQuery = await page.evaluate(() => typeof window.jQuery !== 'undefined');
    expect(hasJQuery).toBe(false);
    // The only runtime script is the app's own script.js
    const cdnScripts = await page.$$eval('script[src]', (els) =>
      els.map((e) => e.getAttribute('src')).filter((s) => /^https?:/i.test(s || ''))
    );
    expect(cdnScripts).toEqual([]);
  });

  test('all target="_blank" links carry rel="noopener noreferrer"', async ({ page }) => {
    const unhardened = await page.$$eval(
      'a[target="_blank"]',
      (links) =>
        links.filter((a) => {
          const rel = (a.getAttribute('rel') || '').toLowerCase();
          return !(rel.includes('noopener') && rel.includes('noreferrer'));
        }).length
    );
    expect(unhardened).toBe(0);
  });
});

test.describe('accessibility landmarks', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(fileUrl, { waitUntil: 'load' });
  });

  test('page has exactly one level-one heading with the site name', async ({ page }) => {
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText('Darpan Beri');
  });

  test('top controls live inside a header landmark', async ({ page }) => {
    await expect(page.locator('header')).toHaveCount(1);
    await expect(page.locator('header .theme-toggle')).toHaveCount(1);
    await expect(page.locator('header a.skip-to-main')).toHaveCount(1);
  });

  test('skip link is focusable and targets main', async ({ page }) => {
    const skip = page.locator('a.skip-to-main');
    await expect(skip).toHaveAttribute('href', '#index');
    await skip.focus();
    await expect(skip).toBeFocused();
  });
});

test.describe('SEO & head assets', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(fileUrl, { waitUntil: 'load' });
  });

  test('SVG favicon is linked in the head', async ({ page }) => {
    const icon = page.locator('link[rel="icon"]');
    await expect(icon).toHaveCount(1);
    await expect(icon).toHaveAttribute('type', 'image/svg+xml');
    await expect(icon).toHaveAttribute('href', 'favicon.svg');
  });

  test('preconnect hints for CDN and font origins are present', async ({ page }) => {
    // cdnjs (SRI stylesheets) and fonts.gstatic (CORS font fetches) are requested
    // cross-origin, so their preconnect must carry `crossorigin`; fonts.googleapis
    // (a plain CSS request) must NOT — a mismatch opens a wasteful second connection.
    const crossorigin = ['https://cdnjs.cloudflare.com', 'https://fonts.gstatic.com'];
    const sameorigin = ['https://fonts.googleapis.com'];

    for (const href of [...crossorigin, ...sameorigin]) {
      await expect(page.locator(`link[rel="preconnect"][href="${href}"]`)).toHaveCount(1);
    }
    for (const href of crossorigin) {
      await expect(page.locator(`link[rel="preconnect"][href="${href}"]`)).toHaveAttribute(
        'crossorigin',
        ''
      );
    }
    for (const href of sameorigin) {
      expect(
        await page.locator(`link[rel="preconnect"][href="${href}"]`).getAttribute('crossorigin')
      ).toBeNull();
    }
  });

  test('canonical link points at the production origin', async ({ page }) => {
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://darpanberi.github.io'
    );
  });

  test('favicon.svg is a valid SVG file', () => {
    const svg = fs.readFileSync(path.join(repoRoot, 'favicon.svg'), 'utf8');
    expect(svg).toMatch(/<svg[\s>]/);
    expect(svg).toContain('viewBox="0 0 64 64"');
  });

  test('robots.txt allows crawling and references the sitemap', () => {
    const robots = fs.readFileSync(path.join(repoRoot, 'robots.txt'), 'utf8');
    expect(robots).toMatch(/^User-agent:\s*\*/m);
    expect(robots).toContain('Sitemap: https://darpanberi.github.io/sitemap.xml');
  });

  test('sitemap.xml lists the canonical URL', () => {
    const sitemap = fs.readFileSync(path.join(repoRoot, 'sitemap.xml'), 'utf8');
    expect(sitemap).toContain('<loc>https://darpanberi.github.io/</loc>');
  });
});

test.describe('Content-Security-Policy', () => {
  test('policy is hardened and correctly scoped to real dependencies', async ({ page }) => {
    await page.goto(fileUrl, { waitUntil: 'load' });
    const meta = page.locator('meta[http-equiv="Content-Security-Policy"]');
    await expect(meta).toHaveCount(1);
    const content = (await meta.getAttribute('content')) || '';

    // No inline/eval escape hatches anywhere in the policy.
    expect(content).not.toContain('unsafe-inline');
    expect(content).not.toContain('unsafe-eval');

    // Scripts: same-origin only (script.js). This is the exact #19 fix.
    expect(content).toMatch(/script-src 'self'/);

    // Styles: self + the two CSS origins actually loaded (animate.css/Font Awesome, Google Fonts).
    expect(content).toMatch(/style-src[^;]*'self'/);
    expect(content).toMatch(/style-src[^;]*https:\/\/cdnjs\.cloudflare\.com/);
    expect(content).toMatch(/style-src[^;]*https:\/\/fonts\.googleapis\.com/);

    // Fonts: Font Awesome webfonts (cdnjs) + Google woff2 (gstatic).
    expect(content).toMatch(/font-src[^;]*https:\/\/cdnjs\.cloudflare\.com/);
    expect(content).toMatch(/font-src[^;]*https:\/\/fonts\.gstatic\.com/);

    // Contact form endpoint must be reachable via fetch and native submit.
    expect(content).toMatch(/connect-src[^;]*https:\/\/formspree\.io/);
    expect(content).toMatch(/form-action[^;]*https:\/\/formspree\.io/);

    // Lockdown backstops.
    expect(content).toMatch(/object-src 'none'/);
    expect(content).toMatch(/base-uri 'self'/);
  });

  test('no CSP violations fire during a full interaction pass', async ({ page }) => {
    // NOTE: the e2e suite runs via file://, where browsers enforce CSP unreliably,
    // so this is a best-effort safety net — the authoritative runtime check is the
    // served-origin chrome-devtools pass in Task 3. Listeners must attach before goto.
    const violations = [];
    page.on('console', (msg) => {
      const t = msg.text();
      if (/Content Security Policy|Refused to (load|apply|execute|connect|create)/i.test(t)) {
        violations.push(t);
      }
    });
    page.on('pageerror', (err) => {
      if (/Content Security Policy/i.test(err.message)) violations.push(err.message);
    });

    await page.goto(fileUrl, { waitUntil: 'load' });

    // Exercise fade()/element.style writes + CDN-backed assets.
    await page.locator('#work').click();
    await expect(page.locator('#work_scroll')).toBeVisible();
    await page.locator('#owl-demo .carousel__dot').nth(1).click();
    await page.locator('.go-back-home').click();
    await expect(page.locator('#index')).toBeVisible();
    await page.locator('.theme-toggle').click();
    await page.locator('#contact').click();
    await expect(page.locator('#contact_scroll')).toBeVisible();

    expect(violations).toEqual([]);
  });
});

test.describe('Image optimization', () => {
  test('contact uses an autoplay muted loop video, not the old GIF', async ({ page }) => {
    await page.goto(fileUrl, { waitUntil: 'load' });

    const video = page.locator('#contact_left video');
    await expect(video).toHaveCount(1);
    await expect(video).toHaveAttribute('autoplay', '');
    await expect(video).toHaveAttribute('muted', '');
    await expect(video).toHaveAttribute('loop', '');
    await expect(video).toHaveAttribute('playsinline', '');
    await expect(video).toHaveAttribute('poster', /contact-poster\.jpg/);

    // Must offer an MP4 source (the guaranteed-support path).
    await expect(page.locator('#contact_left video source[type="video/mp4"]')).toHaveCount(1);

    // The old animated GIF must be gone from the DOM entirely.
    const html = await page.content();
    expect(html).not.toContain('contact.GIF');
  });

  test('CSP explicitly allows self-hosted media', async ({ page }) => {
    await page.goto(fileUrl, { waitUntil: 'load' });
    const meta = page.locator('meta[http-equiv="Content-Security-Policy"]');
    const content = (await meta.getAttribute('content')) || '';
    expect(content).toMatch(/media-src 'self'/);
  });
});
