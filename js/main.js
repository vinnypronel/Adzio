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
    initCustomSelects();
    initFormHandling();
    initParallax();
    initCarouselTracks();
    initCarouselPause();
    initCarouselHover();
    initNavParallax();
    initGlowRotation();
    initLottieAnimations();
    initHeroLeftScroll();
    initProblemReveal();
});

/* ============================================
   Problem Section Stagger Reveal
   ============================================ */

function initProblemReveal() {
    const spotlight = document.getElementById('problem-visibility');
    if (!spotlight) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    spotlight.classList.add('is-revealed');
                    observer.unobserve(spotlight);
                }
            });
        },
        { threshold: 0.25 }
    );

    observer.observe(spotlight);
}

/* ============================================
   Hero Left Scroll Animation
   ============================================ */

function initHeroLeftScroll() {
    const col = document.querySelector('.hero-left-col');
    if (!col) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                col.classList.toggle('hero-left-hidden', window.scrollY > 280);
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

/* ============================================
   Nav Scroll - CSS scroll-driven animation
   ============================================ */

// The actual scrolling animation is now handled entirely by CSS:
//   @keyframes nav-slide + animation-timeline: scroll(root block)
//   Both running on the GPU compositor thread - zero JS during scroll.
//
// This function only:
//   1. Sets --nav-from / --nav-to CSS vars on load + resize
//   2. Tracks _navScrollProgress for the hover-morph _navReframe
//   3. Fires the .scrolled boundary class event (once, at docked threshold)
//   4. Provides _navReframe for applyFrame to use while .nav-morphing
//
function initNavParallax() {
    const wrap = document.getElementById('navWrap');
    if (!wrap) return;

    const REST_W = 120;
    const DOCKED_LEFT = 16;
    const SCROLL_DIST = 150;

    window._navDockedW = 90;
    
    const isFixedSide = wrap.dataset.navFixedSide === 'true';
    if (isFixedSide) {
        window._navScrollProgress = 1;
        window._navScrolled = true;
        wrap.classList.add('scrolled');
        window._navCurW = window._navDockedW;
    } else {
        window._navScrollProgress = 0;
        window._navCurW = REST_W;
    }

    // Update the CSS variables that @keyframes nav-slide reads
    function updateVars() {
        const vw = window.innerWidth;

        // Scale the whole nav pill up on bigger monitors. 1.0 at <=1440px,
        // ramping to ~1.28 by 2560px+. Drives a transform: scale() in CSS so
        // the SVG geometry / centering math stays untouched.
        const navScale = 1 + Math.min(Math.max((vw - 1440) / 1120, 0), 1) * 0.28;
        document.documentElement.style.setProperty('--nav-scale', navScale.toFixed(3));

        const restMode = wrap.dataset.navRest || 'left';
        const anchorL = restMode === 'center'
            ? vw / 2
            : vw * 0.17; // Home starts above the 'e' in 'Help'
        const anchorDocked = DOCKED_LEFT + (window._navDockedW / 2); // Compact pill docks flush to the top-left

        document.documentElement.style.setProperty('--nav-shift-from', `${anchorL}px`);
        document.documentElement.style.setProperty('--nav-shift-to', `${anchorDocked}px`);
        window._navShiftFrom = anchorL;
        window._navShiftTo = anchorDocked;
    }
    updateVars();
    if (isFixedSide) {
        setTimeout(() => {
            if (typeof window._navReframe === 'function') window._navReframe(window._navDockedW);
        }, 0);
    }
    window.addEventListener('resize', updateVars, { passive: true });

    // Track progress + fire boundary class - zero transform writes here
    let wasScrolled = isFixedSide ? true : null;
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (isFixedSide) return;
        if (!ticking) {
            requestAnimationFrame(() => {
                const raw = window.scrollY / SCROLL_DIST;
                const progress = raw < 0 ? 0 : raw > 1 ? 1 : raw;
                window._navScrollProgress = progress;

                const isScrolled = progress >= 1;
                if (isScrolled !== wasScrolled) {
                    wasScrolled = isScrolled;
                    window._navScrolled = isScrolled;
                    wrap.classList.toggle('scrolled', isScrolled);
                    if (typeof window._navStartAnim === 'function') window._navStartAnim(false);
                }
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // Called by applyFrame during hover morph (animation:none active via .nav-morphing)
    // so the nav stays centred for any width at the current scroll position.
    window._navReframe = function (navW) {
        const p = window._navScrollProgress || 0;
        const anchorL = window._navShiftFrom || 0;
        const dockedLeft = DOCKED_LEFT + ((navW || window._navDockedW || REST_W) / 2);
        const currentTarget = p >= 1 ? dockedLeft : anchorL + (dockedLeft - anchorL) * p;
        
        // Keep the left edge pinned while the nav morphs between compact and expanded docked states.
        wrap.style.transform = `translate3d(calc(${currentTarget}px - 50%), 0, 0)`;
    };
}

// Uses a CSS class instead of inline styles so the CSS hover rule isn't overridden
function initCarouselPause() {
    const tracks = document.querySelectorAll('.slide-track');
    if (!tracks.length) return;

    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            entry.target.classList.toggle('is-paused-offscreen', !entry.isIntersecting);
            if (!entry.isIntersecting) {
                entry.target.style.animationPlayState = 'paused';
                return;
            }

            entry.target.style.animationPlayState = entry.target.dataset.hoverPaused === 'true'
                ? 'paused'
                : 'running';
        });
    }, { threshold: 0 });

    tracks.forEach(track => obs.observe(track));
}

function initCarouselTracks() {
    const slider = document.querySelector('.logo-slider');
    if (!slider) return;

    const rebuild = debounce(() => prepareCarouselTracks(slider), 120);

    prepareCarouselTracks(slider);

    if (!slider.dataset.carouselResizeBound) {
        slider.dataset.carouselResizeBound = 'true';
        window.addEventListener('resize', rebuild, { passive: true });
    }
}

async function prepareCarouselTracks(slider) {
    const tracks = Array.from(slider.querySelectorAll('.slide-track'));
    const viewports = Array.from(slider.querySelectorAll('.logo-slider-viewport'));
    if (!tracks.length || !viewports.length) return;

    slider.classList.remove('is-ready');
    slider._carouselBuildId = (slider._carouselBuildId || 0) + 1;
    const buildId = slider._carouselBuildId;

    await waitForCarouselImages(slider);
    if (buildId !== slider._carouselBuildId) return;

    let safeViewportWidth = Infinity;

    tracks.forEach(track => {
        if (!track.dataset.baseHtml) {
            track.dataset.baseHtml = track.innerHTML.trim();
        }

        track.innerHTML = track.dataset.baseHtml;
        track.style.animationPlayState = 'paused';

        const baseWidth = track.scrollWidth;
        track.dataset.baseWidth = String(baseWidth);
        safeViewportWidth = Math.min(safeViewportWidth, baseWidth - 24);
    });

    const viewportMax = Number.isFinite(safeViewportWidth) && safeViewportWidth > 0
        ? `${Math.floor(safeViewportWidth)}px`
        : '';

    viewports.forEach(viewport => {
        viewport.style.maxWidth = viewportMax;
    });

    tracks.forEach(track => {
        const baseHtml = track.dataset.baseHtml || '';
        const baseWidth = parseFloat(track.dataset.baseWidth || '0');
        const originalsCount = track.children.length;

        track.insertAdjacentHTML('beforeend', baseHtml);
        Array.from(track.children).slice(originalsCount).forEach(slide => {
            slide.dataset.clone = 'true';
        });

        track.style.setProperty('--carousel-shift', `${baseWidth}px`);
        track.style.setProperty(
            '--carousel-duration',
            track.classList.contains('slide-track-top') ? '21s' : '17s'
        );

        if (!track.classList.contains('is-paused-offscreen')) {
            track.style.animationPlayState = 'running';
        } else {
            track.style.animationPlayState = 'paused';
        }
    });

    if (buildId === slider._carouselBuildId) {
        slider.classList.add('is-ready');
    }
}

function waitForCarouselImages(slider) {
    const images = Array.from(slider.querySelectorAll('img'));
    if (!images.length) return Promise.resolve();

    return Promise.all(images.map(image => {
        if (image.complete && image.naturalWidth > 0) {
            return Promise.resolve();
        }

        return new Promise(resolve => {
            const done = () => resolve();
            image.addEventListener('load', done, { once: true });
            image.addEventListener('error', done, { once: true });
        });
    }));
}

// Hover: pause carousel + scale hovered logo
// Only the row that contains the hovered logo is paused - the other row keeps running.
function initCarouselHover() {
    const slider = document.querySelector('.logo-slider');
    if (!slider) return;

    let activeSlide = null;
    let activeTrack = null;

    function releaseActive() {
        if (activeSlide) {
            activeSlide.classList.remove('is-hovered');
        }

        if (activeTrack) {
            activeTrack.dataset.hoverPaused = 'false';
        }

        if (activeTrack && !activeTrack.classList.contains('is-paused-offscreen')) {
            activeTrack.style.animationPlayState = 'running';
        }

        activeSlide = null;
        activeTrack = null;
    }

    function activateSlide(slide) {
        const track = slide.closest('.slide-track');
        if (!track) return;

        if (activeSlide === slide && activeTrack === track) return;
        releaseActive();

        activeSlide = slide;
        activeTrack = track;
        activeSlide.classList.add('is-hovered');
        activeTrack.dataset.hoverPaused = 'true';
        activeTrack.style.animationPlayState = 'paused';
    }

    slider.addEventListener('mouseover', (event) => {
        const slide = event.target.closest('.slide');
        if (!slide || !slider.contains(slide)) return;
        activateSlide(slide);
    });

    slider.addEventListener('mouseout', (event) => {
        const slide = event.target.closest('.slide');
        if (!slide || !slider.contains(slide)) return;

        const nextSlide = event.relatedTarget && event.relatedTarget.closest
            ? event.relatedTarget.closest('.slide')
            : null;

        if (nextSlide && slider.contains(nextSlide)) {
            activateSlide(nextSlide);
            return;
        }

        releaseActive();
    });

    slider.addEventListener('mouseleave', () => {
        releaseActive();
    });
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
    // 'nav' element doesn't exist in this page (uses navWrap) - guard to prevent
    // TypeError crashes that were throwing on every scroll event and causing lag.
    const nav = document.getElementById('nav');
    if (!nav) return;  // bail out entirely - the morphing navbar handles its own state

    window.addEventListener('scroll', throttle(() => {
        nav.classList.toggle('scrolled', window.pageYOffset > 50);
    }, 100), { passive: true });
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

    // Play/Pause thumbnail video on scroll - Disabled in favor of GSAP scroll transition
    /*
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
    */

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
    const quizForm = document.getElementById('quizForm');
    const disclaimerModal = document.getElementById('disclaimerModal');
    const disclaimerHomeBtn = document.getElementById('disclaimerHomeBtn');

    if (!quizForm) return;

    let currentStep = 1;
    const totalSteps = 6;
    
    // Formatting Phone Input
    const phoneInput = quizForm.querySelector('#phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
            let formatted = '';
            if (digits.length <= 3) {
                formatted = digits.length ? `(${digits}` : '';
            } else if (digits.length <= 6) {
                formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
            } else {
                formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
            }
            e.target.value = formatted;
        });
    }

    function resetQuiz() {
        currentStep = 1;
        quizForm.reset();
        
        // Reset select values inside form since select elements have custom sync logic
        quizForm.querySelectorAll('select').forEach(sel => {
            sel.value = '';
            // If custom-select wrapper exists, sync it
            const customSelect = sel.parentNode.querySelector('.custom-select');
            if (customSelect) {
                const valueSpan = customSelect.querySelector('.custom-select-value');
                const trigger = customSelect.querySelector('.custom-select-trigger');
                const placeholderOption = sel.options[0];
                if (valueSpan) valueSpan.textContent = placeholderOption ? placeholderOption.text : '';
                if (trigger) trigger.classList.add('is-placeholder');
                
                customSelect.querySelectorAll('.custom-select-item').forEach(li => {
                    li.classList.remove('is-selected');
                });
            }
            // Sync hidden inputs generated by initCustomSelects
            const hidden = sel.parentNode.querySelector('input[type="hidden"]');
            if (hidden) hidden.value = '';
        });
        
        // Clear all field validation errors
        quizForm.querySelectorAll('.field-invalid').forEach(el => el.classList.remove('field-invalid'));
        quizForm.querySelectorAll('.form-field-error').forEach(el => el.remove());
        
        // Show step 1 and hide others
        showStep(currentStep);
        
        // Reset success state
        document.getElementById('quizSuccess').style.display = 'none';
        quizForm.style.display = 'block';
        quizForm.style.opacity = '1';
        quizForm.style.transform = '';
    }


    // Smooth-scroll links that target #contact ONLY when that section exists on
    // the current page. On other pages (e.g. services.html) these are cross-page
    // links like index.html#contact — let the browser navigate normally.
    document.querySelectorAll('a[href="#contact"], a[href$="#contact"]').forEach(cta => {
        cta.addEventListener('click', (e) => {
            const target = document.getElementById('contact');
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Disclaimer controls
    function openDisclaimer() {
        // Scroll to top first, then show modal after a brief delay for smooth UX
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
            disclaimerModal.classList.add('is-open');
        }, 450);
    }

    function closeDisclaimer() {
        disclaimerModal.classList.remove('is-open');
    }

    if (disclaimerHomeBtn) {
        disclaimerHomeBtn.addEventListener('click', () => {
            closeDisclaimer();
            // Scroll smoothly to home/top
            window.scrollTo({ top: 0, behavior: 'smooth' });
            // Reset the quiz to beginning
            setTimeout(resetQuiz, 500);
        });
    }

    // Validation styling helpers
    function showFieldError(field, message) {
        clearFieldError(field);
        field.classList.add('field-invalid');
        const err = document.createElement('span');
        err.className = 'form-field-error';
        err.style.color = '#ff6b6b';
        err.style.fontSize = '0.8rem';
        err.style.marginTop = '0.25rem';
        err.style.display = 'block';
        err.textContent = message;
        field.parentNode.appendChild(err);
    }

    function clearFieldError(field) {
        field.classList.remove('field-invalid');
        const existing = field.parentNode.querySelector('.form-field-error');
        if (existing) existing.remove();
    }

    // List of validations by ID
    const fieldValidations = {
        'first-name': { msg: 'First name is required.' },
        'last-name':  { msg: 'Last name is required.' },
        'phone':      { msg: 'Phone number is required.', test: v => v.replace(/\D/g, '').length === 10 },
        'email':      { msg: 'Please enter a valid email.', test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
        'revenue':    { msg: 'Please select a revenue range.' },
        'business':   { msg: 'Please select your current situation.' },
        'service':    { msg: 'Please select a service.' },
        'timeline':   { msg: 'Please select a timeline.' }
    };

    // Clear error on input change
    Object.keys(fieldValidations).forEach(id => {
        const el = quizForm.querySelector('#' + id);
        if (el) {
            el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', () => clearFieldError(el));
        }
    });

    // Step Validation function
    function validateStep(stepNum) {
        let isValid = true;
        const stepContainer = quizForm.querySelector(`.quiz-step[data-step="${stepNum}"]`);
        if (!stepContainer) return true;

        // Find all fields in the active step that need validation
        const fieldsInStep = stepContainer.querySelectorAll('input[required], select[required], textarea[required]');
        
        fieldsInStep.forEach(el => {
            const rules = fieldValidations[el.id];
            if (rules) {
                const val = el.value.trim();
                const ok = rules.test ? rules.test(val) : val !== '';
                if (!ok) {
                    showFieldError(el, rules.msg);
                    isValid = false;
                } else {
                    clearFieldError(el);
                }
            }
        });

        return isValid;
    }

    // Step Rendering function
    function showStep(stepNum) {
        // Toggle steps visibility
        quizForm.querySelectorAll('.quiz-step').forEach(stepEl => {
            stepEl.classList.remove('active');
        });
        
        const activeStepEl = quizForm.querySelector(`.quiz-step[data-step="${stepNum}"]`);
        if (activeStepEl) {
            activeStepEl.classList.add('active');
        }

        // Update progress bar
        const progressPercent = (stepNum / totalSteps) * 100;
        document.getElementById('quizCurrentStepNum').textContent = stepNum;
        document.getElementById('quizProgressFill').style.width = progressPercent + '%';

        // Toggle back button
        const prevBtn = document.getElementById('quizPrevBtn');
        if (prevBtn) {
            prevBtn.style.display = stepNum > 1 ? 'flex' : 'none';
        }

        // Toggle next/submit button text
        const nextBtn = document.getElementById('quizNextBtn');
        if (nextBtn) {
            if (stepNum === totalSteps) {
                nextBtn.querySelector('span').textContent = 'Submit Assessment';
            } else {
                nextBtn.querySelector('span').textContent = 'Next';
            }
        }
    }

    function nextStep() {
        if (!validateStep(currentStep)) return;

        // Special qualification logic for monthly revenue (Step 4)
        if (currentStep === 4) {
            const revenueVal = quizForm.querySelector('#revenue').value;
            if (revenueVal === '5k-10k') {
                openDisclaimer();
                return;
            }
        }

        if (currentStep < totalSteps) {
            currentStep++;
            showStep(currentStep);
        } else {
            // Submit form
            submitQuizForm();
        }
    }

    function prevStep() {
        if (currentStep > 1) {
            currentStep--;
            showStep(currentStep);
        }
    }

    // Navigation buttons wiring
    const nextBtn = document.getElementById('quizNextBtn');
    const prevBtn = document.getElementById('quizPrevBtn');

    if (nextBtn) nextBtn.addEventListener('click', nextStep);
    if (prevBtn) prevBtn.addEventListener('click', prevStep);

    // Submit handler
    async function submitQuizForm() {
        const originalBtnHtml = nextBtn.innerHTML;

        // Show loading state
        nextBtn.innerHTML = `
            <svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: spin 1s linear infinite;">
                <circle cx="12" cy="12" r="10" stroke-opacity="0.25" stroke="currentColor"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
            </svg>
            <span>Submitting...</span>
        `;
        nextBtn.disabled = true;
        if (prevBtn) prevBtn.disabled = true;

        const formData = new FormData(quizForm);
        const data = Object.fromEntries(formData.entries());

        // Simulate API call
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Success state
            const userName = data.first_name || 'Friend';
            document.getElementById('quizSuccessName').textContent = userName;

            // Animate transition to success
            quizForm.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            quizForm.style.opacity = '0';
            quizForm.style.transform = 'translateY(-20px)';

            setTimeout(() => {
                quizForm.style.display = 'none';
                const successScreen = document.getElementById('quizSuccess');
                if (successScreen) {
                    successScreen.style.display = 'block';
                }
            }, 400);

        } catch (error) {
            nextBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                <span>Error - Try Again</span>
            `;
            nextBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
            nextBtn.disabled = false;
            if (prevBtn) prevBtn.disabled = false;

            setTimeout(() => {
                nextBtn.innerHTML = originalBtnHtml;
                nextBtn.style.background = '';
            }, 3000);
        }
    }

    // Success Finish button
    const successCloseBtn = document.getElementById('quizSuccessCloseBtn');
    if (successCloseBtn) {
        successCloseBtn.addEventListener('click', () => {
            resetQuiz();
        });
    }

    // Textarea autoexpand inside quiz
    const textarea = quizForm.querySelector('textarea');
    if (textarea) {
        function autoExpand() {
            textarea.style.height = 'auto';
            const newHeight = Math.min(textarea.scrollHeight, 180);
            textarea.style.height = newHeight + 'px';
            if (textarea.scrollHeight > 180) {
                textarea.style.overflowY = 'auto';
            } else {
                textarea.style.overflowY = 'hidden';
            }
        }
        textarea.addEventListener('input', autoExpand);
        textarea.addEventListener('focus', autoExpand);
    }
}

/* ============================================
   Custom Select Dropdowns
   ============================================ */

function initCustomSelects() {
    document.querySelectorAll('.form-group select').forEach(select => {
        // Hidden input carries the value for FormData — native select loses its name
        const hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.name = select.name;
        hidden.value = select.value;
        select.removeAttribute('name');
        select.parentNode.insertBefore(hidden, select);

        // Wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'custom-select';

        // Trigger button
        const trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'custom-select-trigger';
        trigger.setAttribute('aria-haspopup', 'listbox');
        trigger.setAttribute('aria-expanded', 'false');

        const valueSpan = document.createElement('span');
        valueSpan.className = 'custom-select-value';

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'custom-select-chevron');
        svg.setAttribute('width', '16');
        svg.setAttribute('height', '16');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');
        const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        poly.setAttribute('points', '6 9 12 15 18 9');
        svg.appendChild(poly);

        trigger.appendChild(valueSpan);
        trigger.appendChild(svg);

        // Dropdown list
        const list = document.createElement('ul');
        list.className = 'custom-select-list';
        list.setAttribute('role', 'listbox');

        Array.from(select.options).forEach(opt => {
            const li = document.createElement('li');
            li.className = 'custom-select-item';
            if (!opt.value) li.classList.add('is-placeholder');
            if (opt.value === '5k-10k') li.classList.add('is-ineligible');
            li.dataset.value = opt.value;
            li.textContent = opt.text;
            li.setAttribute('role', 'option');
            list.appendChild(li);
        });

        wrapper.appendChild(trigger);
        wrapper.appendChild(list);
        select.style.display = 'none';
        select.parentNode.insertBefore(wrapper, select);

        function syncDisplay() {
            const chosen = Array.from(select.options).find(o => o.value === select.value);
            valueSpan.textContent = chosen ? chosen.text : (select.options[0] ? select.options[0].text : '');
            trigger.classList.toggle('is-placeholder', !select.value);
            list.querySelectorAll('.custom-select-item').forEach(li => {
                li.classList.toggle('is-selected', li.dataset.value === select.value);
            });
        }
        syncDisplay();

        function closeDropdown() {
            wrapper.classList.remove('is-open');
            trigger.setAttribute('aria-expanded', 'false');
        }

        trigger.addEventListener('click', e => {
            e.stopPropagation();
            const isOpen = wrapper.classList.contains('is-open');
            document.querySelectorAll('.custom-select.is-open').forEach(el => el.classList.remove('is-open'));
            if (!isOpen) {
                wrapper.classList.add('is-open');
                trigger.setAttribute('aria-expanded', 'true');
            }
        });

        list.addEventListener('click', e => {
            const item = e.target.closest('.custom-select-item');
            if (!item || item.classList.contains('is-placeholder')) return;
            select.value = item.dataset.value;
            hidden.value = item.dataset.value;
            select.dispatchEvent(new Event('change', { bubbles: true }));
            syncDisplay();
            closeDropdown();
        });
    });

    document.addEventListener('click', () => {
        document.querySelectorAll('.custom-select.is-open').forEach(el => el.classList.remove('is-open'));
    });
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
        t.classList.toggle('is-paused-offscreen', document.hidden);
    });
});

/* ============================================
   Lottie Animations
   ============================================ */

function initLottieAnimations() {
    // Phone Animation
    const phoneContainer = document.getElementById('lottie-phone');
    const phoneContact = document.getElementById('phone-contact');

    if (phoneContainer && phoneContact && typeof phoneAnimationData !== 'undefined') {
        const phoneAnim = lottie.loadAnimation({
            container: phoneContainer,
            renderer: 'svg',
            loop: false,
            autoplay: false,
            animationData: phoneAnimationData
        });

        phoneContact.addEventListener('mouseenter', () => {
            phoneAnim.goToAndPlay(0, true);
        });
    }

    // Inbox Animation
    const inboxContainer = document.getElementById('lottie-inbox');
    const inboxContact = document.getElementById('inbox-contact');

    if (inboxContainer && inboxContact && typeof inboxAnimationData !== 'undefined') {
        const inboxAnim = lottie.loadAnimation({
            container: inboxContainer,
            renderer: 'svg',
            loop: false,
            autoplay: false,
            animationData: inboxAnimationData
        });

        inboxContact.addEventListener('mouseenter', () => {
            inboxAnim.goToAndPlay(0, true);
        });
    }
}
