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

    // On mobile the hero stacks (video sits BELOW the copy). The fixed/PiP
    // pinning would rip the video to the top and overlap the headline, so skip
    // the whole scroll transition and leave the VSL inline in the hero.
    if (window.matchMedia('(max-width: 768px)').matches) {
        vslContainer.style.height = '';
        vslElement.classList.remove('vsl-pip-active');
        document.body.classList.remove('vsl-active');
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
