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
    if (!document.getElementById('pin-wrapper')) return;

    gsap.registerPlugin(ScrollTrigger);

    const VH = 200;
    const ENTER_FRAC = 0.35;
    const HOLD_FRAC = 0.45;
    const EXIT_FRAC = 0.20;

    const pipEls = gsap.utils.toArray('.pip');
    const glow = document.getElementById('bg-glow');
    const hint = document.getElementById('scroll-hint');

    const glowColors = [
        'radial-gradient(circle, rgba(0,229,200,0.06) 0%, transparent 65%)',
        'radial-gradient(circle, rgba(255,60,60,0.07) 0%, transparent 65%)',
        'radial-gradient(circle, rgba(255,60,60,0.08) 0%, transparent 65%)',
        'radial-gradient(circle, rgba(245,166,35,0.08) 0%, transparent 65%)',
        'radial-gradient(circle, rgba(0,229,200,0.06) 0%, transparent 65%)',
    ];

    function setActivePip(i) {
        pipEls.forEach((p, idx) => p.classList.toggle('active', idx === i));
        glow.style.background = glowColors[i];
    }

    const SLIDES = [
        ['.s0-label .the', '.s0-label .problem', '.s0-desc', '.s0-stat'],
        ['#slide-1 .s4-label', '.s4-title .line-ghost', '.s4-title .line-solid', '.s4-title .line-red', '#slide-1 .s4-grid'],
        ['#slide-2 .pain-tag', '#slide-2 .pain-heading', '#slide-2 .pain-body', '#slide-2 .pain-visual', '#slide-2 .ghost-num'],
        ['#slide-3 .pain-tag', '#slide-3 .pain-heading', '#slide-3 .pain-body', '#slide-3 .pain-visual', '#slide-3 .ghost-num'],
        ['#slide-4 .pain-tag', '#slide-4 .pain-heading', '#slide-4 .pain-body', '#slide-4 .pain-visual', '#slide-4 .ghost-num'],
    ];

    const SLIDE_IDS = ['slide-0', 'slide-1', 'slide-2', 'slide-3', 'slide-4'];
    const NUM = SLIDES.length;

    const SLIDE_ELS = SLIDES.map(sels => sels.map(sel => document.querySelector(sel)).filter(Boolean));
    const SLIDE_WRAPPERS = SLIDE_IDS.map(id => document.getElementById(id));

    // Pin
    ScrollTrigger.create({
        trigger: '#pin-wrapper',
        start: 'top top',
        end: `+=${NUM * VH}vh`,
        pin: '#pin-panel',
        pinSpacing: true,
        anticipatePin: 1,
    });

    // Hide all wrappers initially
    SLIDE_WRAPPERS.forEach(w => { w.style.visibility = 'hidden'; w.style.pointerEvents = 'none'; });

    SLIDES.forEach((selectors, si) => {
        const els = SLIDE_ELS[si];
        const wrapper = SLIDE_WRAPPERS[si];
        const zoneStart = si * VH;
        const zoneEnd = zoneStart + VH;
        const enterLen = VH * ENTER_FRAC;
        const exitStart = zoneStart + VH * (ENTER_FRAC + HOLD_FRAC);
        const sliceVH = enterLen / selectors.length;

        // ── BUILD ONE MASTER TIMELINE for this slide ──
        const tl = gsap.timeline({ paused: true });

        // Set initial state
        selectors.forEach((sel, ei) => {
            const el = els[ei];
            if (!el) return;
            const isRight = sel.includes('visual') || sel.includes('s4-grid') || sel.includes('s0-stat');
            gsap.set(el, { opacity: 0, y: 60, x: isRight ? 50 : 0, force3D: true });
        });

        // Enter phase: each element gets its own slice of time
        selectors.forEach((sel, ei) => {
            const el = els[ei];
            if (!el) return;
            const isRight = sel.includes('visual') || sel.includes('s4-grid') || sel.includes('s0-stat');
            const sliceStart = (ei * sliceVH) / VH;        // fraction of total zone
            const sliceEnd = ((ei + 1) * sliceVH) / VH;

            tl.fromTo(el,
                { opacity: 0, y: 60, x: isRight ? 50 : 0 },
                { opacity: 1, y: 0, x: 0, ease: 'power2.out', force3D: true, duration: sliceEnd - sliceStart },
                sliceStart  // insert at this position in the timeline
            );
        });

        // Hold phase
        tl.to({}, { duration: HOLD_FRAC }, ENTER_FRAC);

        // Exit phase
        tl.to(els,
            { opacity: 0, y: -60, ease: 'power2.in', force3D: true, stagger: 0, duration: EXIT_FRAC },
            ENTER_FRAC + HOLD_FRAC
        );

        // ── SCRUB the master timeline directly with ScrollTrigger ──
        ScrollTrigger.create({
            trigger: '#pin-wrapper',
            start: `top+=${zoneStart}vh top`,
            end: `top+=${zoneEnd}vh top`,
            scrub: 0.8,
            animation: tl,
            onEnter: () => {
                wrapper.style.visibility = 'visible';
                setActivePip(si);
                restartIconAnimation(wrapper, '.icon-ring');
            },
            onEnterBack: () => {
                wrapper.style.visibility = 'visible';
                setActivePip(si);
                restartIconAnimation(wrapper, '.icon-ring');
            },
            onLeave: () => {
                wrapper.style.visibility = 'hidden';
                const icon = wrapper.querySelector('.icon-ring');
                if (icon) icon.classList.remove('icon-animate');
            },
            onLeaveBack: () => {
                wrapper.style.visibility = 'hidden';
                const icon = wrapper.querySelector('.icon-ring');
                if (icon) icon.classList.remove('icon-animate');
            },
        });
    });

    // Scroll hint
    ScrollTrigger.create({
        trigger: '#pin-wrapper',
        start: 'top top',
        end: `top+=${VH * 0.3}vh top`,
        scrub: 0.8,
        animation: gsap.timeline().to(hint, { opacity: 0 }),
    });

    setActivePip(0);
    ScrollTrigger.refresh();
}

function initProcessSection() {
    if (!document.getElementById('process-pin-wrapper')) return;

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
        'radial-gradient(circle, rgba(255,107,53,0.08) 0%, transparent 65%)',
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
        ['#process-slide-0 .process-s0-label .our', '#process-slide-0 .process-s0-label .process', '#process-slide-0 .process-s0-desc', '#process-slide-0 .process-s0-stat'],
        ['#process-slide-1 .process-s1-label', '#process-slide-1 .process-s1-title span:nth-child(1)', '#process-slide-1 .process-s1-title span:nth-child(2)', '#process-slide-1 .process-s1-title span:nth-child(3)', '#process-slide-1 .process-s1-card'],
        ['#process-slide-2 .process-pain-tag', '#process-slide-2 .process-pain-heading', '#process-slide-2 .process-pain-body', '#process-slide-2 .process-pain-visual', '#process-slide-2 .process-ghost-num'],
        ['#process-slide-3 .process-pain-tag', '#process-slide-3 .process-pain-heading', '#process-slide-3 .process-pain-body', '#process-slide-3 .process-pain-visual', '#process-slide-3 .process-ghost-num'],
        ['#process-slide-4 .process-pain-tag', '#process-slide-4 .process-pain-heading', '#process-slide-4 .process-pain-body', '#process-slide-4 .process-pain-visual', '#process-slide-4 .process-ghost-num'],
        ['#process-slide-5 .process-pain-tag', '#process-slide-5 .process-pain-heading', '#process-slide-5 .process-pain-body', '#process-slide-5 .process-pain-visual', '#process-slide-5 .process-ghost-num']
    ];

    const SLIDE_IDS = ['process-slide-0', 'process-slide-1', 'process-slide-2', 'process-slide-3', 'process-slide-4', 'process-slide-5'];
    const NUM = SLIDES.length;

    const SLIDE_ELS = SLIDES.map(sels => sels.map(sel => document.querySelector(sel)).filter(Boolean));
    const SLIDE_WRAPPERS = SLIDE_IDS.map(id => document.getElementById(id));

    ScrollTrigger.create({
        trigger: '#process-pin-wrapper',
        start: 'top top',
        end: `+=${NUM * VH}vh`,
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

        const zoneStart = si * VH;
        const zoneEnd = zoneStart + VH;
        const enterLen = VH * ENTER_FRAC;
        const sliceVH = enterLen / selectors.length;

        const tl = gsap.timeline({ paused: true });

        selectors.forEach((sel, ei) => {
            const el = els[ei];
            if (!el) return;
            const isRight = sel.includes('visual') || sel.includes('card') || sel.includes('stat');
            gsap.set(el, { opacity: 0, y: 60, x: isRight ? 50 : 0, force3D: true });
        });

        selectors.forEach((sel, ei) => {
            const el = els[ei];
            if (!el) return;
            const isRight = sel.includes('visual') || sel.includes('card') || sel.includes('stat');
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
        tl.to(
            els,
            { opacity: 0, y: -60, ease: 'power2.in', force3D: true, stagger: 0, duration: EXIT_FRAC },
            ENTER_FRAC + HOLD_FRAC
        );

        ScrollTrigger.create({
            trigger: '#process-pin-wrapper',
            start: `top+=${zoneStart}vh top`,
            end: `top+=${zoneEnd}vh top`,
            scrub: 0.8,
            animation: tl,
            onEnter: () => {
                wrapper.style.visibility = 'visible';
                setActivePip(si);
                restartIconAnimation(wrapper, '.process-icon-ring');
            },
            onEnterBack: () => {
                wrapper.style.visibility = 'visible';
                setActivePip(si);
                restartIconAnimation(wrapper, '.process-icon-ring');
            },
            onLeave: () => {
                wrapper.style.visibility = 'hidden';
                const icon = wrapper.querySelector('.process-icon-ring');
                if (icon) icon.classList.remove('icon-animate');
            },
            onLeaveBack: () => {
                wrapper.style.visibility = 'hidden';
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

    setActivePip(0);
    ScrollTrigger.refresh();
}

document.addEventListener('DOMContentLoaded', () => {
    initProblemSection();
    initProcessSection();
});
