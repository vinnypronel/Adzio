# Days Ice Cream — Full-Screen Menu + Logo Page Transition

A drop-in guide to give the Days Ice Cream site:

1. A **full-screen takeover menu** when the hamburger is tapped (instead of a dropdown). The
   hamburger animates into an **X** that closes it.
2. A **smooth, seamless, quick page-transition screen** that shows the **Days Ice Cream logo**
   whenever you move between pages (works on desktop and mobile).

It's three small files/snippets: one CSS block, one JS file, and a tiny veil `<div>` on each page.
No frameworks, no build step. Works on any static HTML site.

---

## How it works (30-second version)

- The menu markup (top bar + full-screen panel) is **injected by JavaScript**, so you only add a
  `<script>` to each page instead of pasting markup everywhere.
- The transition uses **one veil element** painted in your brand color with the logo centered:
  - **On arrival:** the veil starts covering the page, then fades out to reveal it.
  - **On leaving:** clicking an internal link fades the veil back in (logo showing), *then* navigates.
  - Because both pages use the same veil color + logo, the hand-off looks like one continuous screen.

---

## Step 0 — Fill in 3 values

Decide these before you start (used throughout):

| Placeholder         | Example                         | What it is                                   |
| ------------------- | ------------------------------- | -------------------------------------------- |
| `YOUR_LOGO_PATH`    | `images/days-logo.png`          | Path to the Days Ice Cream logo (PNG/SVG)    |
| `YOUR_VEIL_COLOR`   | `#1b3a2f` (or cream `#f7f1e3`)  | Background of the transition + menu screen   |
| `YOUR_ACCENT_COLOR` | `#e8b84b`                       | Highlight color (active link, CTA button)    |

> Tip: if your logo is dark, use a light veil color (cream); if the logo is light, use a dark veil.

---

## Step 1 — Add the veil `<div>` to **every page**

Immediately after the opening `<body>` tag on each HTML page, paste this. Having it in the HTML
(not created by JS) is what prevents a white flash on load.

```html
<body>
    <!-- Page transition veil — starts visible, JS fades it out on load -->
    <div class="pt-veil is-active" aria-hidden="true">
        <img src="YOUR_LOGO_PATH" alt="" class="pt-veil-logo">
    </div>
    <!-- ...the rest of your page... -->
```

Do this on `index.html` and **every** other page (menu, flavors, locations, contact, etc.).

---

## Step 2 — Add the CSS

Paste this into your main stylesheet (or a new `days-nav.css` that you link on every page).
The `--*` variables at the top are the only things you normally need to touch.

```css
/* ====== Days Ice Cream: full-screen menu + logo transition ====== */
:root {
    --veil-bg: YOUR_VEIL_COLOR;
    --veil-accent: YOUR_ACCENT_COLOR;
    --menu-text: #ffffff;          /* color of the big menu links */
    --nav-breakpoint: 768px;       /* full-screen menu shows at/below this width */
}

/* ---------- Page transition veil (with logo) ---------- */
.pt-veil {
    position: fixed;
    inset: 0;
    z-index: 100000;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--veil-bg);
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: opacity 0.4s ease, visibility 0.4s ease;
}

.pt-veil.is-active {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
}

.pt-veil-logo {
    width: clamp(90px, 22vw, 150px);
    height: auto;
    animation: ptPulse 1.3s ease-in-out infinite;
}

@keyframes ptPulse {
    0%, 100% { transform: scale(1);    opacity: 0.7; }
    50%      { transform: scale(1.05); opacity: 1;   }
}

/* ---------- Mobile top bar (hidden on desktop) ---------- */
.m-nav { display: none; }

@media (max-width: 768px) {            /* keep in sync with --nav-breakpoint */
    /* If your site has a desktop nav, hide it on mobile here, e.g.:
       .site-header { display: none !important; } */

    .m-nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: fixed;
        top: 0; left: 0; right: 0;
        z-index: 2000;
        height: 60px;
        padding: 0 16px;
        background: rgba(0, 0, 0, 0.35);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
    }

    /* When the menu is open, let the bar blend into the full-screen panel */
    .m-nav.is-open {
        background: transparent;
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
    }

    .m-nav-brand {
        display: flex;
        align-items: center;
        /* IMPORTANT: keep the logo above the full-screen panel */
        position: relative;
        z-index: 2001;
    }
    .m-nav-brand img { height: 34px; width: auto; }

    /* Hamburger button — 48x48 touch target */
    .m-nav-toggle {
        width: 48px; height: 48px;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        gap: 5px;
        background: none; border: none; cursor: pointer; padding: 0;
        /* IMPORTANT: keep the X above the full-screen panel so it's visible AND clickable */
        position: relative;
        z-index: 2001;
    }
    .m-nav-toggle span {
        display: block; width: 26px; height: 2px; border-radius: 2px;
        background: var(--menu-text);
        transition: transform 0.3s ease, opacity 0.2s ease;
    }
    /* Hamburger → X morph */
    .m-nav.is-open .m-nav-toggle span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    .m-nav.is-open .m-nav-toggle span:nth-child(2) { opacity: 0; }
    .m-nav.is-open .m-nav-toggle span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

    /* ---------- Full-screen menu panel ---------- */
    .m-nav-panel {
        position: fixed;
        inset: 0;
        z-index: 1999;             /* below the bar (2000) so the logo + X stay on top */
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 88px 24px 96px;
        background: var(--veil-bg);
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transform: translateY(-6px);
        transition: opacity 0.4s ease, transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), visibility 0.45s;
    }
    .m-nav.is-open .m-nav-panel {
        opacity: 1; visibility: visible; transform: none; pointer-events: auto;
    }

    .m-nav-links { display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .m-nav-links a {
        display: block; padding: 10px 8px;
        font-family: inherit;       /* swap for your heading font if you like */
        font-size: clamp(1.9rem, 9vw, 2.8rem);
        font-weight: 700; line-height: 1.1; letter-spacing: -0.01em;
        color: var(--menu-text); text-decoration: none;
        opacity: 0; transform: translateY(16px);
        transition: color 0.2s ease, opacity 0.45s ease, transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .m-nav.is-open .m-nav-links a { opacity: 1; transform: none; }
    /* Staggered entrance — add more lines if you have more links */
    .m-nav.is-open .m-nav-links a:nth-child(1) { transition-delay: 0.08s; }
    .m-nav.is-open .m-nav-links a:nth-child(2) { transition-delay: 0.12s; }
    .m-nav.is-open .m-nav-links a:nth-child(3) { transition-delay: 0.16s; }
    .m-nav.is-open .m-nav-links a:nth-child(4) { transition-delay: 0.20s; }
    .m-nav.is-open .m-nav-links a:nth-child(5) { transition-delay: 0.24s; }
    .m-nav.is-open .m-nav-links a:nth-child(6) { transition-delay: 0.28s; }
    .m-nav-links a:active { color: var(--veil-accent); }

    .m-nav-cta {
        margin-top: 34px;
        display: inline-flex; align-items: center; justify-content: center;
        min-height: 54px; padding: 0 36px;
        border-radius: 999px;
        background: var(--veil-accent);
        color: #1a1a1a !important;
        font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;
        font-size: 0.95rem; text-decoration: none;
        opacity: 0; transform: translateY(16px);
        transition: opacity 0.45s ease 0.3s, transform 0.45s cubic-bezier(0.22, 1, 0.36, 1) 0.3s;
    }
    .m-nav.is-open .m-nav-cta { opacity: 1; transform: none; }

    .m-nav-foot {
        position: absolute; left: 0; right: 0; bottom: 34px;
        display: flex; align-items: center; justify-content: center; gap: 28px;
        opacity: 0; transition: opacity 0.4s ease 0.36s;
    }
    .m-nav.is-open .m-nav-foot { opacity: 1; }
    .m-nav-foot a {
        font-size: 0.74rem; font-weight: 700; letter-spacing: 0.14em;
        text-transform: uppercase; color: rgba(255,255,255,0.7); text-decoration: none;
    }

    /* Stop the page behind the open menu from scrolling */
    body.m-nav-locked { overflow: hidden; }
}

/* ---------- Accessibility: respect reduced motion ---------- */
@media (prefers-reduced-motion: reduce) {
    .pt-veil { transition-duration: 0.001s; }
    .pt-veil-logo { animation: none; }
    .m-nav-panel, .m-nav-links a, .m-nav-cta, .m-nav-foot { transition-duration: 0.001s; }
}
```

---

## Step 3 — Add the JavaScript

Create `days-nav.js` and paste this. **Edit the `LINKS`, `CTA`, and `SOCIAL` arrays** to match your
pages. Then link it on every page (Step 4).

```javascript
(function () {
    // ─── EDIT THESE to match your site ───
    var LOGO = 'YOUR_LOGO_PATH';
    var LINKS = [
        { label: 'Home',      href: 'index.html' },
        { label: 'Menu',      href: 'menu.html' },
        { label: 'Flavors',   href: 'flavors.html' },
        { label: 'Locations', href: 'locations.html' },
        { label: 'Contact',   href: 'contact.html' }
    ];
    var CTA = { label: 'Order Now', href: 'order.html' };   // set to null to hide
    var SOCIAL = [
        { label: 'Instagram', href: 'https://instagram.com/' },
        { label: 'TikTok',    href: 'https://tiktok.com/' }
    ];
    // ─────────────────────────────────────

    function el(tag, cls, html) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (html != null) n.innerHTML = html;
        return n;
    }

    // ---- Build & inject the mobile nav (bar + full-screen panel) ----
    function buildNav() {
        if (document.getElementById('mNav')) return;

        var linksHtml = LINKS.map(function (l) {
            return '<a href="' + l.href + '">' + l.label + '</a>';
        }).join('');
        var ctaHtml = CTA ? '<a href="' + CTA.href + '" class="m-nav-cta">' + CTA.label + '</a>' : '';
        var socialHtml = SOCIAL.map(function (s) {
            return '<a href="' + s.href + '" target="_blank" rel="noopener noreferrer">' + s.label + '</a>';
        }).join('');

        var nav = el('div', 'm-nav');
        nav.id = 'mNav';
        nav.innerHTML =
            '<a href="' + (LINKS[0] ? LINKS[0].href : 'index.html') + '" class="m-nav-brand" aria-label="Home">' +
                '<img src="' + LOGO + '" alt="Days Ice Cream">' +
            '</a>' +
            '<button class="m-nav-toggle" id="mNavToggle" aria-label="Open menu" aria-expanded="false">' +
                '<span></span><span></span><span></span>' +
            '</button>' +
            '<div class="m-nav-panel" id="mNavPanel">' +
                '<nav class="m-nav-links">' + linksHtml + '</nav>' +
                ctaHtml +
                (socialHtml ? '<div class="m-nav-foot">' + socialHtml + '</div>' : '') +
            '</div>';
        document.body.insertBefore(nav, document.body.firstChild);

        var toggle = nav.querySelector('#mNavToggle');
        var panel = nav.querySelector('#mNavPanel');
        function close() {
            nav.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('m-nav-locked');
        }
        function open() {
            nav.classList.add('is-open');
            toggle.setAttribute('aria-expanded', 'true');
            document.body.classList.add('m-nav-locked');
        }
        toggle.addEventListener('click', function () {
            nav.classList.contains('is-open') ? close() : open();
        });
        panel.addEventListener('click', function (e) { if (e.target.closest('a')) close(); });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    }

    // ---- Page transitions (logo veil) ----
    function setupTransitions() {
        // Use the veil from Step 1; create one if it's missing (may flash on first load).
        var veil = document.querySelector('.pt-veil');
        if (!veil) {
            veil = el('div', 'pt-veil is-active');
            veil.setAttribute('aria-hidden', 'true');
            veil.innerHTML = '<img src="' + LOGO + '" alt="" class="pt-veil-logo">';
            document.body.appendChild(veil);
        }

        // Reveal on arrival: fade the veil out once the page is ready.
        requestAnimationFrame(function () {
            requestAnimationFrame(function () { veil.classList.remove('is-active'); });
        });

        function normPath(p) { return p.replace(/\/index\.html$/i, '/') || '/'; }
        function samePage(url) { return normPath(url.pathname) === normPath(location.pathname); }

        // Cover on leave: intercept clicks on internal links.
        document.addEventListener('click', function (e) {
            if (e.defaultPrevented) return;
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
            var a = e.target.closest('a');
            if (!a) return;
            if (a.target === '_blank' || a.hasAttribute('download')) return;
            var href = a.getAttribute('href');
            if (!href || href.charAt(0) === '#') return;
            if (/^(mailto:|tel:|javascript:)/i.test(href)) return;

            var url;
            try { url = new URL(href, location.href); } catch (err) { return; }
            if (url.origin !== location.origin) return;     // external link

            if (samePage(url)) {                             // same page → just scroll
                e.preventDefault();
                var target = url.hash ? document.querySelector(url.hash) : null;
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                else window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }

            e.preventDefault();
            veil.classList.add('is-active');                 // fade logo screen in
            setTimeout(function () { window.location.href = url.href; }, 380);
        });

        // If the user returns via back/forward cache, make sure the veil is hidden.
        window.addEventListener('pageshow', function (ev) {
            if (ev.persisted) veil.classList.remove('is-active');
        });
    }

    function run() { buildNav(); setupTransitions(); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
    else run();
})();
```

---

## Step 4 — Link the files on every page

In the `<head>` (or before `</body>`) of each page:

```html
<link rel="stylesheet" href="days-nav.css">   <!-- skip if you pasted the CSS into your main stylesheet -->
<script src="days-nav.js" defer></script>
```

That's it. Every page now has the full-screen menu and the logo transition.

---

## Customization cheatsheet

| Want to change…                | Where                                                                 |
| ------------------------------ | --------------------------------------------------------------------- |
| Logo on the screen             | `YOUR_LOGO_PATH` (CSS Step 1 div + JS `LOGO`)                          |
| Screen / menu background color | `--veil-bg`                                                           |
| Button / active-link color     | `--veil-accent`                                                      |
| Menu link text color           | `--menu-text`                                                        |
| Which links appear             | `LINKS`, `CTA`, `SOCIAL` arrays in `days-nav.js`                       |
| When the mobile menu kicks in  | `@media (max-width: 768px)` **and** `--nav-breakpoint`                |
| Transition speed               | `.pt-veil { transition: opacity 0.4s }` + the `380` ms in `days-nav.js` (keep them close) |
| Logo size on the screen        | `.pt-veil-logo { width: clamp(...) }`                                 |
| Remove the pulsing animation   | delete `animation: ptPulse...` from `.pt-veil-logo`                    |

---

## Testing checklist

- [ ] Tap the hamburger on a phone (or DevTools mobile view) → full screen opens, links centered.
- [ ] The hamburger has turned into an **X** in the top-right, and tapping it closes the menu.
- [ ] Tapping a menu link to **another page** shows the logo screen, then loads the new page.
- [ ] On the new page, the logo screen **fades away** to reveal it (no white flash).
- [ ] Tapping a link to the **current** page just smooth-scrolls (no full reload).
- [ ] External links / social links open normally (no transition).
- [ ] Desktop: clicking your normal nav to another page also shows the transition.

---

## Gotchas (learned the hard way)

1. **The X must sit above the panel.** The full-screen panel (`z-index: 1999`) is a sibling of the
   logo and hamburger. Without `position: relative; z-index: 2001;` on `.m-nav-brand` and
   `.m-nav-toggle`, the panel covers them — the X vanishes and can't be clicked. (Already handled
   in the CSS above; don't remove those lines.)
2. **Put the veil `<div>` in the HTML**, not only in JS. If JS creates it, there can be a brief flash
   of the page before the veil appears on load. The HTML `is-active` veil paints first, then fades out.
3. **Keep the CSS fade and the JS timeout close.** The veil fades in over `0.4s`; the script waits
   `380ms` before navigating, so the screen is fully covered at hand-off. If you slow one down, slow
   the other to match.
4. **Same-page anchors** (e.g. `#flavors` on the page you're already on) are intentionally skipped so
   they scroll instead of reloading.
5. **One veil per page.** Don't add more than one `.pt-veil` element to a page.
