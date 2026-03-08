/* ============================================
   PROBLEM SECTION - GSAP ANIMATIONS
   ============================================ */

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
            onEnter: () => { wrapper.style.visibility = 'visible'; setActivePip(si); },
            onEnterBack: () => { wrapper.style.visibility = 'visible'; setActivePip(si); },
            onLeave: () => { wrapper.style.visibility = 'hidden'; },
            onLeaveBack: () => { wrapper.style.visibility = 'hidden'; },
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

document.addEventListener('DOMContentLoaded', () => {
    initProblemSection();
});
