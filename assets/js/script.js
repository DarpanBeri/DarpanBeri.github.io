$(document).ready(function() {
    // Fix for carousel image loading issue
    $('.img-rabbit').each(function() {
        const $img = $(this);
        const $parent = $img.parent();

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

    // Theme toggle functionality
    const themeToggle = $('.theme-toggle');
    const themeIcon = themeToggle.find('i');
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme === 'dark');
    }
    
    // Theme toggle click handler
    themeToggle.click(function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme === 'dark');
    });
    
    function updateThemeIcon(isDark) {
        themeIcon.removeClass('fa-moon-o fa-sun-o').addClass(isDark ? 'fa-sun-o' : 'fa-moon-o');
    }

    // Initialize Owl Carousel with proper configuration
    $("#owl-demo").owlCarousel({
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
        animateOut: 'fadeOut',
        animateIn: 'fadeIn',
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

    // Form validation and submission
    $("#contactForm").on('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const name = $('input[name="name"]').val().trim();
        const email = $('input[name="_replyto"]').val().trim();
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
            url: this.action,
            method: 'POST',
            data: $(this).serialize(),
            dataType: 'json',
            success: function(response) {
                showFormStatus('Message sent successfully!', 'success');
                $("#contactForm")[0].reset();
            },
            error: function(err) {
                showFormStatus('Error sending message. Please try again.', 'error');
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
});
