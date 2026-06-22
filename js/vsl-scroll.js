/**
 * VSL Scroll-Mapped Transition (v11 - Top-Right Corner Locked)
 * Large hero VSL -> Small fixed PiP, anchored to the top-right the whole time.
 */

document.addEventListener('DOMContentLoaded', () => {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const vslContainer = document.querySelector('.hero-vsl');
    const vslElement = document.getElementById('vsl-main-element');

    if (!vslContainer || !vslElement) return;

    // ── MOBILE (≤768px) ──────────────────────────────────────────────
    // The hero stacks (video sits below the copy). Instead of the desktop
    // corner-locked scrub (which would overlap the headline), the video stays
    // in flow until it scrolls up under the top nav bar, then smoothly docks
    // into a small fixed thumbnail in the top-right corner — sized + positioned
    // by interpolating from its in-flow spot to the corner as you scroll.
    if (window.matchMedia('(max-width: 768px)').matches) {
        const NAV_H = 60;        // mobile top bar height
        const PIP_TOP = 70;      // rest just under the bar
        const PIP_RIGHT = 12;
        const PIP_W = 122;
        const PIP_RADIUS = 10;
        const TRAVEL = 200;      // px of scroll to fully dock

        const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
        let placeholderH = null;
        let docked = false;

        function capture() {
            // measure the natural in-flow size, then lock the placeholder height
            vslElement.style.cssText = '';
            vslContainer.style.height = '';
            const r = vslContainer.getBoundingClientRect();
            placeholderH = r.height || (r.width * 9) / 16;
            vslContainer.style.height = placeholderH + 'px';
        }

        function reset() {
            if (!docked) return;
            docked = false;
            vslElement.style.cssText = '';
            vslElement.classList.remove('vsl-pip-active');
            document.body.classList.remove('vsl-active');
        }

        function apply() {
            const r = vslContainer.getBoundingClientRect();
            const p = clamp((NAV_H - r.top) / TRAVEL, 0, 1);

            if (p <= 0) {
                reset();
                return;
            }

            docked = true;
            document.body.classList.add('vsl-active');
            vslElement.classList.add('vsl-pip-active');

            const w = r.width + (PIP_W - r.width) * p;
            const h = (w * 9) / 16;
            const curTop = Math.max(r.top, NAV_H);
            const top = curTop + (PIP_TOP - curTop) * p;
            const targetLeft = window.innerWidth - PIP_RIGHT - w;
            const left = r.left + (targetLeft - r.left) * p;

            vslElement.style.position = 'fixed';
            vslElement.style.top = top + 'px';
            vslElement.style.left = left + 'px';
            vslElement.style.right = 'auto';
            vslElement.style.width = w + 'px';
            vslElement.style.height = h + 'px';
            vslElement.style.margin = '0';
            vslElement.style.borderRadius = (12 - (12 - PIP_RADIUS) * p) + 'px';
            // below the nav bar / menu (z 1999-2000) so the menu covers it
            vslElement.style.zIndex = '1500';
        }

        let ticking = false;
        function onScroll() {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => { apply(); ticking = false; });
        }

        capture();
        apply();
        window.addEventListener('scroll', onScroll, { passive: true });
        let rt;
        window.addEventListener('resize', () => {
            clearTimeout(rt);
            rt = setTimeout(() => { reset(); capture(); apply(); }, 120);
        });

        vslElement.addEventListener('click', () => {
            if (typeof openVSLModal === 'function') openVSLModal();
        });
        return;
    }

    const config = {
        pipWidth: 150,
        pipTop: 8,
        pipRight: 8,
        pipRadius: 12,
        transitionDistance: 350
    };

    if (window.innerWidth < 1024) {
        config.pipWidth = 130;
    }
    if (window.innerWidth < 768) {
        config.pipWidth = 110;
    }

    let startGeom = null;
    let activeProgress = 0;

    const captureStartGeom = () => {
        // Clear any previously-set inline height first, otherwise we'd just
        // re-measure the stale height we set last time and never pick up a new
        // viewport size (e.g. when the window is dragged to a different monitor).
        // With it cleared we read the real CSS-driven size; if the inner video is
        // currently lifted out of flow (fixed PiP), height reads 0 and we fall
        // back to the correct 16:9 height derived from the live width.
        vslContainer.style.height = '';

        const rect = vslContainer.getBoundingClientRect();
        const heroWidth = rect.width;
        const heroHeight = rect.height || (heroWidth * 9) / 16;

        startGeom = {
            w: heroWidth,
            h: heroHeight
        };

        // Preserve the original hero footprint so the layout doesn't collapse
        // while the actual VSL stays fixed in the corner.
        vslContainer.style.height = `${heroHeight}px`;
    };

    const applyState = (p) => {
        const progress = Math.min(Math.max(p, 0), 1);
        activeProgress = progress;

        if (!startGeom) {
            captureStartGeom();
        }

        if (!document.body.classList.contains('vsl-active')) {
            document.body.classList.add('vsl-active');
        }
        if (!vslElement.classList.contains('vsl-pip-active')) {
            vslElement.classList.add('vsl-pip-active');
        }

        // Target (PiP) size
        const tW = config.pipWidth;
        const tH = (config.pipWidth * 9) / 16;

        // Resize only; keep the element anchored to the same corner for the entire scrub.
        const curW = startGeom.w + (tW - startGeom.w) * progress;
        const curH = startGeom.h + (tH - startGeom.h) * progress;

        gsap.set(vslElement, {
            width: curW,
            height: curH,
            top: config.pipTop,
            right: config.pipRight,
            left: 'auto',
            borderRadius: config.pipRadius,
            margin: 0,
            transform: 'none',
            x: 0,
            y: 0,
            position: 'fixed',
            zIndex: 9999,
            transformOrigin: 'top right'
        });
    };

    // Create the ScrollTrigger
    ScrollTrigger.create({
        trigger: document.body,
        start: "top top",
        end: `+=${config.transitionDistance}`,
        scrub: true,
        onUpdate: (self) => applyState(self.progress),
        onRefreshInit: () => {
            startGeom = null;
            captureStartGeom();
            applyState(activeProgress);
        },
        onLeave: () => applyState(1), // Lock to PiP state on deep scrolls
        onEnterBack: () => applyState(1),
        onLeaveBack: () => applyState(0)
    });

    // Handle Window Resize (incl. dragging the window between monitors).
    // Debounced so it re-formats once the resize settles, and re-derives the
    // size-dependent PiP target so it stays correct on the new screen.
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            config.pipWidth = window.innerWidth < 768 ? 110
                : window.innerWidth < 1024 ? 130
                : 150;
            startGeom = null;
            captureStartGeom();
            ScrollTrigger.refresh();
            applyState(activeProgress);
        }, 120);
    });

    captureStartGeom();
    applyState(0);

    // Modal behavior persistent
    vslElement.addEventListener('click', () => {
        if (typeof openVSLModal === 'function') {
            openVSLModal();
        }
    });
});
