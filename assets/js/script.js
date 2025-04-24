// Initialize theme handling before DOM ready
(function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
})();

$(document).ready(function() {
    // Hide all pages except index initially
    $("#about_scroll, #work_scroll, #resources_scroll, #contact_scroll, #where_to_find_me").hide();

    // Initialize Owl Carousel first
    const owl = $("#owl-demo").owlCarousel({
        items: 1,
        loop: false, // Disable loop to prevent loading issues
        margin: 0,
        nav: true,
        navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
        dots: true,
        autoplay: false, // Disable autoplay
        lazyLoad: false, // Disable lazy loading
        smartSpeed: 450,
        responsiveClass: true,
        responsive: {
            0: {
                items: 1,
                nav: false
            },
            768: {
                items: 1,
                nav: true
            }
        }
    });

    // Helper function for GA4 event tracking
    function trackEvent(eventName, params = {}) {
        if (typeof gtag === 'function') {
            gtag('event', eventName, params);
        }
    }

    // Prevent scroll leaking between sections
    let isAnimating = false;
    
    function switchSection($hideSection, $showSection) {
        if (isAnimating) return;
        isAnimating = true;
        
        $hideSection.fadeOut(400, function() {
            $showSection.fadeIn(400, function() {
                isAnimating = false;
                // Scroll to top of new section on mobile
                if (window.innerWidth <= 767) {
                    window.scrollTo(0, 0);
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
    $('.img-rabbit').each(function() {
        if (this.complete) {
            handleImageLoad(this);
        } else {
            $(this).on('load', function() {
                handleImageLoad(this);
            });
        }
    });

    // Add loading state to form submit button
    $("#contactForm").on('submit', function() {
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
                'theme': newTheme
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

    // Keyboard navigation for carousel
    $(document).keydown(function(e) {
        if ($("#work_scroll").is(":visible")) {
            if (e.keyCode === 37) { // Left arrow
                $("#owl-demo").trigger('prev.owl.carousel');
            } else if (e.keyCode === 39) { // Right arrow
                $("#owl-demo").trigger('next.owl.carousel');
            }
        }
    });
                
    $("#about_scroll").fadeOut();   
    $("#work_scroll").fadeOut();
    $("#resources_scroll").fadeOut();
    $("#contact_scroll").fadeOut();

    // Section navigation with keyboard
    $(document).keydown(function(e) {
        if (e.keyCode === 27) { // ESC key
            $(".pages").fadeOut();
            $("#index").fadeIn();
            $('#index_left').addClass('animated slideInLeft');
            $('#index_right').addClass('animated slideInRight');
        }

        // Number keys for navigation (1-4)
        if ($("#index").is(":visible")) {
            switch(e.keyCode) {
                case 49: // 1 key
                    $("#about").click();
                    break;
                case 50: // 2 key
                    $("#work").click();
                    break;
                case 51: // 3 key
                    $("#resources").click();
                    break;
                case 52: // 4 key
                    $("#contact").click();
                    break;
            }
        }
    });

    $("#about").click(function() {
        switchSection($("#index"), $("#about_scroll"));
        $('#about_left').addClass('animated slideInLeft');
        $('#about_right').addClass('animated slideInRight');
    });

    $("#work").click(function() {
        switchSection($("#index"), $("#work_scroll"));
        $('#work_left').addClass('animated slideInLeft');
        $('#work_right').addClass('animated slideInRight');
        // Force carousel refresh
        owl.trigger('refresh.owl.carousel');
    });

    $("#resources").click(function() {
        switchSection($("#index"), $("#resources_scroll"));
    });

    $("#contact").click(function() {
        switchSection($("#index"), $("#contact_scroll"));
        $('#contact_left').addClass('animated slideInLeft');
        $('#contact_right').addClass('animated slideInRight');
    });

    $(".back").click(function() {
        const currentSection = $(".pages:visible");
        switchSection(currentSection, $("#index"));
        $('#index_left').addClass('animated slideInLeft');
        $('#index_right').addClass('animated slideInRight');
    });

    // Prevent multiple section transitions
    $(".pages").on('scroll touchmove mousewheel', function(e) {
        if (isAnimating) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    });

    // Add touch event handling for mobile
    let touchStartY;
    
    $(document).on('touchstart', function(e) {
        touchStartY = e.originalEvent.touches[0].clientY;
    });

    $(document).on('touchend', function(e) {
        if (isAnimating) return;
        
        const touchEndY = e.originalEvent.changedTouches[0].clientY;
        const deltaY = touchEndY - touchStartY;
        
        // If significant vertical swipe
        if (Math.abs(deltaY) > 50) {
            const $currentSection = $(".pages:visible");
            
            // Swipe up - go to next section
            if (deltaY < 0 && $currentSection.is("#index")) {
                $("#about").click();
            }
            // Swipe down - go back to home
            else if (deltaY > 0 && !$currentSection.is("#index")) {
                $(".back").click();
            }
        }
    });

    // Handle orientation change
    window.addEventListener('orientationchange', function() {
        // Wait for orientation change to complete
        setTimeout(function() {
            // Reset any ongoing animations
            isAnimating = false;
            
            // Force redraw of current section
            const $currentSection = $(".pages:visible");
            $currentSection.hide().show(0);
            
            // Ensure proper scroll position
            window.scrollTo(0, 0);
        }, 200);
    });

    // Handle window resize
    let resizeTimer;
    $(window).on('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            // Reset any ongoing animations
            isAnimating = false;
            
            // Force redraw of current section
            const $currentSection = $(".pages:visible");
            $currentSection.hide().show(0);
        }, 250);
    });

    // Form validation and submission
    $("#contactForm").on('submit', function(e) {
        e.preventDefault();
        
        // Basic form validation
        let isValid = true;
        const form = this;
        const inputs = form.querySelectorAll('input[required], textarea[required]');
        
        inputs.forEach(input => {
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
        
        fetch(form.action, {
            method: form.method,
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.ok) {
                showFormStatus('Message sent successfully!', 'success');
                form.reset();
            } else {
                throw new Error('Form submission failed');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showFormStatus('Error sending message. Please try again later.', 'error');
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.classList.remove('btn-loading');
        });
    });

    // Helper function to show form status
    function showFormStatus(message, type) {
        const statusDiv = $('#form-status');
        statusDiv.removeClass('alert-success alert-danger alert-info')
                .addClass(`alert-${type === 'success' ? 'success' : 
                          type === 'error' ? 'danger' : 
                          'info'}`)
                .html(message)
                .fadeIn();
        
        if (type === 'success' || type === 'error') {
            setTimeout(() => statusDiv.fadeOut(), 5000);
        }
    }

    // Helper function to validate email
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Add focus management for navigation
    const navButtons = document.querySelectorAll('.btn-rabbit');
    navButtons.forEach(button => {
        button.setAttribute('tabindex', '0');
        button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                button.click();
            }
        });
    });

    // Skip to main content functionality
    $('.skip-to-main').on('click', function(e) {
        e.preventDefault();
        const mainContent = $('#index');
        mainContent.attr('tabindex', '-1');
        mainContent.focus();
        
        // Ensure the main content is visible
        $(".pages").fadeOut();
        mainContent.fadeIn();
        $('#index_left').addClass('animated slideInLeft');
        $('#index_right').addClass('animated slideInRight');

        // Remove tabindex after focus
        setTimeout(() => {
            mainContent.removeAttr('tabindex');
        }, 100);
    });

    // Document downloads tracking
    $('.docs-buttons a, .resources-list a').on('click', function(e) {
        const docName = $(this).text().trim();
        trackEvent('document_download', {
            'document_name': docName,
            'document_url': $(this).attr('href')
        });
    });

    // Navigation tracking
    $("#about, #work, #resources, #contact").click(function() {
        const section = $(this).attr('id');
        trackEvent('navigation', {
            'section': section
        });
    });

    // Easter egg interaction tracking
    $("#where-to-find-me").click(function() {
        trackEvent('easter_egg_click', {
            'name': 'where_to_find_me'
        });
    });

    // Carousel interaction tracking
    $("#owl-demo").on('changed.owl.carousel', function(event) {
        trackEvent('carousel_slide', {
            'slide_index': event.item.index
        });
    });

    // Easter egg button functionality
    const whereToFindMeButton = document.getElementById('where-to-find-me');
    const whereToFindMeSection = document.getElementById('where_to_find_me');

    whereToFindMeButton.addEventListener('click', function (event) {
        event.preventDefault();

        // Toggle visibility
        if (whereToFindMeSection.style.display === 'none' || !whereToFindMeSection.style.display) {
            whereToFindMeSection.style.display = 'block';
            whereToFindMeSection.scrollIntoView({ behavior: 'smooth' });

            // Update URL without reloading
            history.pushState(null, '', '#where_to_find_me');
        } else {
            whereToFindMeSection.style.display = 'none';
            history.pushState(null, '', '#resources_scroll');
        }
    });

    // Contact form submission handling
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('form-status');

    contactForm.addEventListener('submit', function (event) {
        event.preventDefault();

        // Clear previous status messages
        formStatus.style.display = 'none';
        formStatus.className = 'alert';
        formStatus.textContent = '';

        // Validate inputs
        const name = document.getElementById('name');
        const email = document.getElementById('email');
        const message = document.getElementById('message');
        let isValid = true;

        if (!name.value.trim()) {
            name.classList.add('is-invalid');
            isValid = false;
        } else {
            name.classList.remove('is-invalid');
        }

        if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
            email.classList.add('is-invalid');
            isValid = false;
        } else {
            email.classList.remove('is-invalid');
        }

        if (!message.value.trim()) {
            message.classList.add('is-invalid');
            isValid = false;
        } else {
            message.classList.remove('is-invalid');
        }

        if (!isValid) {
            formStatus.style.display = 'block';
            formStatus.classList.add('alert-danger');
            formStatus.textContent = 'Please fill out all fields correctly.';
            return;
        }

        // Show loading state
        const submitButton = contactForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.classList.add('btn-loading');

        // Submit form via AJAX
        const formData = new FormData(contactForm);
        fetch(contactForm.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            formStatus.style.display = 'block';
            formStatus.classList.add('alert-success');
            formStatus.textContent = 'Message sent successfully!';
            contactForm.reset();
        })
        .catch(error => {
            console.error('Error:', error);
            formStatus.style.display = 'block';
            formStatus.classList.add('alert-danger');
            formStatus.textContent = 'An error occurred. Please try again later.';
        })
        .finally(() => {
            submitButton.disabled = false;
            submitButton.classList.remove('btn-loading');
        });
    });
});
