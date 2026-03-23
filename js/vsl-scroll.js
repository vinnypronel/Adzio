/**
 * VSL Scroll-Mapped Transition (v10 - Right-Aligned Hero Start)
 * Ribbit.dk style: Large Right Hero -> Small Fixed PiP
 */

document.addEventListener('DOMContentLoaded', () => {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const vslContainer = document.querySelector('.hero-vsl');
    const vslElement = document.getElementById('vsl-main-element');
    
    if (!vslContainer || !vslElement) return;

    const config = {
        pipWidth: 150,
        pipTop: 5,
        pipRight: 5,
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

    const applyState = (p) => {
        const progress = Math.min(Math.max(p, 0), 1);

        // 1. Hero State (Docked)
        if (progress <= 0) {
            document.body.classList.remove('vsl-active');
            vslElement.classList.remove('vsl-pip-active');
            vslElement.style.cssText = ''; // Hard reset to CSS defaults
            startGeom = null;
            return;
        }

        // 2. Active Transition / Fixed State
        if (!document.body.classList.contains('vsl-active')) {
            document.body.classList.add('vsl-active');
        }
        if (!vslElement.classList.contains('vsl-pip-active')) {
            vslElement.classList.add('vsl-pip-active');
        }

        // Capture initial position in hero context if not already done
        if (!startGeom) {
            // Temporarily revert to hero state to get accurate original bounds
            vslElement.classList.remove('vsl-pip-active');
            const rect = vslElement.getBoundingClientRect();
            vslElement.classList.add('vsl-pip-active');
            
            startGeom = {
                w: rect.width,
                h: rect.height,
                x: rect.left,
                y: rect.top + window.scrollY // Page relative, but transition trigger is at 0
            };
        }

        // Target (PiP) coordinates
        const tW = config.pipWidth;
        const tH = (config.pipWidth * 9) / 16;
        const tX = window.innerWidth - config.pipWidth - config.pipRight;
        const tY = config.pipTop;

        // LERP values
        const curW = startGeom.w + (tW - startGeom.w) * progress;
        const curH = startGeom.h + (tH - startGeom.h) * progress;
        const curX = startGeom.x + (tX - startGeom.x) * progress;
        const curY = 0 + (tY - 0) * progress; // Starts at viewport top (0)
        const curR = config.pipRadius; // Always keep rounded corners

        // Apply styles directly for max performance and precision
        gsap.set(vslElement, {
            width: curW,
            height: curH,
            left: curX,
            top: curY,
            borderRadius: curR,
            margin: 0,
            transform: 'none',
            x: 0,
            y: 0,
            position: 'fixed',
            zIndex: 9999
        });
    };

    // Create the ScrollTrigger
    ScrollTrigger.create({
        trigger: document.body,
        start: "top top",
        end: `+=${config.transitionDistance}`,
        scrub: true,
        onUpdate: (self) => applyState(self.progress),
        onLeave: () => applyState(1), // Lock to PiP state on deep scrolls
        onEnterBack: () => applyState(1),
        onLeaveBack: () => applyState(0) // Return to hero
    });

    // Handle Window Resize
    window.addEventListener('resize', () => {
        ScrollTrigger.refresh();
        startGeom = null; // Re-capture on next scroll
    });

    // Modal behavior persistent
    vslElement.addEventListener('click', () => {
        if (typeof openVSLModal === 'function') {
            openVSLModal();
        }
    });
});
