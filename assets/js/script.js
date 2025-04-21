// Initialize theme handling before DOM ready
(function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
})();

$(document).ready(function() {
    // Helper function for GA4 event tracking
    function trackEvent(eventName, params = {}) {
        if (typeof gtag === 'function') {
            gtag('event', eventName, params);
        }
    }

    // Initialize Owl Carousel first
    const owl = $("#owl-demo").owlCarousel({
        items: 1,
        loop: true,
        margin: 0,
        nav: true,
        navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
        dots: true,
        autoplay: true,
        autoplayTimeout: 3000,
        autoplayHoverPause: true,
        smartSpeed: 1000,
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
        },
        onInitialize: function() {
            // Show loading spinner while carousel initializes
            $('#work_left').append('<div class="loading-spinner carousel-loading"></div>');
        },
        onInitialized: function() {
            // Remove loading spinner once carousel is ready
            $('#work_left .loading-spinner').remove();
            $('.owl-carousel .img-rabbit').show();
        }
    });

    // Handle image loading for non-carousel images
    $('.img-rabbit:not(.owl-carousel .img-rabbit)').each(function() {
        const $img = $(this);
        const $parent = $img.parent();
        
        // Skip GIF files
        if ($img.attr('src').toLowerCase().endsWith('.gif')) {
            return;
        }

        if (!$img[0].complete) {
            $parent.append('<div class="loading-spinner carousel-loading"></div>');
            $img.addClass('fade-in').hide();

            $img.on('load', function() {
                $parent.find('.loading-spinner').remove();
                $img.show();
            }).on('error', function() {
                $parent.find('.loading-spinner').remove();
                $img.replaceWith('<p class="error-message">Image failed to load</p>');
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

    $("#about").click(function(){
        $("#index").fadeOut();
        $("#about_scroll").fadeIn();
        $('#about_left').addClass('animated slideInLeft');
        $('#about_right').addClass('animated slideInRight');
    });
    $("#work").click(function(){
        $("#index").fadeOut();
        $("#work_scroll").fadeIn();
        $('#work_left').addClass('animated slideInLeft');
        $('#work_right').addClass('animated slideInRight');
    });
    $("#resources").click(function(){
        $("#index").fadeOut();
        $("#resources_scroll").fadeIn();
    });
    $("#contact").click(function(){
        $("#index").fadeOut();
        $("#contact_scroll").fadeIn();
        $('#contact_left').addClass('animated slideInLeft');
        $('#contact_right').addClass('animated slideInRight');
    });
    
    $(".back").click(function(){
        $(".pages").fadeOut();
        $("#index").fadeIn();
        $('#index_left').addClass('animated slideInLeft');
        $('#index_right').addClass('animated slideInRight');
    });

    // Handle navigation to the 'Where to find me' page
    $("#where-to-find-me").click(function(e) {
        e.preventDefault();
        $(".pages").fadeOut(); // Hide all other pages
        $("#where_to_find_me").fadeIn(); // Show the hidden page
    });

    // Handle back button navigation from the hidden page
    $("#where_to_find_me .back").click(function(e) {
        e.preventDefault();
        $("#where_to_find_me").fadeOut(); // Hide the hidden page
        $("#resources_scroll").fadeIn(); // Show the resources page
    });

    // Form validation and submission
    $("#contactForm").on('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const name = $('input[name="name"]').val().trim();
        const email = $('input[name="email"]').val().trim();
        const message = $('textarea[name="message"]').val().trim();
        
        // Basic validation
        if (!name || !email || !message) {
            showFormStatus('Please fill in all fields', 'error');
            return false;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showFormStatus('Please enter a valid email address', 'error');
            return false;
        }

        // Show sending message
        showFormStatus('Sending...', 'info');
        
        // Submit form using Formspree
        $.ajax({
            url: 'https://formspree.io/f/xkgrwpbr',
            method: 'POST',
            data: $(this).serialize(),
            dataType: 'json',
            beforeSend: function() {
                // Track form submission attempt
                trackEvent('form_submission_attempt', {
                    'form_name': 'contact'
                });
                
                const $submitBtn = $("#contactForm button[type='submit']");
                $submitBtn.addClass('btn-loading');
            },
            success: function(response) {
                showFormStatus('Message sent successfully!', 'success');
                // Track successful form submission
                trackEvent('form_submission_success', {
                    'form_name': 'contact'
                });
                $("#contactForm")[0].reset();
            },
            error: function(err) {
                showFormStatus('Error sending message. Please try again.', 'error');
                // Track form submission error
                trackEvent('form_submission_error', {
                    'form_name': 'contact',
                    'error_message': err.message
                });
            },
            complete: function() {
                const $submitBtn = $("#contactForm button[type='submit']");
                $submitBtn.removeClass('btn-loading');
            }
        });
    });

    // Helper function to show form status
    function showFormStatus(message, type) {
        const statusDiv = $('#form-status');
        statusDiv.removeClass('alert-success alert-danger alert-info')
                .addClass(type === 'success' ? 'alert-success' : 
                         type === 'error' ? 'alert-danger' : 
                         'alert-info')
                .html(message)
                .fadeIn();
        
        if (type === 'success' || type === 'error') {
            setTimeout(() => statusDiv.fadeOut(), 5000);
        }
    }

    // Carousel keyboard navigation
    $('#owl-demo').on('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            $(this).trigger('prev.owl.carousel');
        } else if (e.key === 'ArrowRight') {
            $(this).trigger('next.owl.carousel');
        }
    });

    // Form validation with ARIA support
    const form = document.getElementById('contactForm');
    form.addEventListener('submit', function(e) {
        let isValid = true;
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

        const email = document.getElementById('email');
        if (email.value && !isValidEmail(email.value)) {
            isValid = false;
            email.setAttribute('aria-invalid', 'true');
            email.classList.add('is-invalid');
        }

        if (!isValid) {
            e.preventDefault();
            const firstInvalid = form.querySelector('[aria-invalid="true"]');
            firstInvalid.focus();
        }
    });

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
});
