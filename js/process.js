/* ============================================
   PROCESS SECTION - GSAP ANIMATIONS
   ============================================ */

function initProcessSection() {
    if (!document.getElementById('process-pin-wrapper')) return;

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
    ];

    function setActivePip(i) {
        // The array of colors for each slide. Slide 1 is orange, Slide 2 is gold, etc. Slide 0 is teal.
        // We have 6 slides (0-5). Let's expand the colors to match the length mapping (6 items).
        const colors = [
            'radial-gradient(circle, rgba(0,229,200,0.06) 0%, transparent 65%)', // Slide 0 (Teal)
            'radial-gradient(circle, rgba(255,107,53,0.08) 0%, transparent 65%)', // Slide 1 (Orange)
            'radial-gradient(circle, rgba(255,107,53,0.08) 0%, transparent 65%)', // Slide 2 (Orange) - wait, slide 2 is Discovery (Orange)
            'radial-gradient(circle, rgba(245,166,35,0.08) 0%, transparent 65%)', // Slide 3 (Gold)
            'radial-gradient(circle, rgba(74,184,255,0.08) 0%, transparent 65%)', // Slide 4 (Blue)
            'radial-gradient(circle, rgba(0,214,143,0.08) 0%, transparent 65%)',  // Slide 5 (Green)
        ];
        pipEls.forEach((p, idx) => p.classList.toggle('active', idx === i));
        if (glow && colors[i]) glow.style.background = colors[i];
    }

    function triggerIconAnim(si) {
        if (si < 2) return;
        const icon = document.querySelector(`#process-slide-${si} .process-icon-ring`);
        if (!icon) return;
        icon.classList.remove('icon-animate');
        const polyline = icon.querySelector('polyline');
        if (polyline) {
            polyline.style.animation = 'none';
            polyline.getBoundingClientRect();
            polyline.style.animation = '';
            polyline.setAttribute('stroke-dashoffset', '-60');
        }
        void icon.offsetWidth;
        setTimeout(() => icon.classList.add('icon-animate'), 350);
    }

    const SLIDES = [
        ['.process-s0-label .our', '.process-s0-label .process', '.process-s0-desc', '.process-s0-stat'],
        ['#process-slide-1 .process-s1-label', '#process-slide-1 .process-s1-title span:nth-child(1)', '#process-slide-1 .process-s1-title span:nth-child(2)', '#process-slide-1 .process-s1-title span:nth-child(3)', '#process-slide-1 .process-s1-card'],
        ['#process-slide-2 .process-pain-tag', '#process-slide-2 .process-pain-heading', '#process-slide-2 .process-pain-body', '#process-slide-2 .process-pain-visual', '#process-slide-2 .process-ghost-num'],
        ['#process-slide-3 .process-pain-tag', '#process-slide-3 .process-pain-heading', '#process-slide-3 .process-pain-body', '#process-slide-3 .process-pain-visual', '#process-slide-3 .process-ghost-num'],
        ['#process-slide-4 .process-pain-tag', '#process-slide-4 .process-pain-heading', '#process-slide-4 .process-pain-body', '#process-slide-4 .process-pain-visual', '#process-slide-4 .process-ghost-num'],
        ['#process-slide-5 .process-pain-tag', '#process-slide-5 .process-pain-heading', '#process-slide-5 .process-pain-body', '#process-slide-5 .process-pain-visual', '#process-slide-5 .process-ghost-num'],
    ];

    const SLIDE_IDS = ['process-slide-0', 'process-slide-1', 'process-slide-2', 'process-slide-3', 'process-slide-4', 'process-slide-5'];
    const NUM = SLIDES.length;
    const SLIDE_ELS = SLIDES.map(sels => sels.map(s => document.querySelector(s)).filter(Boolean));
    const SLIDE_WRAPPERS = SLIDE_IDS.map(id => document.getElementById(id));

    ScrollTrigger.create({
        trigger: '#process-pin-wrapper', start: 'top top',
        end: `+=${NUM * VH}vh`, pin: '#process-pin-panel',
        pinSpacing: true, anticipatePin: 1,
    });

    SLIDE_WRAPPERS.forEach(w => { if (w) w.style.visibility = 'hidden'; });

    SLIDES.forEach((selectors, si) => {
        const els = SLIDE_ELS[si];
        const wrapper = SLIDE_WRAPPERS[si];
        const zoneStart = si * VH;
        const zoneEnd = zoneStart + VH;
        const sliceVH = (VH * ENTER_FRAC) / selectors.length;

        const tl = gsap.timeline({ paused: true });

        selectors.forEach((sel, ei) => {
            const el = els[ei];
            if (!el) return;
            const fromRight = sel.includes('visual') || sel.includes('s0-stat') || sel.includes('s1-card');
            gsap.set(el, { opacity: 0, y: 60, x: fromRight ? 50 : 0, force3D: true });
        });

        selectors.forEach((sel, ei) => {
            const el = els[ei];
            if (!el) return;
            const fromRight = sel.includes('visual') || sel.includes('s0-stat') || sel.includes('s1-card');
            const tStart = (ei * sliceVH) / VH;
            const tEnd = ((ei + 1) * sliceVH) / VH;
            tl.fromTo(el,
                { opacity: 0, y: 60, x: fromRight ? 50 : 0 },
                { opacity: 1, y: 0, x: 0, ease: 'power2.out', force3D: true, duration: tEnd - tStart },
                tStart
            );
        });

        tl.to({}, { duration: HOLD_FRAC }, ENTER_FRAC);
        tl.to(els, { opacity: 0, y: -55, ease: 'power2.in', force3D: true, stagger: 0, duration: EXIT_FRAC }, ENTER_FRAC + HOLD_FRAC);

        ScrollTrigger.create({
            trigger: '#process-pin-wrapper',
            start: `top+=${zoneStart}vh top`,
            end: `top+=${zoneEnd}vh top`,
            scrub: 0.8, animation: tl,
            onEnter: () => { if (wrapper) wrapper.style.visibility = 'visible'; setActivePip(si); triggerIconAnim(si); },
            onEnterBack: () => { if (wrapper) wrapper.style.visibility = 'visible'; setActivePip(si); triggerIconAnim(si); },
            onLeave: () => { if (wrapper) wrapper.style.visibility = 'hidden'; },
            onLeaveBack: () => { if (wrapper) wrapper.style.visibility = 'hidden'; },
        });
    });

    ScrollTrigger.create({
        trigger: '#process-pin-wrapper', start: 'top top',
        end: `top+=${VH * 0.3}vh top`, scrub: 0.8,
        animation: gsap.timeline().fromTo(hint, { opacity: 1 }, { opacity: 0 }),
    });

    setActivePip(0);
    ScrollTrigger.refresh();
}

document.addEventListener('DOMContentLoaded', () => {
    initProcessSection();
});
