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
      el.style.display = '';
      el.style.opacity = '1';
    } else {
      el.style.opacity = '0';
      el.hidden = true;
    }
  }
  if (onDone) onDone();
}

// Wrap all browser-specific code to avoid executing in Node/Jest
if (
  globalThis.window !== undefined &&
  globalThis.document !== undefined &&
  globalThis.$ !== undefined
) {
  // Initialize theme handling before DOM ready
  initializeTheme();

  $(document).ready(function () {
    // Hide all pages except index initially
    $('#about_scroll, #work_scroll, #resources_scroll, #contact_scroll, #where_to_find_me').hide();

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
        dot.setAttribute('role', 'tab');
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
        slides[clamped].scrollIntoView({
          behavior: reduceMotion ? 'auto' : 'smooth',
          block: 'nearest',
          inline: 'center',
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

      // Autoplay every 3500ms, pause on hover / tab hidden (Owl parity)
      let timer = null;
      function start() {
        if (reduceMotion || timer) return;
        timer = setInterval(() => goTo(current + 1), 3500);
      }
      function stop() {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      }
      root.addEventListener('mouseenter', stop);
      root.addEventListener('mouseleave', start);
      document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
      start();
    }

    initCarousel(document.querySelector('#owl-demo'));

    // Prevent scroll leaking between sections
    let isAnimating = false;

    function switchSection($hideSection, $showSection, onShown) {
      if (isAnimating) return;
      isAnimating = true;
      // Fail-safe: ensure interaction cannot be blocked if callbacks are missed
      setTimeout(function () {
        isAnimating = false;
      }, 1000);

      $hideSection.fadeOut(400, function () {
        $showSection.fadeIn(400, function () {
          isAnimating = false;
          // Scroll to top of new section on mobile
          if (globalThis.innerWidth <= 767) {
            globalThis.scrollTo(0, 0);
          }
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
      const $img = $(img);
      if (!$img.hasClass('loaded')) {
        $img.addClass('loaded');
      }
    }

    // Initialize all images
    $('.img-rabbit').each(function () {
      if (this.complete) {
        handleImageLoad(this);
      } else {
        $(this).on('load', function () {
          handleImageLoad(this);
        });
      }
    });

    // Add loading state to form submit button
    $('#contactForm').on('submit', function () {
      const $submitBtn = $(this).find('button[type="submit"]');
      $submitBtn.addClass('btn-loading');
    });

    // Theme toggle functionality with keyboard and ARIA support
    const themeToggle = document.querySelector('.theme-toggle');
    const themeIcon = themeToggle.querySelector('i');

    // Theme toggle handler
    function toggleTheme() {
      const currentTheme = document.documentElement.dataset.theme || 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

      document.documentElement.dataset.theme = newTheme;
      localStorage.setItem('theme', newTheme);

      // Update icon and ARIA attributes
      const iconClass = newTheme === 'dark' ? 'fa fa-sun-o' : 'fa fa-moon-o';
      themeIcon.className = iconClass;
      themeToggle.setAttribute('aria-checked', newTheme === 'dark');
      const srText = newTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
      themeToggle.querySelector('.sr-only').textContent = srText;

      // Track theme change if GA is available
      if (typeof gtag === 'function') {
        gtag('event', 'theme_toggle', {
          theme: newTheme,
        });
      }
    }

    // Initialize theme toggle state
    const currentTheme = document.documentElement.dataset.theme || 'light';
    const initialIconClass = currentTheme === 'dark' ? 'fa fa-sun-o' : 'fa fa-moon-o';
    themeIcon.className = initialIconClass;
    themeToggle.setAttribute('aria-checked', currentTheme === 'dark');
    const initialSrText = currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    themeToggle.querySelector('.sr-only').textContent = initialSrText;

    // Add theme toggle event listeners
    themeToggle.addEventListener('click', toggleTheme);
    themeToggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleTheme();
      }
    });

    $('#about_scroll').fadeOut();
    $('#work_scroll').fadeOut();
    $('#resources_scroll').fadeOut();
    $('#contact_scroll').fadeOut();

    $('#about').click(function () {
      switchSection($('#index'), $('#about_scroll'));
      $('#about_left').addClass('animated slideInLeft');
      $('#about_right').addClass('animated slideInRight');
    });

    $('#work').click(function () {
      switchSection($('#index'), $('#work_scroll'));
      $('#work_left').addClass('animated slideInLeft');
      $('#work_right').addClass('animated slideInRight');
    });

    $('#resources').click(function () {
      switchSection($('#index'), $('#resources_scroll'));
    });

    $('#contact').click(function () {
      switchSection($('#index'), $('#contact_scroll'));
      $('#contact_left').addClass('animated slideInLeft');
      $('#contact_right').addClass('animated slideInRight');
    });

    // "Back to home" controls (links or persistent bar)
    $(document).on('click', 'a[href="#index"], .go-back-home', function (e) {
      e.preventDefault();
      if (globalThis.goToHome === undefined) {
        // Fallback: mimic goToHome if function is unavailable
        $('.pages').hide();
        $('#index').show();
        globalThis.scrollTo(0, 0);
      } else {
        try {
          globalThis.goToHome();
        } catch (error) {
          console.error('Error calling goToHome:', error);
        }
      }
    });

    // Handle orientation change
    globalThis.addEventListener('orientationchange', function () {
      // Wait for orientation change to complete
      setTimeout(function () {
        // Reset any ongoing animations
        isAnimating = false;

        // Force redraw of current section
        const $currentSection = $('.pages:visible');
        $currentSection.hide().show(0);

        // Ensure proper scroll position
        globalThis.scrollTo(0, 0);
      }, 200);
    });

    // Handle window resize
    let resizeTimer;
    $(globalThis).on('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        // Reset any ongoing animations
        isAnimating = false;

        // Force redraw of current section
        const $currentSection = $('.pages:visible');
        $currentSection.hide().show(0);
      }, 250);
    });

    // Helper function to show form status
    function showFormStatus(message, type) {
      const statusDiv = $('#form-status');
      let alertClass;
      if (type === 'success') {
        alertClass = 'alert-success';
      } else if (type === 'error') {
        alertClass = 'alert-danger';
      } else {
        alertClass = 'alert-info';
      }
      statusDiv
        .removeClass('alert-success alert-danger alert-info')
        .addClass(alertClass)
        .html(message)
        .fadeIn();

      if (type === 'success' || type === 'error') {
        setTimeout(() => statusDiv.fadeOut(), 5000);
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
    $('.skip-to-main').on('click', function (e) {
      e.preventDefault();
      const mainContent = $('#index');
      mainContent.attr('tabindex', '-1');
      mainContent.focus();

      // Ensure the main content is visible
      $('.pages').fadeOut();
      mainContent.fadeIn();
      $('#index_left').addClass('animated slideInLeft');
      $('#index_right').addClass('animated slideInRight');

      // Remove tabindex after focus
      setTimeout(() => {
        mainContent.removeAttr('tabindex');
      }, 100);
    });

    // Document downloads tracking
    $('.docs-buttons a, .resources-list a').on('click', function (_e) {
      const docName = $(this).text().trim();
      trackEvent('document_download', {
        document_name: docName,
        document_url: $(this).attr('href'),
      });
    });

    // Navigation tracking
    $('#about, #work, #resources, #contact').click(function () {
      const section = $(this).attr('id');
      trackEvent('navigation', {
        section: section,
      });
    });

    // Easter egg button functionality - updated to use consistent animation patterns
    $('#where-to-find-me').click(function (e) {
      e.preventDefault();
      e.stopPropagation(); // Prevent event bubbling

      trackEvent('easter_egg_click', {
        name: 'where_to_find_me',
      });

      // Use the same switchSection pattern as other navigation
      const isEasterEggVisible = $('#where_to_find_me').is(':visible');
      if (isEasterEggVisible) {
        switchSection($('#where_to_find_me'), $('#resources_scroll'));
        history.pushState(null, '', '#resources_scroll');
      } else {
        // Hide all pages first to avoid conflicts
        $('.pages').hide();

        // Show the Easter egg section with proper animation
        $('#where_to_find_me').fadeIn(400, function () {
          isAnimating = false;
          // Scroll to top of new section on mobile
          if (globalThis.innerWidth <= 767) {
            globalThis.scrollTo(0, 0);
          }
        });

        history.pushState(null, '', '#where_to_find_me');

        // Set focus to the section for accessibility
        setTimeout(() => {
          $('#where_to_find_me').attr('tabindex', '-1').focus();
          setTimeout(() => {
            $('#where_to_find_me').removeAttr('tabindex');
          }, 100);
        }, 500);
      }
    });

    // Add keyboard navigation for Easter Egg section
    $('#where_to_find_me').on('keydown', function (e) {
      if (e.key === 'Escape') {
        // ESC key
        $('#resources').click();
      }
    });

    // Back to Resources button from Easter egg section
    $('#back-to-resources').click(function (e) {
      e.preventDefault();

      // Use the same switchSection pattern for consistent animations
      switchSection($('#where_to_find_me'), $('#resources_scroll'));
      history.pushState(null, '', '#resources_scroll');

      // Set focus back to the where-to-find-me button for accessibility
      setTimeout(() => {
        $('#where-to-find-me').focus();
      }, 500);
    });
  });
}

// Export for Node/CommonJS (Jest)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { isValidEmail, initializeTheme, isVisible, fade };
}
