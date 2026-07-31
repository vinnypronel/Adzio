/* ============================================
   PROBLEM SECTION - GSAP ANIMATIONS
   ============================================ */

function restartIconAnimation(wrapper, selector) {
    if (!wrapper) return;
    const icon = wrapper.querySelector(selector);
    if (!icon) return;
    icon.classList.remove('icon-animate');
    void icon.offsetWidth;
    icon.classList.add('icon-animate');
}

// Make each step's circular icon replay its animation on hover or click. The
// pure-CSS animations only fire on `.icon-animate`, so both just re-trigger
// that class (remove → reflow → add). Works on desktop and the
// mobile vertical stack, independent of the GSAP scroll wiring.
function initProcessIconReplay() {
    const rings = document.querySelectorAll('.process-icon-ring');
    rings.forEach(ring => {
        const replay = () => {
            ring.classList.remove('icon-animate');
            void ring.offsetWidth;
            ring.classList.add('icon-animate');
        };

        ring.setAttribute('role', 'button');
        ring.setAttribute('tabindex', '0');
        ring.setAttribute('aria-label', 'Replay step animation');

        ring.addEventListener('click', replay);
        ring.addEventListener('mouseenter', replay);
        ring.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                replay();
            }
        });
    });
}

function initProblemSection() {
    const section = document.querySelector('.problem-section');
    const panel = document.getElementById('pin-panel');
    const stage = section?.querySelector('.problem-stage');
    if (!section || !panel || !stage) return;

    gsap.registerPlugin(ScrollTrigger);

    // Phones / small tablets render this section as a clean vertical stack (see
    // the max-width:900px block in problem.css). The scrubbed parallax and
    // slide-in reveals below are built for the wide desktop composition — on a
    // tall mobile stack they displace the cards and overlap them mid-scroll, so
    // we disable those transform animations there by leaving the lists empty.
    const isMobile = window.matchMedia('(max-width: 900px)').matches;

    const glow = document.getElementById('bg-glow');
    const parallaxEls = isMobile ? [] : gsap.utils.toArray('.problem-parallax');
    // The 91% (.s4-card) rides its parent spotlight panel's reveal — giving it
    // its own scrubbed slide on top caused the choppy double-animation.
    const revealEls = isMobile ? [] : gsap.utils.toArray('.problem-panel');
    const iconHosts = gsap.utils.toArray('.problem-card');

    function setBackdrop(progress) {
        if (glow) {
            gsap.set(glow, {
                xPercent: -50 + Math.sin(progress * Math.PI * 2.1) * 8,
                yPercent: progress * 12,
                overwrite: true
            });
        }
    }

    ScrollTrigger.create({
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.9,
        onUpdate: self => setBackdrop(self.progress),
        onRefresh: self => setBackdrop(self.progress)
    });

    parallaxEls.forEach(el => {
        const shift = parseFloat(el.dataset.shift || '12');
        gsap.fromTo(
            el,
            { y: -shift },
            {
                y: shift,
                ease: 'none',
                scrollTrigger: {
                    trigger: section,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1
                }
            }
        );
    });

    revealEls.forEach((el) => {
        // Right-aligned content (spotlight, 91% card, budget card) slides in
        // from the right; everything else keeps the default left entrance.
        const fromRight = el.dataset.revealFrom === 'right'
            || !!el.closest('[data-reveal-from="right"]');
        const startX = fromRight ? 220 : -220;
        gsap.fromTo(
            el,
            { x: startX, opacity: 0, force3D: true },
            {
                x: 0,
                opacity: 1,
                ease: 'power3.out',
                force3D: true,
                scrollTrigger: {
                    trigger: el,
                    start: 'top 88%',
                    end: 'top 50%',
                    scrub: 0.7
                }
            }
        );
    });

    iconHosts.forEach(host => {
        ScrollTrigger.create({
            trigger: host,
            start: 'top 85%',
            onEnter: () => restartIconAnimation(host, '.icon-ring'),
            onEnterBack: () => restartIconAnimation(host, '.icon-ring'),
            onLeave: () => {
                const ring = host.querySelector('.icon-ring');
                if (ring) ring.classList.remove('icon-animate');
            },
            onLeaveBack: () => {
                const ring = host.querySelector('.icon-ring');
                if (ring) ring.classList.remove('icon-animate');
            }
        });

        const ring = host.querySelector('.icon-ring');
        if (ring) {
            ring.addEventListener('mouseenter', () => restartIconAnimation(host, '.icon-ring'));
        }
    });

    // ── Staggered entry for THE / PROBLEM / description (desktop only) ──
    const theEl   = section.querySelector('.s0-label .the');
    const probEl  = section.querySelector('.s0-label .problem');
    const descEl  = section.querySelector('.s0-desc');

    if (!isMobile) {
        [theEl, probEl, descEl].forEach(el => {
            if (el) gsap.set(el, { opacity: 0, x: -220, force3D: true });
        });

        if (theEl || probEl || descEl) {
            gsap.to([theEl, probEl, descEl].filter(Boolean), {
                opacity: 1,
                x: 0,
                force3D: true,
                ease: 'power3.out',
                stagger: 0.18,
                scrollTrigger: {
                    trigger: section,
                    start: 'top 65%',
                    end: 'top 20%',
                    scrub: 0.7
                }
            });
        }
    }

    // ── Arrow draw: stroke from left → right on scroll ──
    const arrowPath = document.getElementById('problem-arrow-path');
    const arrowHead = document.getElementById('problem-arrow-head');

    // Arrow is hidden on mobile (≤1180px) and its draw is a desktop flourish.
    if (arrowPath && !isMobile) {
        const pathLen = arrowPath.getTotalLength();
        gsap.set(arrowPath, { strokeDasharray: pathLen, strokeDashoffset: pathLen });
        if (arrowHead) gsap.set(arrowHead, { opacity: 0 });

        const arrowTl = gsap.timeline({ paused: true });
        arrowTl
            .to(arrowPath, { strokeDashoffset: 0, ease: 'power1.inOut', duration: 0.8 })
            .to(arrowHead, { opacity: 1, ease: 'power2.out', duration: 0.2 }, 0.75);

        ScrollTrigger.create({
            trigger: section,
            start: 'top 70%',
            end: 'top 25%',
            scrub: 1,
            animation: arrowTl
        });
    }

    setBackdrop(0);
    ScrollTrigger.refresh();
}

function initProcessSection() {
    if (!document.getElementById('process-pin-wrapper')) return;

    // Mobile / small-tablet: skip the pinned horizontal slide-deck entirely.
    // process.css linearizes the five slides into a static vertical stack; the
    // pin + per-slide scrubs below would otherwise pile all slides absolutely on
    // top of one another (the exact overlap bug we're fixing on mobile).
    if (window.matchMedia('(max-width: 900px)').matches) return;

    gsap.registerPlugin(ScrollTrigger);

    // VH is the scroll distance (in vh) allotted to each slide and is the single
    // knob for the deck's pacing — raise it to make the steps harder to blow
    // past, lower it to speed them up. The pin total works out to VH × 5.8, and
    // every snapTo fraction / REVEAL_PROGRESS below is a ratio of VH, so they
    // stay correct at any VH (no need to retune them when changing this).
    const VH = 300;
    const OVERLAP = 0;   // Set to 0 to prevent slides from overlapping on scroll
    const ENTER_FRAC = 0.10;
    const HOLD_FRAC = 0.70;
    const EXIT_FRAC = 0.20;
    // Slide 0 is allocated its own VH of scroll inside the pin so the page
    // stays locked during both the arrow draw (forward) and un-draw (reverse).
    const SLIDE0_PRE_VH = VH;

    const pipEls = gsap.utils.toArray('.process-pip');
    const glow = document.getElementById('process-bg-glow');
    const hint = document.getElementById('process-scroll-hint');

    const glowColors = [
        'transparent',
        'transparent',
        'transparent',
        'transparent',
        'transparent'
    ];

    function setActivePip(i) {
        pipEls.forEach((p, idx) => p.classList.toggle('active', idx === i));
        if (glow) glow.style.background = glowColors[i] || glowColors[0];
    }

    const SLIDES = [
        ['#process-slide-0 .process-s0-label', '#process-slide-0 .process-s0-subhead', '#process-slide-0 .process-s0-arrow', '#process-slide-0 .process-s0-right', '#process-slide-0 .process-s0-left-content'],
        ['#process-slide-2 .process-pain-tag', '#process-slide-2 .process-pain-heading', '#process-slide-2 .process-pain-body', '#process-slide-2 .process-pain-visual', '#process-slide-2 .process-ghost-num'],
        ['#process-slide-3 .process-pain-tag', '#process-slide-3 .process-pain-heading', '#process-slide-3 .process-pain-body', '#process-slide-3 .process-pain-visual', '#process-slide-3 .process-ghost-num'],
        ['#process-slide-4 .process-pain-tag', '#process-slide-4 .process-pain-heading', '#process-slide-4 .process-pain-body', '#process-slide-4 .process-pain-visual', '#process-slide-4 .process-ghost-num'],
        ['#process-slide-5 .process-pain-tag', '#process-slide-5 .process-pain-heading', '#process-slide-5 .process-pain-body', '#process-slide-5 .process-pain-visual', '#process-slide-5 .process-ghost-num']
    ];

    const SLIDE_IDS = ['process-slide-0', 'process-slide-2', 'process-slide-3', 'process-slide-4', 'process-slide-5'];
    const NUM = SLIDES.length;

    const SLIDE_ELS = SLIDES.map(sels => sels.map(sel => document.querySelector(sel)).filter(Boolean));
    const SLIDE_WRAPPERS = SLIDE_IDS.map(id => document.getElementById(id));


    // Extend pin by SLIDE0_PRE_VH so slide 0 is fully inside the locked zone.
    const totalPinScroll = SLIDE0_PRE_VH + (NUM - 1) * VH + VH * (ENTER_FRAC + HOLD_FRAC);
    const servicesEl = document.getElementById('services');
    const pinST = ScrollTrigger.create({
        trigger: '#process-pin-wrapper',
        start: 'top top',
        end: `+=${totalPinScroll}vh`,
        pin: '#process-pin-panel',
        pinSpacing: true,
        anticipatePin: 1,
        snap: {
            // 0.05 = the "title only" rest (just ADZIO'S PROCESS showing);
            // 0.1724 = slide 0 fully formed. The rest follow the per-slide stops.
            snapTo: [0, 0.05, 0.1724, 0.4310, 0.6034, 0.7759, 0.9310, 1],
            duration: { min: 0.35, max: 0.9 },
            delay: 0.08,
            ease: 'power2.inOut'
        }
    });

    // (Auto-snap forward logic removed to prevent scrolljacking / scroll lockups)

    // ── Auto-return to Services when scrolling back UP out of the deck ──
    // Once the user reverses past the very top of the pinned process deck
    // (the ADZIO'S PROCESS intro has fully retraced off-screen), glide them
    // back up to the Services section rather than leaving them stranded in the
    // gap above the pin. Armed only after they've scrolled down INTO the deck,
    // and re-armed on each re-entry, so it never hijacks an intentional scroll.
    let returnToServicesArmed = false;
    ScrollTrigger.create({
        trigger: '#process-pin-wrapper',
        start: 'top top',
        onEnter: () => { returnToServicesArmed = true; },
        onLeaveBack: () => {
            if (!servicesEl || !returnToServicesArmed) return;
            returnToServicesArmed = false;
            servicesEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });

    // ── Never let the empty pre-pin gap be a resting place ──
    // The 100vh panel rises a full screen before it pins, and slide 0 only
    // animates in once pinned — leaving a ~100vh void between Services and the
    // formed deck. If the user settles in that void, glide them onto whichever
    // side they were heading toward: down → slide 0 with JUST the ADZIO'S PROCESS
    // title revealed (the rest come in one-by-one as they keep scrolling),
    // up → the Services cards. Only fires once scrolling has settled, so it
    // never yanks the page mid-flick.
    const TITLE_PROGRESS = 0.05; // pin progress where only the title is showing
    let voidSnapTimer = null;
    ScrollTrigger.create({
        trigger: '#process-pin-wrapper',
        start: 'top bottom',   // panel just entering from the bottom
        end: 'top top',        // panel fully risen → pin engages
        onUpdate: self => {
            clearTimeout(voidSnapTimer);
            // Only act once the void dominates the viewport (panel >~40% risen)
            // and we're not already snapped onto the pinned deck.
            if (self.progress <= 0.4 || self.progress >= 0.99) return;
            voidSnapTimer = setTimeout(() => {
                if (self.progress <= 0.4 || self.progress >= 0.99) return;
                if (self.direction === 1 && pinST) {
                    const target = pinST.start + TITLE_PROGRESS * (pinST.end - pinST.start);
                    window.scrollTo({ top: target, behavior: 'smooth' });
                } else if (self.direction === -1 && servicesEl) {
                    servicesEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 160);
        }
    });
 
    SLIDE_WRAPPERS.forEach((w, idx) => {
        if (!w) return;
        w.style.visibility = idx === 0 ? 'visible' : 'hidden';
        w.style.pointerEvents = 'none';
    });
 
    SLIDES.forEach((selectors, si) => {
        const els = SLIDE_ELS[si];
        const wrapper = SLIDE_WRAPPERS[si];
        if (!wrapper) return;
 
        const isLast = (si === NUM - 1);
        const zoneStart = si * VH;
        const zoneEnd = isLast ? (zoneStart + VH * (ENTER_FRAC + HOLD_FRAC)) : (zoneStart + VH);
        // Per-element entrance step, as a fraction of the slide's scroll zone.
        // The last slide (step 4) already reads as individual because its short,
        // exit-less timeline stretches the stagger across ~29% of the zone. Steps
        // 1-3 have a long exit, which compressed the same stagger into the first
        // ~10% — so all elements snapped in together. Give them a wider step so
        // each element (tag → heading → body → icon → numeral) arrives on its own.
        const entranceStep = isLast ? (ENTER_FRAC / selectors.length) : 0.06;

        const tl = gsap.timeline({ paused: true });
        tl.set(wrapper, { visibility: 'visible' }, 0);

        if (si === 0) {
            // ── Custom intro for the overview slide ──
            // 1) left text enters from the left
            // 2) the arrow draws itself left → right
            // 3) the two right-hand cards slide in from the right
            const labelEl = wrapper.querySelector('.process-s0-label');
            const subheadEl = wrapper.querySelector('.process-s0-subhead');
            const descEl = wrapper.querySelector('.process-s0-left-content');
            const leftEls = [labelEl, subheadEl, descEl].filter(Boolean);
            const arrowWrap = wrapper.querySelector('.process-s0-arrow');
            const arrowLine = wrapper.querySelector('.ps-arrow-line');
            const arrowHead = wrapper.querySelector('.ps-arrow-head');
            // Animate the whole right column as ONE unit so the two boxes stay
            // perfectly aligned (a per-box stagger left them offset mid-slide).
            const rightGroup = wrapper.querySelector('.process-s0-right');

            if (leftEls.length) {
                gsap.set(leftEls, { opacity: 0, x: -150, force3D: true });
            }
            // Keep the section title on screen while the panel enters the
            // viewport, so the pre-pin handoff never becomes a blank screen.
            if (labelEl) {
                gsap.set(labelEl, { opacity: 1, x: 0, force3D: true });
            }
            if (rightGroup) {
                gsap.set(rightGroup, { opacity: 0, x: 150, force3D: true });
            }
            if (arrowWrap) {
                gsap.set(arrowWrap, { opacity: 0 });
            }
            if (arrowHead) {
                gsap.set(arrowHead, { opacity: 0 });
            }
            if (arrowLine) {
                const lineLen = arrowLine.getTotalLength();
                gsap.set(arrowLine, { strokeDasharray: lineLen, strokeDashoffset: lineLen });
            }

            // Sequential one-by-one intro: each element arrives on its own as the
            // user scrolls — first JUST the "ADZIO'S PROCESS" title, then the
            // subhead, the description, the 4-step panel, and finally the arrow
            // draws across to connect them. The snap below rests the deck on the
            // title alone, so the rest reveal one-by-one as scrolling continues.
            if (labelEl) {
                tl.fromTo(labelEl, { opacity: 1, x: 0 },
                    { opacity: 1, x: 0, ease: 'power2.out', duration: 0.24 }, 0.00);
            }
            if (subheadEl) {
                tl.fromTo(subheadEl, { opacity: 0, x: -150 },
                    { opacity: 1, x: 0, ease: 'power2.out', duration: 0.22 }, 0.42);
            }
            if (descEl) {
                tl.fromTo(descEl, { opacity: 0, x: -150 },
                    { opacity: 1, x: 0, ease: 'power2.out', duration: 0.22 }, 0.66);
            }
            if (rightGroup) {
                tl.to(rightGroup, { opacity: 1, x: 0, ease: 'power2.out', duration: 0.24 }, 0.86);
            }
            if (arrowWrap) {
                tl.to(arrowWrap, { opacity: 1, duration: 0.18 }, 0.55);
            }
            if (arrowLine) {
                tl.to(arrowLine, { strokeDashoffset: 0, ease: 'none', duration: 0.55 }, 0.55);
            }
            if (arrowHead) {
                tl.to(arrowHead, { opacity: 1, ease: 'power1.out', duration: 0.08 }, 1.08);
            }

            // hold so the fully-revealed slide lingers before exiting
            tl.to({}, { duration: 0.40 }, 1.33);

            const exitEls = [...leftEls, arrowWrap, rightGroup].filter(Boolean);
            tl.to(exitEls, { opacity: 0, y: -60, ease: 'power2.inOut', force3D: true, duration: 0.59 }, 1.73);
            tl.set(wrapper, { visibility: 'hidden' }, 2.32);
        } else {
            selectors.forEach((sel, ei) => {
                const el = els[ei];
                if (!el) return;
                const isRight = sel.includes('visual') || sel.includes('card') || sel.includes('stat') || sel.includes('right');
                gsap.set(el, { opacity: 0, y: 60, x: isRight ? 50 : 0, force3D: true });
            });

            selectors.forEach((sel, ei) => {
                const el = els[ei];
                if (!el) return;
                const isRight = sel.includes('visual') || sel.includes('card') || sel.includes('stat') || sel.includes('right');

                tl.fromTo(
                    el,
                    { opacity: 0, y: 60, x: isRight ? 50 : 0 },
                    { opacity: 1, y: 0, x: 0, ease: 'power2.out', force3D: true, duration: entranceStep },
                    ei * entranceStep
                );
            });

            tl.to({}, { duration: 0.25 }, ENTER_FRAC);

            // The step's card chrome (.process-pain-inner::before, desktop only)
            // rides --card-op so it arrives and leaves with the step's content.
            // Without this the wrapper's plain visibility toggle would flash an
            // empty card over whichever slide is on screen.
            const cardEl = wrapper.querySelector('.process-pain-inner');
            if (cardEl) {
                gsap.set(cardEl, { '--card-op': 0 });
                tl.fromTo(
                    cardEl,
                    { '--card-op': 0 },
                    { '--card-op': 1, ease: 'power2.out', duration: entranceStep },
                    0
                );
            }

            if (!isLast) {
                // Keep the step fully settled across most of its scroll zone and
                // exit late+quick. A long early exit (the old 0.60→1.00) meant the
                // content was mid-flight for ~half the zone, so a fast scroll —
                // especially flicking back UP — blew past before it ever settled.
                tl.to(
                    els,
                    { opacity: 0, y: -60, ease: 'power2.inOut', force3D: true, stagger: 0, duration: 0.25 },
                    0.75
                );
                if (cardEl) {
                    tl.to(cardEl, { '--card-op': 0, ease: 'power2.inOut', duration: 0.25 }, 0.75);
                }
                tl.set(wrapper, { visibility: 'hidden' }, 1.00);
            }
        }
 
        // Slide 0: entirely inside the pin (starts at pin start = top top).
        // Other slides: overlap slightly to create a smooth cross-fade transition.
        let startVal = 0;
        let endVal = 0;
        if (si === 0) {
            startVal = 0;
            endVal = SLIDE0_PRE_VH + VH;
        } else {
            startVal = (SLIDE0_PRE_VH + VH) - OVERLAP + (si - 1) * (VH - OVERLAP);
            endVal = startVal + VH;
        }

        ScrollTrigger.create({
            trigger: '#process-pin-wrapper',
            start: si === 0 ? 'top top' : `top+=${startVal}vh top`,
            end: `top+=${endVal}vh top`,
            // Very tight scrub so the content tracks the scroll almost 1:1 — any
            // lag lets a fast scroll (esp. a momentum flick back UP, now that Lenis
            // smooth-scroll is active) outrun the reveal, leaving the steps blank
            // as they fly past. Keeping this tiny means each slide snaps to its
            // formed state immediately in both directions.
            scrub: 0.08,
            animation: tl,
            onUpdate: self => {
                // Visibility is derived directly from this same scrub progress
                // (rather than from separate onEnter/onLeave/onEnterBack/onLeaveBack
                // callbacks) so it can never drift out of sync with the timeline
                // driving the actual content opacity. The old discrete-event
                // version could leave a slide's wrapper hidden while its content
                // had already scrubbed to partial/full opacity (or vice versa) —
                // most visible when scrolling back UP fast, where every slide's
                // wrapper ended up hidden at once, i.e. the deck going fully blank.
                // The overview title is the visual bridge into the pinned deck,
                // so slide 0 remains visible at zero progress while the panel is
                // approaching the viewport. Later slides still hide outside their
                // active scroll ranges.
                const isVisible = si === 0
                    ? self.progress < 1
                    : self.progress > 0 && self.progress < 1;
                wrapper.style.visibility = isVisible ? 'visible' : 'hidden';

                if (si === 0) return;
                const icon = wrapper.querySelector('.process-icon-ring');
                if (!icon) return;

                const threshold = 0.28;
                if (self.progress >= threshold) {
                    if (!icon.classList.contains('icon-animate')) {
                        icon.classList.add('icon-animate');
                    }
                } else {
                    icon.classList.remove('icon-animate');
                }
            },
            onEnter: () => setActivePip(si),
            onEnterBack: () => setActivePip(si),
            onLeave: () => {
                const icon = wrapper.querySelector('.process-icon-ring');
                if (icon) icon.classList.remove('icon-animate');
            },
            onLeaveBack: () => {
                const icon = wrapper.querySelector('.process-icon-ring');
                if (icon) icon.classList.remove('icon-animate');
            },
        });
    });

    if (hint) {
        ScrollTrigger.create({
            trigger: '#process-pin-wrapper',
            start: 'top top',
            end: `top+=${VH * 0.3}vh top`,
            scrub: 0.8,
            animation: gsap.timeline().to(hint, { opacity: 0 }),
        });
    }

    // Fade the final (Scale & Grow) slide out as the CTA form scrolls into view,
    // so it doesn't bleed over the questionnaire.
    const ctaSection = document.querySelector('.cta');
    const lastWrapper = SLIDE_WRAPPERS[NUM - 1];
    if (ctaSection && lastWrapper) {
        gsap.to(lastWrapper, {
            opacity: 0,
            ease: 'none',
            scrollTrigger: {
                trigger: ctaSection,
                start: 'top 100%',
                end: 'top 65%',
                scrub: true,
                onUpdate: self => {
                    if (self.progress >= 1) {
                        lastWrapper.style.visibility = 'hidden';
                    } else {
                        lastWrapper.style.visibility = 'visible';
                    }
                }
            }
        });
    }

    setActivePip(0);

    // ── Clickable Slide Navigation for Overview Items & PIP dots ──
    const snapValues = [0.1724, 0.4310, 0.6034, 0.7759, 0.9310];

    function jumpToProcessSlide(slideIndex) {
        if (!pinST) return;
        const targetProgress = snapValues[slideIndex] !== undefined ? snapValues[slideIndex] : (slideIndex / 4);
        const targetScroll = pinST.start + targetProgress * (pinST.end - pinST.start) + 5;
        window.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
        });
    }

    const processItems = document.querySelectorAll('.process-s1-card-item');
    processItems.forEach((item, index) => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            jumpToProcessSlide(index + 1);
        });
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                jumpToProcessSlide(index + 1);
            }
        });
    });

    pipEls.forEach((pip, index) => {
        pip.style.cursor = 'pointer';
        pip.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            jumpToProcessSlide(index);
        });
    });

    ScrollTrigger.refresh();
}

// Mobile has no pinned deck: initProcessSection() bails at 900px, and that is
// the only thing that ever added .icon-animate. Step 3's icon draws itself in
// from a hidden dash offset, so with the class never applied its ring rendered
// empty. Play each icon as its ring scrolls into view instead.
function initProcessIconScrollPlay() {
    if (!window.matchMedia('(max-width: 900px)').matches) return;

    const rings = document.querySelectorAll('.process-slide .process-icon-ring');
    if (!rings.length) return;

    if (!('IntersectionObserver' in window)) {
        rings.forEach(ring => ring.classList.add('icon-animate'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const ring = entry.target;
            ring.classList.remove('icon-animate');
            void ring.offsetWidth;
            ring.classList.add('icon-animate');
        });
    }, { threshold: 0.4 });

    rings.forEach(ring => observer.observe(ring));
}

document.addEventListener('DOMContentLoaded', () => {
    initProblemSection();
    initProcessSection();
    initProcessIconReplay();
    initProcessIconScrollPlay();
});
