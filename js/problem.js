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
            start: 'top 50%',
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

    const VH = 200;
    const ENTER_FRAC = 0.35;
    const HOLD_FRAC = 0.45;
    const EXIT_FRAC = 0.20;

    const pipEls = gsap.utils.toArray('.process-pip');
    const glow = document.getElementById('process-bg-glow');
    const hint = document.getElementById('process-scroll-hint');

    const glowColors = [
        'radial-gradient(circle, rgba(0,229,200,0.06) 0%, transparent 65%)',
        'radial-gradient(circle, rgba(245,166,35,0.08) 0%, transparent 65%)',
        'radial-gradient(circle, rgba(74,184,255,0.08) 0%, transparent 65%)',
        'radial-gradient(circle, rgba(0,214,143,0.08) 0%, transparent 65%)',
        'radial-gradient(circle, rgba(0,214,143,0.08) 0%, transparent 65%)'
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

    const totalPinScroll = (NUM - 1) * VH + VH * (ENTER_FRAC + HOLD_FRAC);
    ScrollTrigger.create({
        trigger: '#process-pin-wrapper',
        start: 'top top',
        end: `+=${totalPinScroll}vh`,
        pin: '#process-pin-panel',
        pinSpacing: true,
        anticipatePin: 1,
    });
 
    SLIDE_WRAPPERS.forEach(w => {
        if (!w) return;
        w.style.visibility = 'hidden';
        w.style.pointerEvents = 'none';
    });
 
    SLIDES.forEach((selectors, si) => {
        const els = SLIDE_ELS[si];
        const wrapper = SLIDE_WRAPPERS[si];
        if (!wrapper) return;
 
        const isLast = (si === NUM - 1);
        const zoneStart = si * VH;
        const zoneEnd = isLast ? (zoneStart + VH * (ENTER_FRAC + HOLD_FRAC)) : (zoneStart + VH);
        const enterLen = VH * ENTER_FRAC;
        const sliceVH = enterLen / selectors.length;
 
        const tl = gsap.timeline({ paused: true });

        if (si === 0) {
            // ── Custom intro for the overview slide ──
            // 1) left text enters from the left
            // 2) the arrow draws itself left → right
            // 3) the two right-hand cards slide in from the right
            const leftEls = [
                wrapper.querySelector('.process-s0-label'),
                wrapper.querySelector('.process-s0-subhead'),
                wrapper.querySelector('.process-s0-left-content'),
            ].filter(Boolean);
            const arrowWrap = wrapper.querySelector('.process-s0-arrow');
            const arrowLine = wrapper.querySelector('.ps-arrow-line');
            const arrowHead = wrapper.querySelector('.ps-arrow-head');
            // Animate the whole right column as ONE unit so the two boxes stay
            // perfectly aligned (a per-box stagger left them offset mid-slide).
            const rightGroup = wrapper.querySelector('.process-s0-right');

            gsap.set(leftEls, { opacity: 0, x: -70, force3D: true });
            if (rightGroup) gsap.set(rightGroup, { opacity: 0, x: 180, force3D: true });
            if (arrowHead) gsap.set(arrowHead, { opacity: 0 });
            if (arrowLine) {
                const lineLen = arrowLine.getTotalLength();
                gsap.set(arrowLine, { strokeDasharray: lineLen, strokeDashoffset: lineLen });
            }

            // Custom (un-normalised) timeline: the arrow draw eats ~44% of slide
            // 0's scroll zone (very slow draw), then a long hold keeps the boxes
            // on screen before the slide exits.
            tl.to(leftEls, { opacity: 1, x: 0, ease: 'power3.out', force3D: true, duration: 0.12, stagger: 0.04 }, 0);
            if (arrowLine) {
                tl.to(arrowLine, { strokeDashoffset: 0, ease: 'none', duration: 1.00 }, 0.16);
            }
            if (arrowHead) {
                // Head appears ONLY once the line has fully landed — never floats alone.
                tl.to(arrowHead, { opacity: 1, ease: 'power1.out', duration: 0.06 }, 1.16);
            }
            if (rightGroup) {
                tl.to(rightGroup, { opacity: 1, x: 0, ease: 'power3.out', force3D: true, duration: 0.60 }, 0.86);
            }

            // long hold so the fully-revealed slide lingers before exiting
            tl.to({}, { duration: 0.60 }, 1.46);

            const exitEls = [...leftEls, arrowWrap, rightGroup].filter(Boolean);
            tl.to(exitEls, { opacity: 0, y: -60, ease: 'power2.in', force3D: true, duration: 0.20 }, 2.06);
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
                const sliceStart = (ei * sliceVH) / VH;
                const sliceEnd = ((ei + 1) * sliceVH) / VH;

                tl.fromTo(
                    el,
                    { opacity: 0, y: 60, x: isRight ? 50 : 0 },
                    { opacity: 1, y: 0, x: 0, ease: 'power2.out', force3D: true, duration: sliceEnd - sliceStart },
                    sliceStart
                );
            });

            tl.to({}, { duration: HOLD_FRAC }, ENTER_FRAC);

            if (!isLast) {
                tl.to(
                    els,
                    { opacity: 0, y: -60, ease: 'power2.in', force3D: true, stagger: 0, duration: EXIT_FRAC },
                    ENTER_FRAC + HOLD_FRAC
                );
            }
        }
 
        // Slide 0 starts revealing while the section is still entering the
        // viewport, so the pinned panel never sits empty.
        const startTrigger = si === 0 ? 'top 78%' : `top+=${zoneStart}vh top`;
 
        ScrollTrigger.create({
            trigger: '#process-pin-wrapper',
            start: startTrigger,
            end: `top+=${zoneEnd}vh top`,
            scrub: 0.8,
            animation: tl,
            onUpdate: self => {
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
            onEnter: () => {
                wrapper.style.visibility = 'visible';
                setActivePip(si);
            },
            onEnterBack: () => {
                wrapper.style.visibility = 'visible';
                setActivePip(si);
            },
            onLeave: () => {
                if (!isLast) {
                    wrapper.style.visibility = 'hidden';
                }
                const icon = wrapper.querySelector('.process-icon-ring');
                if (icon) icon.classList.remove('icon-animate');
            },
            onLeaveBack: () => {
                if (si !== 0) {
                    wrapper.style.visibility = 'hidden';
                }
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
                start: 'top 92%',
                end: 'top 45%',
                scrub: true
            }
        });
    }

    setActivePip(0);
    ScrollTrigger.refresh();
}

document.addEventListener('DOMContentLoaded', () => {
    initProblemSection();
    initProcessSection();
});
