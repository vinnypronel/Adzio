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

    const config = {
        pipWidth: 150,
        pipTop: 8,
        pipRight: 8,
        pipRadius: 12,
        transitionDistance: 700
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

    // Handle Window Resize
    window.addEventListener('resize', () => {
        startGeom = null;
        captureStartGeom();
        ScrollTrigger.refresh();
        applyState(activeProgress);
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
