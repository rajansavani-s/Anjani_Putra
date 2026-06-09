/* ============================================
   ANJANI PUTRA - Main JavaScript
   ============================================ */

$(document).ready(function () {

    // ---- Preloader ----
    $(window).on('load', function () {
        $('#preloader').addClass('hidden');
    });
    // Fallback: hide preloader after 3 seconds
    setTimeout(function () {
        $('#preloader').addClass('hidden');
    }, 3000);

    // ---- Initialize AOS ----
    AOS.init({
        duration: 800,
        easing: 'ease-out-cubic',
        once: true,
        offset: 80,
        disable: false
    });

    // ---- Sticky Navbar with Glassmorphism ----
    var $navbar = $('#mainNavbar');
    var lastScroll = 0;

    $(window).on('scroll', function () {
        var currentScroll = $(this).scrollTop();
        if (currentScroll > 50) {
            $navbar.addClass('scrolled');
        } else {
            $navbar.removeClass('scrolled');
        }
        lastScroll = currentScroll;
    });

    // ---- Active Nav Link on Scroll ----
    var sections = $('section[id]');
    $(window).on('scroll', function () {
        var scrollPos = $(this).scrollTop() + 120;
        sections.each(function () {
            var section = $(this);
            var sectionTop = section.offset().top;
            var sectionHeight = section.outerHeight();
            var sectionId = section.attr('id');
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                $('.navbar-center .nav-link').removeClass('active');
                $('.navbar-center .nav-link[href="#' + sectionId + '"]').addClass('active');
            }
        });
    });

    // ---- Mobile Menu Toggle ----
    $('#mobileToggle').on('click', function () {
        $(this).toggleClass('active');
        $('#navMenu').toggleClass('active');
        $('body').toggleClass('menu-open');
    });

    // Close mobile menu when clicking nav link
    $('.navbar-center .nav-link').on('click', function () {
        $('#mobileToggle').removeClass('active');
        $('#navMenu').removeClass('active');
        $('body').removeClass('menu-open');
    });

    // ---- Smooth Scroll for all anchor links ----
    $('a[href^="#"]').on('click', function (e) {
        var target = $(this.getAttribute('href'));
        if (target.length) {
            e.preventDefault();
            $('html, body').animate({
                scrollTop: target.offset().top - 70
            }, 600, 'swing');
        }
    });

    // ---- Counter Animation ----
    function animateCounters() {
        $('.counter').each(function () {
            var $this = $(this);
            if ($this.hasClass('counting')) return;

            var target = parseInt($this.attr('data-target'));
            var current = 0;
            var increment = Math.ceil(target / 60);
            var duration = 2000;
            var stepTime = duration / (target / increment);

            $this.addClass('counting');

            var timer = setInterval(function () {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                $this.text(current);
            }, stepTime);
        });
    }

    // Trigger counter animation when stats section is in view
    var statsObserver = null;
    if ('IntersectionObserver' in window) {
        statsObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    animateCounters();
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        var statsSection = document.getElementById('stats');
        if (statsSection) {
            statsObserver.observe(statsSection);
        }
    } else {
        // Fallback: animate on scroll
        $(window).on('scroll', function () {
            var statsTop = $('#stats').offset().top;
            var windowBottom = $(window).scrollTop() + $(window).height();
            if (windowBottom > statsTop + 100) {
                animateCounters();
            }
        });
    }

    // ---- Testimonials Slider ----
    var testimonialIndex = 0;
    var $track = $('#testimonialsTrack');
    var $dots = $('.slider-dot');
    var totalSlides = $dots.length;
    var autoSlideInterval;

    function getCardsPerView() {
        var width = $(window).width();
        if (width <= 768) return 1;
        if (width <= 1024) return 2;
        return 3;
    }

    function updateSlider() {
        var cardsPerView = getCardsPerView();
        var maxIndex = Math.max(0, totalSlides - 1);
        if (testimonialIndex > maxIndex) testimonialIndex = 0;
        if (testimonialIndex < 0) testimonialIndex = maxIndex;

        var cardWidth = $track.find('.testimonial-card').outerWidth(true);
        var offset = testimonialIndex * cardWidth;
        $track.css('transform', 'translateX(-' + offset + 'px)');

        $dots.removeClass('active');
        $dots.eq(testimonialIndex).addClass('active');
    }

    $('#sliderNext').on('click', function () {
        testimonialIndex++;
        if (testimonialIndex >= totalSlides) testimonialIndex = 0;
        updateSlider();
        resetAutoSlide();
    });

    $('#sliderPrev').on('click', function () {
        testimonialIndex--;
        if (testimonialIndex < 0) testimonialIndex = totalSlides - 1;
        updateSlider();
        resetAutoSlide();
    });

    $dots.on('click', function () {
        testimonialIndex = parseInt($(this).attr('data-index'));
        updateSlider();
        resetAutoSlide();
    });

    function startAutoSlide() {
        autoSlideInterval = setInterval(function () {
            testimonialIndex++;
            if (testimonialIndex >= totalSlides) testimonialIndex = 0;
            updateSlider();
        }, 5000);
    }

    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        startAutoSlide();
    }

    startAutoSlide();
    updateSlider();

    $(window).on('resize', function () {
        updateSlider();
    });

    // ---- 360 Product Viewer ----
    var viewerRotation = 0;
    var isDragging = false;
    var startX = 0;
    var isAutoRotating = false;
    var autoRotateInterval;
    var zoomMode = false;

    var $viewer = $('#viewer360');
    var $viewerObject = $('#viewerObject');
    var $objectFace = $('#objectFace');
    var $viewerEmoji = $('#viewerEmoji');
    var $viewerFaceLabel = $('#viewerFaceLabel');
    var $zoomLens = $('#zoomLens');

    // Product data for tabs
    var productData = {
        'MoonAura Lamp': {
            emoji: '🌙',
            desc: 'The MoonAura Lamp is a stunning lunar-inspired piece crafted with precision 3D printing technology. Its detailed surface texture mimics the real moon, creating a beautiful ambient glow for any room.',
            price: 'Starting from \u20B9599'
        },
        'NameBloom': {
            emoji: '🌸',
            desc: 'NameBloom is an elegant personalized name art piece featuring a beautiful bloom design. Each letter is carefully crafted with smooth curves and precise detailing.',
            price: 'Starting from \u20B9399'
        },
        'ScanCharm': {
            emoji: '📱',
            desc: 'ScanCharm is a custom phone charm with integrated QR code technology. A perfect blend of personalization and functionality for the modern user.',
            price: 'Starting from \u20B9299'
        },
        'Glow Tag': {
            emoji: '🏷️',
            desc: 'Glow Tags are personalized identity accessories that glow in the dark. Made with premium glow-in-the-dark filament for a unique, eye-catching effect.',
            price: 'Starting from \u20B9249'
        }
    };

    // Angle labels for different views
    var angleLabels = {
        0: 'Front View',
        45: 'Top View',
        90: 'Right Side',
        180: 'Back View',
        270: 'Left Side',
        315: 'Perspective View'
    };

    // Update viewer display
    function updateViewerDisplay() {
        var normalizedAngle = ((viewerRotation % 360) + 360) % 360;

        // Determine closest angle label
        var closestAngle = 0;
        var minDiff = 360;
        var knownAngles = [0, 45, 90, 180, 270, 315];
        knownAngles.forEach(function (a) {
            var diff = Math.abs(normalizedAngle - a);
            if (diff > 180) diff = 360 - diff;
            if (diff < minDiff) {
                minDiff = diff;
                closestAngle = a;
            }
        });

        var label = angleLabels[closestAngle] || 'Custom View';
        $viewerFaceLabel.text(label);

        // Apply 3D transform
        var skewY = Math.sin((viewerRotation * Math.PI) / 180) * 10;
        var scale = 1 + Math.abs(Math.sin((viewerRotation * Math.PI) / 180)) * 0.05;
        $viewerObject.css('transform', 'rotateY(' + viewerRotation + 'deg) skewY(' + skewY + 'deg) scale(' + scale + ')');

        // Update active angle button
        $('.angle-btn').removeClass('active');
        $('.angle-btn').each(function () {
            var btnAngle = parseInt($(this).attr('data-angle'));
            if (btnAngle === closestAngle) {
                $(this).addClass('active');
            }
        });
    }

    // Mouse drag on viewport
    $viewer.on('mousedown touchstart', function (e) {
        isDragging = true;
        startX = e.type === 'touchstart' ? e.originalEvent.touches[0].clientX : e.clientX;
        $viewer.css('cursor', 'grabbing');
        e.preventDefault();
    });

    $(document).on('mousemove touchmove', function (e) {
        if (!isDragging) return;
        var clientX = e.type === 'touchmove' ? e.originalEvent.touches[0].clientX : e.clientX;
        var deltaX = clientX - startX;
        viewerRotation += deltaX * 0.5;
        startX = clientX;
        updateViewerDisplay();
    });

    $(document).on('mouseup touchend', function () {
        isDragging = false;
        $viewer.css('cursor', 'grab');
    });

    // Zoom lens on hover
    $viewer.on('mousemove', function (e) {
        if (!zoomMode) return;
        var rect = this.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;

        $zoomLens.css({
            left: (x - 60) + 'px',
            top: (y - 60) + 'px',
            backgroundImage: 'url(' + getEmojiDataUrl($('#viewerEmoji').text()) + ')',
            backgroundSize: '400px 400px',
            backgroundPosition: (-x * 2 + 60) + 'px ' + (-y * 2 + 60) + 'px'
        });
    });

    // Helper: Convert emoji to data URL for zoom lens
    function getEmojiDataUrl(emoji) {
        var canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        var ctx = canvas.getContext('2d');
        ctx.font = '120px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(emoji, 100, 100);
        return canvas.toDataURL();
    }

    // Auto Rotate Toggle
    $('#rotateToggle').on('click', function () {
        isAutoRotating = !isAutoRotating;
        $(this).toggleClass('active');

        if (isAutoRotating) {
            autoRotateInterval = setInterval(function () {
                viewerRotation += 0.5;
                updateViewerDisplay();
            }, 16);
        } else {
            clearInterval(autoRotateInterval);
        }
    });

    // Zoom Toggle
    $('#zoomToggle').on('click', function () {
        zoomMode = !zoomMode;
        $(this).toggleClass('active');
        if (!zoomMode) {
            $zoomLens.hide();
        } else {
            $zoomLens.show();
        }
    });

    // Fullscreen Toggle
    $('#fullscreenToggle').on('click', function () {
        var container = document.querySelector('.viewer-360-container');
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else if (container.requestFullscreen) {
            container.requestFullscreen();
        } else if (container.webkitRequestFullscreen) {
            container.webkitRequestFullscreen();
        }
    });

    // Angle Buttons
    $('.angle-btn').on('click', function () {
        var targetAngle = parseInt($(this).attr('data-angle'));
        var currentAngle = ((viewerRotation % 360) + 360) % 360;
        var diff = targetAngle - currentAngle;

        // Find shortest rotation path
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;

        // Animate to target
        var startRotation = viewerRotation;
        var targetRotation = viewerRotation + diff;
        var duration = 600;
        var startTime = Date.now();

        function animateAngle() {
            var elapsed = Date.now() - startTime;
            var progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            progress = 1 - Math.pow(1 - progress, 3);

            viewerRotation = startRotation + (targetRotation - startRotation) * progress;
            updateViewerDisplay();

            if (progress < 1) {
                requestAnimationFrame(animateAngle);
            }
        }

        animateAngle();
    });

    // ---- Product Tabs (Product Experience Section) ----
    $('.product-tab').on('click', function () {
        var productName = $(this).attr('data-product-name');
        var productEmoji = $(this).attr('data-emoji');
        var productDesc = $(this).attr('data-desc');

        // Update active tab
        $('.product-tab').removeClass('active');
        $(this).addClass('active');

        // Update product display with animation
        var $name = $('#expProductName');
        var $desc = $('#expProductDesc');
        var $emoji = $('#viewerEmoji');
        var $price = $('.product-price');

        // Fade out
        $name.css({ opacity: 0, transform: 'translateY(10px)' });
        $desc.css({ opacity: 0, transform: 'translateY(10px)' });
        $emoji.css({ opacity: 0, transform: 'scale(0.8)' });

        setTimeout(function () {
            $name.text(productName);
            $desc.text(productDesc);
            $emoji.text(productEmoji);

            var data = productData[productName];
            if (data) {
                $price.text(data.price);
            }

            // Fade in
            $name.css({ opacity: 1, transform: 'translateY(0)' });
            $desc.css({ opacity: 1, transform: 'translateY(0)' });
            $emoji.css({ opacity: 1, transform: 'scale(1)' });
        }, 300);

        // Reset rotation
        viewerRotation = 0;
        updateViewerDisplay();
    });

    // Add transition styles for product details
    $('#expProductName, #expProductDesc, #viewerEmoji').css({
        transition: 'all 0.4s ease'
    });

    // ---- View Details Buttons (scroll to experience section) ----
    $('.btn-view-details').on('click', function () {
        $('html, body').animate({
            scrollTop: $('#product-experience').offset().top - 70
        }, 600, 'swing');
    });

    // ---- Scroll To Top Button ----
    var $scrollBtn = $('#scrollToTop');

    $(window).on('scroll', function () {
        if ($(this).scrollTop() > 400) {
            $scrollBtn.addClass('visible');
        } else {
            $scrollBtn.removeClass('visible');
        }
    });

    $scrollBtn.on('click', function () {
        $('html, body').animate({ scrollTop: 0 }, 600, 'swing');
    });

    // ---- Parallax Effect on Hero Blobs ----
    $(window).on('mousemove', function (e) {
        var mouseX = e.clientX / $(window).width() - 0.5;
        var mouseY = e.clientY / $(window).height() - 0.5;

        $('.hero-blob-1').css('transform', 'translate(' + (mouseX * 30) + 'px, ' + (mouseY * 30) + 'px)');
        $('.hero-blob-2').css('transform', 'translate(' + (mouseX * -20) + 'px, ' + (mouseY * -20) + 'px)');
        $('.hero-blob-3').css('transform', 'translate(' + (mouseX * 15) + 'px, ' + (mouseY * 15) + 'px)');
    });

    // ---- Floating Object Tilt on Hover ----
    $('.floating-object').on('mousemove', function (e) {
        var rect = this.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var centerX = rect.width / 2;
        var centerY = rect.height / 2;
        var rotateX = (y - centerY) / 10;
        var rotateY = (centerX - x) / 10;

        $(this).css('transform', 'perspective(500px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale(1.05)');
    });

    $('.floating-object').on('mouseleave', function () {
        $(this).css('transform', '');
    });

    // ---- Service Cards - Stagger Animation on Scroll ----
    // Handled by AOS

    // ---- Initial setup ----
    updateViewerDisplay();

    // ---- Keyboard navigation for 360 viewer ----
    $(document).on('keydown', function (e) {
        if (!$viewer.is(':visible')) return;

        if (e.key === 'ArrowLeft') {
            viewerRotation -= 15;
            updateViewerDisplay();
        } else if (e.key === 'ArrowRight') {
            viewerRotation += 15;
            updateViewerDisplay();
        }
    });

    // ---- Touch support for mobile menu ----
    var touchStartY = 0;
    $(document).on('touchstart', function (e) {
        touchStartY = e.originalEvent.touches[0].clientY;
    });

    // ---- Resize handler ----
    var resizeTimer;
    $(window).on('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            AOS.refresh();
            updateSlider();
        }, 250);
    });

    // ---- Add subtle animation to service cards on hover ----
    $('.service-card').on('mouseenter', function () {
        $(this).find('.service-icon').addClass('animated');
    });

    // ---- Prevent body scroll when mobile menu is open ----
    // (handled via CSS class toggle)

    console.log('🚀 Anjani Putra Website Loaded Successfully');
});
