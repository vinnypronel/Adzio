# Reusable Inertial Smooth Scroll Guide (Lenis)

This guide contains the exact momentum / inertial smooth scrolling setup used in this project. It makes scrolling feel weightless, smooth, and continue gliding naturally after the user stops scrolling.

---

## 🚀 1. Quick CDN Setup (Vanilla HTML / JS)

Drop these two script tags before your closing `</body>` tag on any HTML page:

```html
<!-- 1. Include Lenis from CDN -->
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.14/dist/lenis.min.js"></script>

<!-- 2. Initialize Lenis Smooth Scroll -->
<script src="smooth-scroll.js"></script>
```

---

## 📄 2. The `smooth-scroll.js` Script

Create a `smooth-scroll.js` file (or paste inside a `<script>` tag):

```javascript
(function () {
    'use strict';

    // Prevent duplicate initializations
    if (window.__lenis) return;

    // Accessibility & device checks: disable on touch or reduced-motion
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var isTouch = window.matchMedia('(max-width: 768px)').matches || ('ontouchstart' in window);
    if (reduce || isTouch || typeof Lenis === 'undefined') return;

    // Initialize Lenis with inertial momentum configuration
    var lenis = new Lenis({
        duration: 1.2,                                                        // Duration of the scroll animation in seconds
        easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, // Exponential decay curve for natural momentum
        smoothWheel: true,                                                    // Enable smooth scrolling for mouse wheels / trackpads
        wheelMultiplier: 1.0,                                                 // Wheel scroll speed factor
        touchMultiplier: 1.5                                                  // Touch scroll speed factor (if enabled)
    });

    window.__lenis = lenis;

    // Sync with GSAP ScrollTrigger if GSAP is loaded on the page
    if (typeof ScrollTrigger !== 'undefined') {
        lenis.on('scroll', ScrollTrigger.update);
    }

    // Connect to GSAP ticker or native requestAnimationFrame
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
```

---

## 📦 3. Package Setup (Next.js / React / Vite)

If using **React**, **Next.js**, or any modern JS bundler:

### Step 1: Install Lenis
```bash
npm install lenis
```

### Step 2: React / Next.js Component or Hook
```tsx
import { useEffect } from 'react';
import Lenis from 'lenis';

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Check reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
```

---

## 🎨 4. Optional Recommended CSS

Add this to your main CSS file to prevent CSS conflict with native smooth scroll or overscroll bounce on body:

```css
html.lenis, html.lenis body {
  height: auto;
}

.lenis.lenis-smooth {
  scroll-behavior: auto !important;
}

.lenis.lenis-smooth [data-lenis-prevent] {
  overscroll-behavior: contain;
}

.lenis.lenis-stopped {
  overflow: hidden;
}

.lenis.lenis-smooth iframe {
  pointer-events: none;
}
```

---

## 🎛️ 5. Key Settings & Customization Guide

| Setting | Default | Description |
| :--- | :--- | :--- |
| `duration` | `1.2` | Increase (e.g. `1.5` - `2.0`) for a floatier, longer momentum glide. Decrease (e.g. `0.8`) for tighter control. |
| `easing` | Exponential | `(t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))` creates the signature exponential slowdown (drifting effect). |
| `wheelMultiplier` | `1.0` | Controls how far each scroll tick moves the viewport. |
| `smoothWheel` | `true` | Enables smooth inertia physics on mouse wheel and trackpad scroll events. |
