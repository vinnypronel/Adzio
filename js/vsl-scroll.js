/**
 * VSL Scroll-Mapped Transition (v11 - Top-Right Corner Locked)
 * Large hero VSL -> Small fixed PiP, anchored to the top-right the whole time.
 */

document.addEventListener('DOMContentLoaded', () => {
    const vslContainer = document.querySelector('.hero-vsl');
    const vslElement = document.getElementById('vsl-main-element');

    if (!vslContainer || !vslElement) return;

    const mqMobile = window.matchMedia('(max-width: 768px)');
    const wasMobileAtLoad = mqMobile.matches;

    // The mobile vs. desktop code paths are chosen once at load. If the viewport
    // later crosses the 768px breakpoint (devtools device toggle, tablet/phone
    // rotation, window resize), reload so the correct path runs — otherwise the
    // mobile dock effect silently won't be wired up.
    let rebootTimer;
    window.addEventListener('resize', () => {
        clearTimeout(rebootTimer);
        rebootTimer = setTimeout(() => {
            if (mqMobile.matches !== wasMobileAtLoad) window.location.reload();
        }, 250);
    });

    // ── MOBILE (≤768px) ──────────────────────────────────────────────
    // NOTE: this branch is pure vanilla JS (no GSAP) and runs BEFORE the GSAP
    // guard below — so the corner-dock still works even if GSAP is slow to load
    // or blocked on a phone. The hero stacks (video sits below the copy); the
    // video stays in flow until it scrolls up under the top nav bar, then docks
    // into a small fixed thumbnail in the top-right corner — sized + positioned
    // by interpolating from its in-flow spot to the corner as you scroll.
    if (mqMobile.matches) {
        const NAV_H = 60;        // mobile top bar height
        const PIP_TOP = 70;      // rest just under the bar
        const PIP_RIGHT = 12;
        const PIP_W = 150;       // fully-docked corner size (video starts ~220px)
        const PIP_RADIUS = 8;
        const TRAVEL = 220;      // px of scroll to fully dock

        const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
        let placeholderH = null;
        let docked = false;

        // As the video shrinks into the corner, nudge the headline + buttons down
        // so they never slide up underneath the docked video. Grows with dock
        // progress, then holds steady once fully docked.
        const heroTitle = document.querySelector('.hero-title');
        const heroCta = document.querySelector('.hero-cta');
        const CONTENT_SHIFT = 100; // max px the copy drops by
        function shiftContent(p) {
            const y = (CONTENT_SHIFT * p).toFixed(1) + 'px';
            if (heroTitle) heroTitle.style.transform = 'translateY(' + y + ')';
            if (heroCta) heroCta.style.transform = 'translateY(' + y + ')';
        }

        function capture() {
            // measure the natural in-flow size, then lock the placeholder height
            vslElement.style.cssText = '';
            vslContainer.style.height = '';
            const r = vslContainer.getBoundingClientRect();
            placeholderH = r.height || (r.width * 9) / 16;
            vslContainer.style.height = placeholderH + 'px';
        }

        function reset() {
            shiftContent(0);
            if (!docked) return;
            docked = false;
            vslElement.style.cssText = '';
            vslElement.classList.remove('vsl-pip-active');
            document.body.classList.remove('vsl-active');
        }

        // Front-load the shrink/dock so the video becomes the small corner PiP
        // quickly (within the first ~55% of the dock scroll). This keeps the
        // large-video-over-headline overlap window tiny. easeOutQuad.
        const ease = (t) => 1 - (1 - t) * (1 - t);

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

            // Front-loaded progress: the video is fully docked + the copy fully
            // shifted by the time the raw progress reaches ~0.55.
            const fp = ease(clamp(p / 0.55, 0, 1));
            shiftContent(fp);

            const w = r.width + (PIP_W - r.width) * fp;
            const h = (w * 9) / 16;
            const curTop = Math.max(r.top, NAV_H);
            const top = curTop + (PIP_TOP - curTop) * fp;
            const targetLeft = window.innerWidth - PIP_RIGHT - w;
            const left = r.left + (targetLeft - r.left) * fp;

            vslElement.style.position = 'fixed';
            vslElement.style.top = top + 'px';
            vslElement.style.left = left + 'px';
            vslElement.style.right = 'auto';
            vslElement.style.width = w + 'px';
            vslElement.style.height = h + 'px';
            vslElement.style.margin = '0';
            vslElement.style.borderRadius = (12 - (12 - PIP_RADIUS) * fp) + 'px';
            vslElement.style.zIndex = '9000';
            vslElement.style.opacity = String(1 - (0.15 * fp));
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

    // ── DESKTOP (>768px) — needs GSAP + ScrollTrigger ─────────────────
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const config = {
        pipWidth: 190,
        pipTop: 23,
        pipRight: 23,
        pipRadius: 12,
        transitionDistance: 350
    };

    if (window.innerWidth < 1024) {
        config.pipWidth = 165;
    }
    if (window.innerWidth < 768) {
        config.pipWidth = 148;
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
            zIndex: 9000,
            opacity: 1 - (0.28 * progress),
            transformOrigin: 'top right'
        });
    };

    // Create the ScrollTrigger
    ScrollTrigger.create({
        trigger: document.body,
        start: "top top",
        end: `+=${config.transitionDistance}`,
        // Small numeric scrub on top of Lenis' smoothed scroll: the resize eases
        // toward the scroll position instead of snapping 1:1 to the scrollbar.
        // Lenis supplies the page-wide momentum (keeps gliding after you stop);
        // this just keeps the video tracking that glide smoothly — the
        // non-choppy corner-dock feel from ribbit.dk.
        scrub: 0.8,
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
            config.pipWidth = window.innerWidth < 768 ? 148
                : window.innerWidth < 1024 ? 165
                : 190;
            startGeom = null;
            captureStartGeom();
            ScrollTrigger.refresh();
            applyState(activeProgress);
        }, 120);
    });

    captureStartGeom();
    applyState(0);

    // ── Dead-zone scroll snap ────────────────────────────────────────
    // Once the VSL docks into the corner, the lower part of the tall hero is
    // empty. If the user coasts to a stop inside that blank band, gently glide
    // them down to the next section so they're never parked on an empty screen.
    // Only fires when they've settled AND were heading downward, so it never
    // yanks them back up; skipped for reduced-motion users.
    (function setupHeroSnap() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const nextSection = document.querySelector('.logo-slider');
        const heroCta = document.querySelector('.hero-cta');
        if (!nextSection || !heroCta) return;

        const NAV_GAP = 90;       // rest the next section just under the nav
        const SETTLE_MS = 170;    // how long scrolling must be still before snapping

        let lastY = window.scrollY;
        let settleTimer = null;
        let snapping = false;

        function maybeSnap() {
            if (snapping) return;
            const vh = window.innerHeight;
            const ctaRect = heroCta.getBoundingClientRect();
            const nextRect = nextSection.getBoundingClientRect();

            // "Empty screen" = the hero content (CTA = the lowest hero element)
            // has essentially scrolled above the top, but the next section
            // hasn't yet reached its resting anchor under the nav. Viewport-
            // relative so it adapts to any screen size.
            const heroGone = ctaRect.bottom < vh * 0.20;
            const nextNotSettled = nextRect.top > NAV_GAP + 12;
            if (!heroGone || !nextNotSettled) return;

            const tgt = nextRect.top + window.scrollY - NAV_GAP;
            snapping = true;
            const done = () => { snapping = false; };
            const lenis = window.__lenis;
            if (lenis && typeof lenis.scrollTo === 'function') {
                lenis.scrollTo(tgt, { duration: 1.1, onComplete: done });
            } else {
                window.scrollTo({ top: tgt, behavior: 'smooth' });
                setTimeout(done, 900);
            }
        }

        window.addEventListener('scroll', () => {
            const y = window.scrollY;
            const goingDown = y > lastY;
            lastY = y;
            clearTimeout(settleTimer);
            if (!goingDown || snapping) return;        // leave upward / in-progress scrolls alone
            settleTimer = setTimeout(maybeSnap, SETTLE_MS);
        }, { passive: true });
    })();

    // Modal behavior persistent
    vslElement.addEventListener('click', () => {
        if (typeof openVSLModal === 'function') {
            openVSLModal();
        }
    });
});
