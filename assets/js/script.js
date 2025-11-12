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

// Theme initialization function (exported for tests)
function initializeTheme() {
  const savedTheme =
    typeof globalThis.localStorage !== 'undefined'
      ? globalThis.localStorage.getItem('theme')
      : null;
  const theme = savedTheme || 'light'; // default to light
  if (typeof globalThis.document !== 'undefined' && globalThis.document.documentElement) {
    globalThis.document.documentElement.setAttribute('data-theme', theme);
  }
  return theme;
}

// Wrap all browser-specific code to avoid executing in Node/Jest
if (typeof window !== 'undefined' && typeof document !== 'undefined' && typeof $ !== 'undefined') {
  // Initialize theme handling before DOM ready
  initializeTheme();

  $(document).ready(function () {
    // Hide all pages except index initially
    $('#about_scroll, #work_scroll, #resources_scroll, #contact_scroll, #where_to_find_me').hide();

    // Initialize Owl Carousel first (guarded)
    let owl = null;
    let owlInitialized = false;

    function initOwlIfNeeded() {
      if (owlInitialized) return;
      if ($.fn && $.fn.owlCarousel && $('#owl-demo').length) {
        owl = $('#owl-demo').owlCarousel({
          items: 1,
          loop: true,
          margin: 0,
          nav: true,
          navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
          dots: true,
          dotsData: true,
          autoplay: true,
          autoplayTimeout: 3500,
          autoplayHoverPause: true,
          autoplaySpeed: 600,
          lazyLoad: false,
          smartSpeed: 450,
          responsiveClass: true,
          onInitialized: function () { labelCarouselDots(); },
          onRefreshed: function () { labelCarouselDots(); },
          onChanged: function () { labelCarouselDots(); },
          responsive: {
            0: { items: 1, nav: false },
            768: { items: 1, nav: true }
          }
        });
        owlInitialized = true;
      } else {
        console.warn('OwlCarousel not available or #owl-demo missing; skipping initialization.');
      }
    }

    function destroyOwlIfNeeded() {
      try {
        const $owl = $('#owl-demo');
        if ($owl && $owl.data('owl.carousel')) {
          $owl.trigger('destroy.owl.carousel');
        }
      } catch (_) {}
      owl = null;
      owlInitialized = false;
    }
    // OwlCarousel initialization [DISABLED for isolation]
    // if ($.fn && $.fn.owlCarousel && $('#owl-demo').length) {
    //   owl = $('#owl-demo').owlCarousel({
    //     items: 1,
    //     loop: false, // Disable loop to prevent loading issues
    //     margin: 0,
    //     nav: true,
    //     navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
    //     dots: true,
    //     dotsData: true,
    //     autoplay: false, // Disable autoplay
    //     lazyLoad: false, // Disable lazy loading
    //     smartSpeed: 450,
    //     responsiveClass: true,
    //     onInitialized: function () {
    //       labelCarouselDots();
    //     },
    //     onRefreshed: function () {
    //       labelCarouselDots();
    //     },
    //     onChanged: function () {
    //       labelCarouselDots();
    //     },
    //     responsive: {
    //       0: {
    //         items: 1,
    //         nav: false,
    //       },
    //       768: {
    //         items: 1,
    //         nav: true,
    //       },
    //     },
    //   });
    // } else {
    //   console.warn('OwlCarousel not available or #owl-demo missing; skipping initialization.');
    // }

    // Accessibility: add labels for carousel dots (ensure after Owl initializes)
    function labelCarouselDots() {
      $('#owl-demo .owl-dot').each(function (index) {
        var label = 'Go to slide ' + (index + 1);
        // Provide multiple naming mechanisms recognized by accessibility APIs
        $(this).attr('aria-label', label);
        $(this).attr('title', label);
        // Ensure element content exists (Pa11y considers element text as a valid accessible name)
        var span = $(this).find('span');
        if (span.length === 0) {
          span = $('<span></span>').appendTo($(this));
        }
        span.text('Slide ' + (index + 1)).attr('aria-hidden', 'true');
      });
    }
    // Label when carousel is initialized, refreshed, or changed
    $('#owl-demo').on(
      'initialized.owl.carousel refreshed.owl.carousel changed.owl.carousel',
      function () {
        labelCarouselDots();
      }
    );
    // In case dots are already rendered, schedule a microtask to label them
    setTimeout(labelCarouselDots, 0);

    // MutationObserver fallback to ensure labels are present whenever dots are rendered/updated
    (function ensureDotLabelsWithMutationObserver() {
      var dotsContainer = document.querySelector('#owl-demo .owl-dots');
      if (dotsContainer && typeof MutationObserver !== 'undefined') {
        var observer = new MutationObserver(function () {
          labelCarouselDots();
        });
        observer.observe(dotsContainer, { childList: true, subtree: true });
        // Initial label attempt in case observer starts after render
        labelCarouselDots();
      }
    })();

    // Polling fallback: repeatedly attempt to label dots for a short time window
    (function pollDotLabels() {
      var tries = 0;
      var maxTries = 50; // ~5 seconds at 100ms intervals
      var interval = setInterval(function () {
        labelCarouselDots();
        tries++;
        if (tries >= maxTries) {
          clearInterval(interval);
        }
      }, 100);
    })();

    // Helper function for GA4 event tracking
    function trackEvent(eventName, params = {}) {
      if (typeof gtag === 'function') {
        gtag('event', eventName, params);
      }
    }

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
          if (window.innerWidth <= 767) {
            window.scrollTo(0, 0);
          }
          // Optional callback after section is shown
          if (typeof onShown === 'function') {
            try { onShown(); } catch (_) {}
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
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);

      // Update icon and ARIA attributes
      themeIcon.className = newTheme === 'dark' ? 'fa fa-sun-o' : 'fa fa-moon-o';
      themeToggle.setAttribute('aria-pressed', newTheme === 'dark');
      themeToggle.querySelector('.sr-only').textContent =
        newTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

      // Track theme change if GA is available
      if (typeof gtag === 'function') {
        gtag('event', 'theme_toggle', {
          theme: newTheme,
        });
      }
    }

    // Initialize theme toggle state
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    themeIcon.className = currentTheme === 'dark' ? 'fa fa-sun-o' : 'fa fa-moon-o';
    themeToggle.setAttribute('aria-pressed', currentTheme === 'dark');
    themeToggle.querySelector('.sr-only').textContent =
      currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

    // Add theme toggle event listeners
    themeToggle.addEventListener('click', toggleTheme);
    themeToggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleTheme();
      }
    });

    // Keyboard navigation for carousel [DISABLED for isolation]
    // $(document).keydown(function (e) {
    //   if ($('#work_scroll').is(':visible')) {
    //     if (e.keyCode === 37) {
    //       // Left arrow
    //       $('#owl-demo').trigger('prev.owl.carousel');
    //     } else if (e.keyCode === 39) {
    //       // Right arrow
    //       $('#owl-demo').trigger('next.owl.carousel');
    //     }
    //   }
    // });

    $('#about_scroll').fadeOut();
    $('#work_scroll').fadeOut();
    $('#resources_scroll').fadeOut();
    $('#contact_scroll').fadeOut();

    // Section navigation with keyboard [DISABLED for isolation]
    // $(document).keydown(function (e) {
    //   if (e.keyCode === 27) {
    //     // ESC key
    //     $('.pages').fadeOut();
    //     $('#index').fadeIn();
    //     $('#index_left').addClass('animated slideInLeft');
    //     $('#index_right').addClass('animated slideInRight');
    //   }
    //
    //   // Number keys for navigation (1-4)
    //   if ($('#index').is(':visible')) {
    //     switch (e.keyCode) {
    //       case 49: // 1 key
    //         $('#about').click();
    //         break;
    //       case 50: // 2 key
    //         $('#work').click();
    //         break;
    //       case 51: // 3 key
    //         $('#resources').click();
    //         break;
    //       case 52: // 4 key
    //         $('#contact').click();
    //         break;
    //     }
    //   }
    // });

    $('#about').click(function () {
      if ($('#work_scroll').is(':visible')) { destroyOwlIfNeeded(); }
      switchSection($('#index'), $('#about_scroll'));
      $('#about_left').addClass('animated slideInLeft');
      $('#about_right').addClass('animated slideInRight');
    });

    $('#work').click(function () {
      switchSection($('#index'), $('#work_scroll'), function () {
        initOwlIfNeeded();
        if (owl && typeof owl.trigger === 'function') {
          owl.trigger('refresh.owl.carousel');
        }
      });
      $('#work_left').addClass('animated slideInLeft');
      $('#work_right').addClass('animated slideInRight');
    });

    $('#resources').click(function () {
      if ($('#work_scroll').is(':visible')) { destroyOwlIfNeeded(); }
      switchSection($('#index'), $('#resources_scroll'));
    });

    $('#contact').click(function () {
      if ($('#work_scroll').is(':visible')) { destroyOwlIfNeeded(); }
      switchSection($('#index'), $('#contact_scroll'));
      $('#contact_left').addClass('animated slideInLeft');
      $('#contact_right').addClass('animated slideInRight');
    });

    $('.back').click(function () {
      const currentSection = $('.pages:visible');
      if ($('#work_scroll').is(':visible')) { destroyOwlIfNeeded(); }
      switchSection(currentSection, $('#index'));
      $('#index_left').addClass('animated slideInLeft');
      $('#index_right').addClass('animated slideInRight');
    });

    // Ensure Owl is destroyed when using "Back to home" controls (links or persistent bar)
    $(document).on('click', 'a[href="#index"], .go-back-home', function (e) {
      e.preventDefault();
      destroyOwlIfNeeded();
      if (typeof window.goToHome === 'function') {
        try { window.goToHome(); } catch (_) {}
      } else {
        // Fallback: mimic goToHome if function is unavailable
        $('.pages').hide();
        $('#index').show();
        window.scrollTo(0, 0);
      }
    });

    // Add touch event handling for mobile [DISABLED for isolation]
    // let touchStartY;
    //
    // $(document).on('touchstart', function (e) {
    //   touchStartY = e.originalEvent.touches[0].clientY;
    // });
    //
    // $(document).on('touchend', function (e) {
    //   if (isAnimating) return;
    //
    //   const touchEndY = e.originalEvent.changedTouches[0].clientY;
    //   const deltaY = touchEndY - touchStartY;
    //
    //   // If significant vertical swipe
    //   if (Math.abs(deltaY) > 50) {
    //     const $currentSection = $('.pages:visible');
    //
    //     // Swipe up - go to next section
    //     if (deltaY < 0 && $currentSection.is('#index')) {
    //       $('#about').click();
    //     }
    //   }
    // });

    // Handle orientation change
    window.addEventListener('orientationchange', function () {
      // Wait for orientation change to complete
      setTimeout(function () {
        // Reset any ongoing animations
        isAnimating = false;

        // Force redraw of current section
        const $currentSection = $('.pages:visible');
        $currentSection.hide().show(0);

        // Ensure proper scroll position
        window.scrollTo(0, 0);
      }, 200);
    });

    // Handle window resize
    let resizeTimer;
    $(window).on('resize', function () {
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
      statusDiv
        .removeClass('alert-success alert-danger alert-info')
        .addClass(`alert-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'info'}`)
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
        if (!input.value.trim()) {
          isValid = false;
          input.setAttribute('aria-invalid', 'true');
          input.classList.add('is-invalid');
        } else {
          input.setAttribute('aria-invalid', 'false');
          input.classList.remove('is-invalid');
        }
      });

      const emailInput = form.querySelector('input[type="email"]');
      if (emailInput && emailInput.value && !isValidEmail(emailInput.value)) {
        isValid = false;
        emailInput.setAttribute('aria-invalid', 'true');
        emailInput.classList.add('is-invalid');
      }

      if (!isValid) {
        const firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) {
          firstInvalid.focus();
        }
        return;
      }

      // Show sending message
      showFormStatus('Sending...', 'info');

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
          if (Object.hasOwn(responseData, 'errors')) {
            showFormStatus(
              responseData['errors'].map((error) => error['message']).join(', '),
              'error'
            );
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

    // Easter egg interaction tracking
    $('#where-to-find-me').click(function () {
      trackEvent('easter_egg_click', {
        name: 'where_to_find_me',
      });
    });

    // Carousel interaction tracking
    $('#owl-demo').on('changed.owl.carousel', function (event) {
      trackEvent('carousel_slide', {
        slide_index: event.item.index,
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
      if ($('#where_to_find_me').is(':visible')) {
        switchSection($('#where_to_find_me'), $('#resources_scroll'));
        history.pushState(null, '', '#resources_scroll');
      } else {
        // Hide all pages first to avoid conflicts
        $('.pages').hide();

        // Show the Easter egg section with proper animation
        $('#where_to_find_me').fadeIn(400, function () {
          isAnimating = false;
          // Scroll to top of new section on mobile
          if (window.innerWidth <= 767) {
            window.scrollTo(0, 0);
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

  // Ensure proper functionality for the 'Back to Home' button
  document.addEventListener('DOMContentLoaded', function () {
    const backButtons = document.querySelectorAll('.back');

    backButtons.forEach((button) => {
      button.addEventListener('click', function (event) {
        event.preventDefault();

        // Hide all sections
        const sections = document.querySelectorAll('.pages');
        sections.forEach((section) => {
          section.style.display = 'none';
        });

        // Show the home section
        const homeSection = document.getElementById('index');
        homeSection.style.display = 'block';

        // Scroll to the top of the home section
        homeSection.scrollIntoView({ behavior: 'smooth' });
      });
    });
  });
}


// Export for Node/CommonJS (Jest)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { isValidEmail, initializeTheme };
}
