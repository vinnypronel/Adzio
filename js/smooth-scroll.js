(function () {
    'use strict';

    if (window.__lenis) return;

    // Match the homepage momentum/inertia feel while leaving touch devices and
    // reduced-motion users on native scrolling.
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var isTouch = window.matchMedia('(max-width: 768px)').matches
        || ('ontouchstart' in window);
    if (reduce || isTouch || typeof Lenis === 'undefined') return;

    var lenis = new Lenis({
        duration: 1.2,
        easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.5
    });
    window.__lenis = lenis;

    if (typeof ScrollTrigger !== 'undefined') {
        lenis.on('scroll', ScrollTrigger.update);
    }

    if (window.gsap && gsap.ticker) {
        gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
        gsap.ticker.lagSmoothing(0);
    } else {
        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    }
})();
