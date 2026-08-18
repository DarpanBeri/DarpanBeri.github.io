// Email validation function available for both tests and runtime
function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const value = String(email).trim();
  // Basic shape: local@domain.tld with no leading/trailing dot in local or domain and TLD length >= 2
  const basic =
    /^[A-Za-z0-9](?:[A-Za-z0-9._%+-]*[A-Za-z0-9])?@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z]{2,})+$/;
  if (!basic.test(value)) return false;
  // Disallow consecutive dots anywhere
  if (value.includes('..')) return false;
  // Extra guard: disallow dot immediately before or after @
  if (/\.@/.test(value) || /@\./.test(value)) return false;
  return true;
}

// Helper function for GA4 event tracking (outer scope for reusability)
function trackEvent(eventName, params = {}) {
  if (typeof gtag === 'function') {
    gtag('event', eventName, params);
  }
}

// Theme initialization function (exported for tests)
function initializeTheme() {
  const savedTheme = globalThis.localStorage?.getItem('theme') ?? null;
  const theme = savedTheme || 'light'; // default to light
  if (globalThis.document?.documentElement) {
    globalThis.document.documentElement.dataset.theme = theme;
  }
  return theme;
}

// Visibility check (replaces jQuery :visible). jsdom-safe.
function isVisible(el) {
  if (!el) return false;
  if (el.hidden) return false;
  if (el.style && el.style.display === 'none') return false;
  const cs = globalThis.getComputedStyle?.(el);
  if (cs && cs.display === 'none') return false;
  return true;
}

// Fade helper (replaces jQuery fadeIn/fadeOut). Synchronous show/hide that
// preserves the final visibility state and fires the optional callback in the
// same order the old fadeIn(400, cb)/fadeOut(400, cb) did. (Animation is
// cosmetic; correctness depends only on end state + callback ordering.)
function fade(el, dir, onDone) {
  if (el) {
    if (dir === 'in') {
      el.hidden = false;
      // Explicit block (not '') so it overrides CSS rules like `.pages { display: none }`,
      // matching jQuery fadeIn which set an inline display value.
      el.style.display = 'block';
      el.style.opacity = '1';
    } else {
      el.style.opacity = '0';
      // Explicit display:none (not just the hidden attr) so it overrides author CSS
      // like `#index { display: block }`, matching jQuery fadeOut.
      el.style.display = 'none';
      el.hidden = true;
    }
  }
  if (onDone) onDone();
}

// Wrap all browser-specific code to avoid executing in Node/Jest.
// Runs in a real browser (no CommonJS `module`), or when a test explicitly
// opts in by defining globalThis.$ (a test-only signal — no runtime jQuery dep).
if (
  globalThis.window !== undefined &&
  globalThis.document !== undefined &&
  (typeof module === 'undefined' || globalThis.$ !== undefined)
) {
  // Initialize theme handling before DOM ready
  initializeTheme();

  const onReady = function () {
    // Hide all pages except index initially
    [
      '#about_scroll',
      '#work_scroll',
      '#resources_scroll',
      '#contact_scroll',
      '#where_to_find_me',
    ].forEach((sel) => {
      const el = document.querySelector(sel);
      if (el) {
        el.hidden = true;
        el.style.display = 'none';
      }
    });

    // Vanilla scroll-snap carousel (replaces Owl). Framework-free by design.
    function initCarousel(root) {
      if (!root) return;
      const track = root.querySelector('.carousel__track');
      const slides = Array.from(root.querySelectorAll('.item'));
      const dotsWrap = root.querySelector('.carousel__dots');
      const prev = root.querySelector('.carousel__arrow--prev');
      const next = root.querySelector('.carousel__arrow--next');
      if (!track || slides.length === 0) return;

      const reduceMotion = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      let current = 0;

      // Build dots from each slide's data-dot label
      const dots = slides.map((slide, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'carousel__dot';
        const label = slide.getAttribute('data-dot') || `Slide ${i + 1}`;
        dot.setAttribute('aria-label', label);
        dot.setAttribute('aria-current', i === 0 ? 'true' : 'false');
        dot.addEventListener('click', () => goTo(i));
        dotsWrap?.appendChild(dot);
        return dot;
      });

      function setActive(i) {
        current = i;
        dots.forEach((d, di) => d.setAttribute('aria-current', di === i ? 'true' : 'false'));
        trackEvent('carousel_slide', { slide_index: i });
      }

      function goTo(i) {
        const clamped = (i + slides.length) % slides.length; // loop
        // Scroll the track only (not the page) — each slide is 100% of track width.
        track.scrollTo({
          left: clamped * track.clientWidth,
          behavior: reduceMotion ? 'auto' : 'smooth',
        });
        setActive(clamped);
      }

      prev?.addEventListener('click', () => goTo(current - 1));
      next?.addEventListener('click', () => goTo(current + 1));

      // Sync active dot with the actually-visible slide
      if ('IntersectionObserver' in globalThis) {
        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const idx = slides.indexOf(entry.target);
                if (idx !== -1 && idx !== current) setActive(idx);
              }
            });
          },
          { root: track, threshold: 0.6 }
        );
        slides.forEach((s) => io.observe(s));
      }

      // Autoplay every 3500ms. Runs only while the carousel is on screen and the
      // tab is visible; pauses on hover (Owl parity). Gating on visibility prevents
      // the active dot from drifting while the Work section is hidden.
      let timer = null;
      let onScreen = false;
      let hovering = false;
      function start() {
        if (reduceMotion || timer || !onScreen || hovering || document.hidden) return;
        timer = setInterval(() => goTo(current + 1), 3500);
      }
      function stop() {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      }
      root.addEventListener('mouseenter', () => {
        hovering = true;
        stop();
      });
      root.addEventListener('mouseleave', () => {
        hovering = false;
        start();
      });
      document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

      // Start/stop autoplay based on whether the carousel is actually on screen
      if ('IntersectionObserver' in globalThis) {
        const visObserver = new IntersectionObserver(
          (entries) => {
            onScreen = entries[0]?.isIntersecting ?? false;
            if (onScreen) start();
            else stop();
          },
          { threshold: 0.3 }
        );
        visObserver.observe(root);
      } else {
        onScreen = true;
        start();
      }
    }

    initCarousel(document.querySelector('#owl-demo'));

    // Respect reduced-motion: don't autoplay the decorative contact video;
    // leave its poster shown (mirrors initCarousel's reduced-motion handling).
    (function respectReducedMotionForContactVideo() {
      const reduceMotion = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      const video = document.querySelector('#contact_left video');
      if (!video || !reduceMotion) return;
      video.removeAttribute('autoplay');
      video.pause();
    })();

    // Prevent scroll leaking between sections
    let isAnimating = false;

    // Reset scroll to the top of the newly shown section so its top controls
    // (e.g. the "Back to home" link) are in view after navigating. The actual
    // scroll container here is <body> (main.css: `body { overflow: auto !important }`,
    // and `.container.main` is forced `overflow: visible !important` so it never
    // scrolls). Reset every plausible scroller to be robust across viewports/CSS.
    function scrollToTop() {
      globalThis.scrollTo(0, 0);
      if (document.scrollingElement) document.scrollingElement.scrollTop = 0;
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      const container = document.querySelector('.container.main');
      if (container) container.scrollTop = 0;
    }

    function switchSection(hideSel, showSel, onShown) {
      if (isAnimating) return;
      isAnimating = true;
      // Fail-safe: ensure interaction cannot be blocked if callbacks are missed
      setTimeout(function () {
        isAnimating = false;
      }, 1000);

      const hideEl = typeof hideSel === 'string' ? document.querySelector(hideSel) : hideSel;
      const showEl = typeof showSel === 'string' ? document.querySelector(showSel) : showSel;

      fade(hideEl, 'out', function () {
        fade(showEl, 'in', function () {
          isAnimating = false;
          // Scroll to top of the newly shown section (all viewports)
          scrollToTop();
          // Optional callback after section is shown
          if (onShown !== undefined) {
            try {
              onShown();
            } catch (error) {
              console.error('Error in onShown callback:', error);
            }
          }
        });
      });
    }

    // Basic image loading handler
    function handleImageLoad(img) {
      img.classList.add('loaded');
    }

    // Initialize all images
    document.querySelectorAll('.img-rabbit').forEach((img) => {
      if (img.complete) {
        handleImageLoad(img);
      } else {
        img.addEventListener('load', () => handleImageLoad(img));
      }
    });

    // Theme toggle functionality with keyboard and ARIA support
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
      const themeIcon = themeToggle.querySelector('i');

      // Theme toggle handler
      const toggleTheme = function () {
        const currentTheme = document.documentElement.dataset.theme || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.dataset.theme = newTheme;
        localStorage.setItem('theme', newTheme);

        // Update icon and ARIA attributes
        const iconClass = newTheme === 'dark' ? 'fa fa-sun-o' : 'fa fa-moon-o';
        if (themeIcon) themeIcon.className = iconClass;
        themeToggle.setAttribute('aria-checked', newTheme === 'dark');
        const srText = newTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
        const srEl = themeToggle.querySelector('.sr-only');
        if (srEl) srEl.textContent = srText;

        // Track theme change if GA is available
        trackEvent('theme_toggle', { theme: newTheme });
      };

      // Initialize theme toggle state
      const currentTheme = document.documentElement.dataset.theme || 'light';
      const initialIconClass = currentTheme === 'dark' ? 'fa fa-sun-o' : 'fa fa-moon-o';
      if (themeIcon) themeIcon.className = initialIconClass;
      themeToggle.setAttribute('aria-checked', currentTheme === 'dark');
      const initialSrText =
        currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
      const initialSrEl = themeToggle.querySelector('.sr-only');
      if (initialSrEl) initialSrEl.textContent = initialSrText;

      // Add theme toggle event listeners
      themeToggle.addEventListener('click', toggleTheme);
      themeToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleTheme();
        }
      });
    }

    ['#about_scroll', '#work_scroll', '#resources_scroll', '#contact_scroll'].forEach((sel) =>
      fade(document.querySelector(sel), 'out')
    );

    document.querySelector('#about')?.addEventListener('click', () => {
      switchSection('#index', '#about_scroll');
      document.querySelector('#about_left')?.classList.add('animated', 'slideInLeft');
      document.querySelector('#about_right')?.classList.add('animated', 'slideInRight');
    });

    document.querySelector('#work')?.addEventListener('click', () => {
      switchSection('#index', '#work_scroll');
      document.querySelector('#work_left')?.classList.add('animated', 'slideInLeft');
      document.querySelector('#work_right')?.classList.add('animated', 'slideInRight');
    });

    document.querySelector('#resources')?.addEventListener('click', () => {
      switchSection('#index', '#resources_scroll');
    });

    document.querySelector('#contact')?.addEventListener('click', () => {
      switchSection('#index', '#contact_scroll');
      document.querySelector('#contact_left')?.classList.add('animated', 'slideInLeft');
      document.querySelector('#contact_right')?.classList.add('animated', 'slideInRight');
    });

    // "Back to home" controls (links or persistent bar)
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('a[href="#index"], .go-back-home');
      if (!trigger) return;
      e.preventDefault();
      if (globalThis.goToHome === undefined) {
        // Fallback: mimic goToHome if function is unavailable
        document.querySelectorAll('.pages').forEach((p) => {
          p.hidden = true;
          p.style.display = 'none';
        });
        // Use fade('in') so opacity is restored to 1 — a prior fade('out') of
        // #index during navigation leaves inline opacity:0, and setting display
        // alone would show a fully transparent (blank) home page.
        fade(document.querySelector('#index'), 'in');
        scrollToTop();
      } else {
        try {
          globalThis.goToHome();
        } catch (error) {
          console.error('Error calling goToHome:', error);
        }
      }
    });

    // Force a redraw of the currently-visible page section (orientation/resize)
    function forceRedrawVisibleSection() {
      document.querySelectorAll('.pages').forEach((el) => {
        if (isVisible(el)) {
          el.style.display = 'none';
          void el.offsetHeight; // reflow
          el.style.display = '';
        }
      });
    }

    // Handle orientation change
    globalThis.addEventListener('orientationchange', function () {
      // Wait for orientation change to complete
      setTimeout(function () {
        isAnimating = false;
        forceRedrawVisibleSection();
        // Ensure proper scroll position
        globalThis.scrollTo(0, 0);
      }, 200);
    });

    // Handle window resize
    let resizeTimer;
    globalThis.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        isAnimating = false;
        forceRedrawVisibleSection();
      }, 250);
    });

    // Helper function to show form status
    function showFormStatus(message, type) {
      const statusDiv = document.querySelector('#form-status');
      if (!statusDiv) return;
      const alertClass =
        type === 'success' ? 'alert-success' : type === 'error' ? 'alert-danger' : 'alert-info';
      statusDiv.classList.remove('alert-success', 'alert-danger', 'alert-info');
      statusDiv.classList.add(alertClass);
      statusDiv.innerHTML = message;
      fade(statusDiv, 'in');

      if (type === 'success' || type === 'error') {
        setTimeout(() => fade(statusDiv, 'out'), 5000);
      }
    }

    // Unified form submission handler
    async function handleSubmit(event) {
      event.preventDefault();
      const form = event.target;
      const formStatus = document.getElementById('form-status');
      formStatus.style.display = 'none';
      formStatus.className = 'alert';
      formStatus.textContent = '';

      // Basic form validation
      let isValid = true;
      const inputs = form.querySelectorAll('input[required], textarea[required]');

      inputs.forEach((input) => {
        if (input.value.trim()) {
          input.setAttribute('aria-invalid', 'false');
          input.classList.remove('is-invalid');
        } else {
          isValid = false;
          input.setAttribute('aria-invalid', 'true');
          input.classList.add('is-invalid');
        }
      });

      const emailInput = form.querySelector('input[type="email"]');
      if (emailInput && emailInput.value && !isValidEmail(emailInput.value)) {
        isValid = false;
        emailInput.setAttribute('aria-invalid', 'true');
        emailInput.classList.add('is-invalid');
      }

      if (isValid) {
        // Show sending message
        showFormStatus('Sending...', 'info');
      } else {
        const firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) {
          firstInvalid.focus();
        }
        return;
      }

      // Disable submit button and show loading state
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.classList.add('btn-loading');

      // Submit form using Formspree
      const formData = new FormData(form);

      try {
        const response = await fetch(form.action, {
          method: form.method,
          body: formData,
          headers: {
            Accept: 'application/json',
          },
        });

        if (response.ok) {
          showFormStatus('Message sent successfully!', 'success');
          form.reset();
        } else {
          const responseData = await response.json();
          if (responseData?.errors) {
            showFormStatus(responseData.errors.map((error) => error.message).join(', '), 'error');
          } else {
            showFormStatus('Oops! There was a problem submitting your form', 'error');
          }
        }
      } catch (error) {
        console.error('Error:', error);
        showFormStatus('Oops! There was a problem submitting your form', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.classList.remove('btn-loading');
      }
    }

    // Attach unified form submission handler
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', handleSubmit);
    }

    // Add focus management for navigation
    const navButtons = document.querySelectorAll('.btn-rabbit');
    navButtons.forEach((button) => {
      button.setAttribute('tabindex', '0');
      button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          button.click();
        }
      });
    });

    // Skip to main content functionality
    document.querySelector('.skip-to-main')?.addEventListener('click', function (e) {
      e.preventDefault();
      const mainContent = document.querySelector('#index');
      if (!mainContent) return;
      mainContent.setAttribute('tabindex', '-1');
      mainContent.focus();

      // Ensure the main content is visible
      document.querySelectorAll('.pages').forEach((p) => fade(p, 'out'));
      fade(mainContent, 'in');
      document.querySelector('#index_left')?.classList.add('animated', 'slideInLeft');
      document.querySelector('#index_right')?.classList.add('animated', 'slideInRight');

      // Remove tabindex after focus
      setTimeout(() => {
        mainContent.removeAttribute('tabindex');
      }, 100);
    });

    // Document downloads tracking
    document.querySelectorAll('.docs-buttons a, .resources-list a').forEach((a) => {
      a.addEventListener('click', () => {
        trackEvent('document_download', {
          document_name: a.textContent.trim(),
          document_url: a.getAttribute('href'),
        });
      });
    });

    // Navigation tracking
    ['#about', '#work', '#resources', '#contact'].forEach((sel) => {
      document.querySelector(sel)?.addEventListener('click', function () {
        trackEvent('navigation', { section: this.id });
      });
    });

    // Easter egg button functionality - updated to use consistent animation patterns
    document.querySelector('#where-to-find-me')?.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation(); // Prevent event bubbling

      trackEvent('easter_egg_click', {
        name: 'where_to_find_me',
      });

      // Use the same switchSection pattern as other navigation
      const eggEl = document.querySelector('#where_to_find_me');
      if (isVisible(eggEl)) {
        switchSection('#where_to_find_me', '#resources_scroll');
        history.pushState(null, '', '#resources_scroll');
      } else {
        // Hide all pages first to avoid conflicts
        document.querySelectorAll('.pages').forEach((p) => {
          p.hidden = true;
          p.style.display = 'none';
        });

        // Show the Easter egg section with proper animation
        fade(eggEl, 'in', function () {
          isAnimating = false;
          // Scroll to top of the newly shown section (all viewports)
          scrollToTop();
        });

        history.pushState(null, '', '#where_to_find_me');

        // Set focus to the section for accessibility
        setTimeout(() => {
          eggEl?.setAttribute('tabindex', '-1');
          eggEl?.focus();
          setTimeout(() => {
            eggEl?.removeAttribute('tabindex');
          }, 100);
        }, 500);
      }
    });

    // Keyboard: Escape returns from the Easter egg to Resources.
    // Bound on document (not the section) so it works regardless of focus, and
    // only acts while the egg is visible. Transitions egg -> resources directly.
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isVisible(document.querySelector('#where_to_find_me'))) {
        switchSection('#where_to_find_me', '#resources_scroll');
        history.pushState(null, '', '#resources_scroll');
      }
    });

    // Back to Resources button from Easter egg section
    document.querySelector('#back-to-resources')?.addEventListener('click', function (e) {
      e.preventDefault();

      // Use the same switchSection pattern for consistent animations
      switchSection('#where_to_find_me', '#resources_scroll');
      history.pushState(null, '', '#resources_scroll');

      // Set focus back to the where-to-find-me button for accessibility
      setTimeout(() => {
        document.querySelector('#where-to-find-me')?.focus();
      }, 500);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
}

// Export for Node/CommonJS (Jest)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { isValidEmail, initializeTheme, isVisible, fade };
}
