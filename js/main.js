/* ============================================
   ADZIO - Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    initNavigation();
    initScrollAnimations();
    initCounters();

    initVSLPlayer();
    initSmoothScroll();
    initFormHandling();
    initParallax();
    initCarouselPause();
    initGlowRotation();
});

// Pause logo carousel when off-screen to save GPU
function initCarouselPause() {
    const tracks = document.querySelectorAll('.slide-track');
    if (!tracks.length) return;

    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            entry.target.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
        });
    }, { threshold: 0 });

    tracks.forEach(track => obs.observe(track));
}

// Rotate glow elements when on-screen to save GPU
function initGlowRotation() {
    const glimmers = document.querySelectorAll('.badge-glow, .step-node-glow, .step-node-ring');
    if (!glimmers.length) return;

    const rotationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-spinning');
            } else {
                entry.target.classList.remove('is-spinning');
            }
        });
    }, { threshold: 0.1 });

    glimmers.forEach(g => rotationObserver.observe(g));
}

/* ============================================
   Navigation
   ============================================ */

function initNavigation() {
    const nav = document.getElementById('nav');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const navLinksItems = document.querySelectorAll('.nav-link');

    // Scroll behavior for navigation
    let lastScroll = 0;

    window.addEventListener('scroll', throttle(() => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }, 100), { passive: true });

    // Mobile menu toggle
    navToggle?.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('open');
        navToggle.classList.toggle('open');
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close mobile menu on any link click that navigates
    const allNavLinks = document.querySelectorAll('#navLinks a, .nav-cta');
    allNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle?.classList.remove('open');
            navLinks?.classList.remove('open');
            document.body.style.overflow = '';
        });
    });

    // Active link on scroll
    const sections = document.querySelectorAll('section[id]');

    function updateActiveLink() {
        const scrollPosition = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinksItems.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', throttle(updateActiveLink, 100), { passive: true });
    updateActiveLink();
}

/* ============================================
   Scroll Animations
   ============================================ */

function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
                // Remove transition after animation completes to free up browser resources
                // Must be longer than max stagger delay (0.6s) + transition duration (0.8s)
                setTimeout(() => {
                    entry.target.style.transition = 'none';
                }, 2000);
            }
        });
    }, observerOptions);

    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

/* ============================================
   Counter Animation
   ============================================ */

function initCounters() {
    const counters = document.querySelectorAll('.stat-number[data-count]');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}

function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-count'));
    const duration = parseInt(element.getAttribute('data-duration')) || 2000; // 2 seconds default
    const startTime = performance.now();

    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);

        const current = Math.floor(easeOut * target);
        element.textContent = current.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target.toLocaleString();
        }
    }

    requestAnimationFrame(updateCounter);
}



/* ============================================
   VSL Video Player
   ============================================ */

function initVSLPlayer() {
    const playBtn = document.getElementById('playBtn');
    const vslThumbnail = document.getElementById('vslThumbnail');
    const vslModal = document.getElementById('vslModal');
    const vslModalVideo = document.getElementById('vslModalVideo');
    const vslModalClose = document.getElementById('vslModalClose');
    const vslModalOverlay = document.getElementById('vslModalOverlay');

    if (!playBtn || !vslModal || !vslModalVideo) return;

    // Play/Pause thumbnail video on scroll
    if (vslThumbnail && 'IntersectionObserver' in window) {
        const thumbnailObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Try to play but catch if autoplay is blocked by browser
                    vslThumbnail.play().catch(e => console.log('Thumbnail autoplay prevented:', e));
                } else {
                    vslThumbnail.pause();
                }
            });
        }, { threshold: 0.1 });
        thumbnailObserver.observe(vslThumbnail);
    }

    const openModal = () => {
        vslModal.classList.add('is-open');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
        if (vslThumbnail) vslThumbnail.pause(); // Pause thumbnail
        vslModalVideo.currentTime = 0; // Reset video to start
        vslModalVideo.play();
    };

    const closeModal = () => {
        vslModal.classList.remove('is-open');
        document.body.style.overflow = ''; // Restore scrolling
        vslModalVideo.pause();

        // Only play thumbnail again if it's currently in the viewport
        if (vslThumbnail && isInViewport(vslThumbnail)) {
            vslThumbnail.play().catch(e => console.log('Thumbnail play prevented:', e));
        }
    };

    // Events
    playBtn.addEventListener('click', openModal);

    // Close modal handlers
    if (vslModalClose) vslModalClose.addEventListener('click', closeModal);
    if (vslModalOverlay) vslModalOverlay.addEventListener('click', closeModal);

    // Close modal when video ends
    vslModalVideo.addEventListener('ended', closeModal);
}

/* ============================================
   Smooth Scroll
   ============================================ */

function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');

            if (href === '#') return;

            const target = document.querySelector(href);

            if (target) {
                e.preventDefault();
                const navHeight = document.getElementById('nav')?.offsetHeight || 0;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ============================================
   Form Handling
   ============================================ */

function initFormHandling() {
    const form = document.getElementById('contactForm');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        // Show loading state
        submitBtn.innerHTML = `
            <svg class="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
            </svg>
            <span>Sending...</span>
        `;
        submitBtn.disabled = true;

        // Collect form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Simulate API call (replace with actual endpoint)
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Success state - Replace form with success screen
            const userName = data.name || 'Friend';
            const nameSpan = document.getElementById('successName');
            if (nameSpan) nameSpan.textContent = userName;

            // Fade out form and fade in success screen
            form.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            form.style.opacity = '0';
            form.style.transform = 'translateY(-20px)';

            setTimeout(() => {
                form.style.display = 'none';

                // Also hide the CTA headers to focus on the success message
                const ctaTitle = document.querySelector('.cta-title');
                const ctaSubtitle = document.querySelector('.cta-subtitle');
                if (ctaTitle) ctaTitle.style.display = 'none';
                if (ctaSubtitle) ctaSubtitle.style.display = 'none';

                const successScreen = document.getElementById('formSuccess');
                if (successScreen) {
                    successScreen.style.display = 'block';
                    // Scroll to top of CTA section so user sees the success message
                    successScreen.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 400);

        } catch (error) {
            // Error state
            submitBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                <span>Error - Try Again</span>
            `;
            submitBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
            submitBtn.disabled = false;

            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.style.background = '';
            }, 3000);
        }
    });

    // Input animations
    const inputs = form.querySelectorAll('input, select, textarea');

    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', () => {
            input.parentElement.classList.remove('focused');
        });
    });

    // Smart auto-expand textarea
    const textarea = form.querySelector('textarea');
    if (textarea) {
        function autoExpand() {
            // Reset height to auto to get the correct scrollHeight
            textarea.style.height = 'auto';
            // Set height to scrollHeight (content height)
            const newHeight = Math.min(textarea.scrollHeight, 400); // max-height from CSS
            textarea.style.height = newHeight + 'px';

            // Show scrollbar if content exceeds max height
            if (textarea.scrollHeight > 400) {
                textarea.style.overflowY = 'auto';
            } else {
                textarea.style.overflowY = 'hidden';
            }
        }

        textarea.addEventListener('input', autoExpand);
        textarea.addEventListener('focus', autoExpand);
        // Initial call to set correct height if there's default content
        autoExpand();
    }
}

/* ============================================
   Parallax Effects
   ============================================ */

function initParallax() {
    const parallaxElements = document.querySelectorAll('.hero-orb');
    const heroSection = document.querySelector('.hero');

    if (window.innerWidth < 768 || !heroSection) return;

    let ticking = false;
    let heroVisible = true;

    // Only run parallax when hero is on screen
    if ('IntersectionObserver' in window) {
        const obs = new IntersectionObserver((entries) => {
            heroVisible = entries[0].isIntersecting;
        }, { threshold: 0 });
        obs.observe(heroSection);
    }

    window.addEventListener('scroll', () => {
        if (!ticking && heroVisible) {
            requestAnimationFrame(() => {
                const scrolled = window.pageYOffset;
                parallaxElements.forEach((element, index) => {
                    const speed = (index + 1) * 0.1;
                    element.style.transform = `translateY(${scrolled * speed}px)`;
                });
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

/* ============================================
   Utility Functions
   ============================================ */

// Debounce function
function debounce(func, wait = 100) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function
function throttle(func, limit = 100) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/* ============================================
   Performance Optimizations
   ============================================ */

// Lazy load images
document.addEventListener('DOMContentLoaded', () => {
    const lazyImages = document.querySelectorAll('img[data-src]');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for older browsers
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
        });
    }
});

// Preload critical resources
function preloadResource(url, type) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = type;
    document.head.appendChild(link);
}

/* ============================================
   Page Visibility API
   ============================================ */

document.addEventListener('visibilitychange', () => {
    // Pause/resume carousel animations on tab visibility
    const tracks = document.querySelectorAll('.slide-track');
    tracks.forEach(t => {
        t.style.animationPlayState = document.hidden ? 'paused' : 'running';
    });
});

