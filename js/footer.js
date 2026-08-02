(function () {
    var html = `
<footer class="footer">
    <div class="footer-content">

        <div class="footer-main">

            <!-- Brand Column -->
            <div class="footer-brand">
                <a href="index.html#home" class="footer-logo">
                    <img src="assets/logo.png" alt="Adzio Logo">
                </a>
                <div class="footer-social">
                    <a href="https://www.instagram.com/adzio.io/" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Instagram">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                        <span class="social-tip" aria-hidden="true"><span class="social-tip-sizer">Follow Adzio on Instagram</span><span class="social-tip-text"></span></span>
                    </a>
                    <a href="https://www.facebook.com/profile.php?id=61583384871237" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Facebook">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                        </svg>
                        <span class="social-tip" aria-hidden="true"><span class="social-tip-sizer">Follow Adzio on Facebook</span><span class="social-tip-text"></span></span>
                    </a>
                    <a href="https://x.com/AdzioMarketing" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="X (Twitter)">
                        <svg fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                        </svg>
                        <span class="social-tip" aria-hidden="true"><span class="social-tip-sizer">Follow Adzio on X</span><span class="social-tip-text"></span></span>
                    </a>
                </div>
            </div>

            <!-- Nav Columns -->
            <nav class="footer-nav">
                <div class="footer-column">
                    <h4>Sitemap</h4>
                    <ul class="footer-links">
                        <li><a href="index.html#home">Home</a></li>
                        <li><a href="about-us.html">About</a></li>
                        <li><a href="services.html">Services</a></li>
                        <li><a href="index.html#contact">Contact</a></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h4>Services</h4>
                    <ul class="footer-links">
                        <li><a href="services.html#ad-management">Meta Ad Management</a></li>
                        <li><a href="services.html#lead-generation">Google Ad Management</a></li>
                        <li><a href="services.html#landing-pages">Website Development</a></li>
                        <li><a href="services.html#social-media-management">Social Media Management</a></li>
                    </ul>
                </div>
            </nav>

            <!-- Contact Column -->
            <div class="footer-contact">
                <a href="mailto:Marketing@Adzio.io" class="contact-item" id="inbox-contact">
                    <div class="contact-icon" id="lottie-inbox"></div>
                    <span>Marketing@Adzio.io</span>
                    <span class="social-tip contact-tip-above" aria-hidden="true"><span class="social-tip-sizer">Email Adzio</span><span class="social-tip-text"></span></span>
                </a>
                <a href="tel:7326546635" class="contact-item" id="phone-contact">
                    <div class="contact-icon" id="lottie-phone"></div>
                    <span>(732) 654-6635</span>
                    <span class="social-tip" aria-hidden="true"><span class="social-tip-sizer">Call Adzio</span><span class="social-tip-text"></span></span>
                </a>
                <div class="footer-lets-talk-spacer" aria-hidden="true"></div>
                <a href="index.html#contact" class="pinned-header-cta footer-book-call">
                    <svg class="phone-ring-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                        <path
                            d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z">
                        </path>
                    </svg>
                    <span>Book a Call</span>
                </a>
                <div class="footer-founders">
                    <span class="founders-label">Founders</span>
                    <div class="contact-names">Anton Veliu &amp; Devyn Schroeder</div>
                </div>
            </div>
        </div>

        <!-- Bottom Bar -->
        <div class="footer-bottom">
            <p class="footer-copyright">&copy; 2026 Adzio.io. All rights reserved.</p>
            <div class="footer-legal">
                <a href="privacy-policy.html">Privacy Policy</a>
                <a href="terms-of-service.html">Terms of Service</a>
            </div>
        </div>
    </div>
</footer>`;

    function inject() {
        var placeholder = document.getElementById('site-footer');
        if (placeholder) {
            var t = document.createElement('template');
            t.innerHTML = html;
            placeholder.parentNode.replaceChild(t.content, placeholder);
        }
    }

    // ── Mobile navigation (hamburger) ──
    // The desktop morphing pill is hover-driven and breaks on touch, so on
    // phones we hide it (via CSS) and show this simple, tappable nav instead.
    // NOTE: the panel is kept as a SEPARATE top-level element (not nested inside
    // .m-nav). The bar uses backdrop-filter, and any filter/backdrop-filter on an
    // ancestor becomes the containing block for position:fixed descendants — which
    // would make the panel jump/resize when the bar's blur toggles on open.
    var mobileNav = `
<div class="m-nav" id="mNav">
    <a href="index.html#home" class="m-nav-brand" aria-label="Adzio home">
        <img src="assets/logo.png" alt="Adzio">
    </a>
    <button class="m-nav-toggle" id="mNavToggle" aria-label="Open menu" aria-expanded="false">
        <span></span><span></span>
    </button>
</div>
<div class="m-nav-panel" id="mNavPanel">
    <nav class="m-nav-links">
        <a href="index.html#home">Home</a>
        <a href="services.html">Services</a>
        <a href="about-us.html">About</a>
    </nav>
    <a href="index.html#contact" class="m-nav-cta">
        <svg class="phone-ring-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
        <span>Book a Call</span>
    </a>
        <div class="m-nav-foot">
        <div class="m-nav-socials" aria-label="Social media">
            <a href="https://www.instagram.com/adzio.io/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" class="m-nav-social-dot"/></svg>
            </a>
            <a href="https://www.facebook.com/profile.php?id=61583384871237" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 21v-8h2.8l.4-3h-3.2V8.1c0-.9.3-1.5 1.6-1.5H17V4a20 20 0 0 0-1.8-.1c-2.4 0-4 1.4-4 4.1V10H8.5v3h2.7v8h2.3Z" fill="currentColor" stroke="none"/></svg>
            </a>
            <a href="https://x.com/AdzioMarketing" target="_blank" rel="noopener noreferrer" aria-label="X">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="currentColor" stroke="none"/></svg>
            </a>
        </div>
        <div class="m-nav-contact" aria-label="Contact information">
            <a href="mailto:Marketing@Adzio.io">Marketing@Adzio.io</a>
            <a href="tel:7326546635">(732)&nbsp;654-6635</a>
        </div>
    </div>
</div>`;

    function injectMobileNav() {
        if (document.getElementById('mNav')) return;
        var t = document.createElement('template');
        t.innerHTML = mobileNav;
        document.body.insertBefore(t.content, document.body.firstChild);

        var nav = document.getElementById('mNav');
        var toggle = document.getElementById('mNavToggle');
        var panel = document.getElementById('mNavPanel');

        function close() {
            document.body.classList.remove('m-nav-open');
            toggle.setAttribute('aria-expanded', 'false');
        }
        function open() {
            document.body.classList.add('m-nav-open');
            toggle.setAttribute('aria-expanded', 'true');
        }

        // Highlight active page in mobile menu
        var currentPath = window.location.pathname.toLowerCase();
        var navLinks = panel.querySelectorAll('.m-nav-links a');
        navLinks.forEach(function (link) {
            var href = (link.getAttribute('href') || '').toLowerCase();
            if (currentPath.indexOf('services') !== -1 && href.indexOf('services') !== -1) {
                link.classList.add('active');
            } else if (currentPath.indexOf('about') !== -1 && href.indexOf('about') !== -1) {
                link.classList.add('active');
            } else if ((currentPath === '/' || currentPath.endsWith('/') || currentPath.indexOf('index') !== -1) && (href.indexOf('index') !== -1 || href === '#home')) {
                link.classList.add('active');
            }
        });

        toggle.addEventListener('click', function () {
            document.body.classList.contains('m-nav-open') ? close() : open();
        });
        panel.addEventListener('click', function (e) {
            if (e.target.closest('a')) close();
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') close();
        });
    }

    // ── Seamless page transitions ──
    // Cover the screen on leave; the .page-veil on the next page reveals on arrive.
    function setupPageTransitions() {
        function animateVeilProgress(target, duration) {
            if (!target) return;
            var fill = target.querySelector('.veil-progress-fill');
            var percent = target.querySelector('.veil-percent');
            if (!fill || !percent) return;

            var start = null;
            fill.style.width = '0%';
            percent.textContent = '0%';

            function update(now) {
                if (!start) start = now;
                var progress = Math.min((now - start) / duration, 1);
                var value = Math.round(progress * 100);
                fill.style.width = value + '%';
                percent.textContent = value + '%';
                if (progress < 1) requestAnimationFrame(update);
            }
            requestAnimationFrame(update);
        }

        // Only animate the initial page-veil if navigation was triggered by an
        // actual link click (not a resize, monitor move, or direct URL entry).
        var initialVeil = document.querySelector('.page-veil');
        var navKey = 'adzio_nav_intent';
        var wasIntentional = sessionStorage.getItem(navKey) === '1';
        sessionStorage.removeItem(navKey);
        if (wasIntentional && initialVeil) {
            animateVeilProgress(initialVeil, 320);
        }

        var veil = document.createElement('div');
        veil.className = 'pt-veil';
        veil.setAttribute('aria-hidden', 'true');
        veil.innerHTML = '<div class="veil-content"><img src="assets/logo.png" alt="" class="veil-logo"><div class="veil-loader"><span class="veil-progress-fill"></span></div><span class="veil-percent">0%</span><div class="veil-loading-text" aria-hidden="true"><span class="veil-letter" style="--i:0">L</span><span class="veil-letter" style="--i:1">O</span><span class="veil-letter" style="--i:2">A</span><span class="veil-letter" style="--i:3">D</span><span class="veil-letter" style="--i:4">I</span><span class="veil-letter" style="--i:5">N</span><span class="veil-letter" style="--i:6">G</span></div></div>';
        document.body.appendChild(veil);

        function normPath(p) {
            return p.replace(/\/index\.html$/i, '/') || '/';
        }
        function samePage(url) {
            return normPath(url.pathname) === normPath(location.pathname);
        }

        document.addEventListener('click', function (e) {
            if (e.defaultPrevented) return;
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
            var a = e.target.closest('a');
            if (!a) return;
            if (a.target === '_blank' || a.hasAttribute('download')) return;
            var href = a.getAttribute('href');
            if (!href) return;
            if (/^(mailto:|tel:|javascript:)/i.test(href)) return;
            if (href.charAt(0) === '#') return; // pure same-page anchor — leave to existing handlers

            var url;
            try { url = new URL(href, location.href); } catch (err) { return; }
            if (url.origin !== location.origin) return; // external

            if (samePage(url)) {
                // Same document referenced by filename (e.g. index.html#contact) — scroll, don't reload.
                e.preventDefault();
                var target = url.hash ? document.querySelector(url.hash) : null;
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    if (history.pushState) history.pushState(null, '', url.hash);
                } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
                return;
            }

            // Mark this as an intentional navigation so the next page shows its veil.
            sessionStorage.setItem(navKey, '1');

            e.preventDefault();
            animateVeilProgress(veil, 320);
            veil.classList.add('is-active');
            setTimeout(function () { window.location.href = url.href; }, 370);
        });

        // Reset the cover if the user returns via back/forward cache.
        window.addEventListener('pageshow', function (ev) {
            if (ev.persisted) veil.classList.remove('is-active');
        });
    }

    // ── Social icon hover tooltips ──
    // Types "Follow Adzio on <Network>" out left to right with a caret that
    // advances behind the text. The label lives in the markup (.social-tip-sizer)
    // so there is one source of truth, and that hidden copy also reserves the
    // box's final width — without it the panel would grow character by character
    // and shove itself sideways while you read it.
    function initSocialTips() {
        var links = document.querySelectorAll('.social-link, .contact-item');
        if (!links.length) return;

        // Touch devices fire a sticky :hover on tap, which would leave a tooltip
        // stranded over the footer. Pointer-based hover only.
        var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        if (!canHover) return;

        var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        Array.prototype.forEach.call(links, function (link) {
            var tip = link.querySelector('.social-tip');
            var sizer = tip && tip.querySelector('.social-tip-sizer');
            var out = tip && tip.querySelector('.social-tip-text');
            if (!tip || !sizer || !out) return;

            var full = sizer.textContent.trim();
            var timer = null;

            function type() {
                clearTimeout(timer);
                if (reduce) {
                    out.textContent = full;
                    tip.classList.remove('is-typing');
                    return;
                }
                var i = 0;
                out.textContent = '';
                // Caret holds solid while characters are landing, then blinks.
                tip.classList.add('is-typing');
                (function step() {
                    out.textContent = full.slice(0, ++i);
                    if (i < full.length) {
                        timer = setTimeout(step, 26);
                    } else {
                        tip.classList.remove('is-typing');
                    }
                })();
            }

            function reset() {
                clearTimeout(timer);
                out.textContent = '';
                tip.classList.remove('is-typing');
            }

            link.addEventListener('mouseenter', type);
            link.addEventListener('mouseleave', reset);
            // Keyboard users get the same affordance.
            link.addEventListener('focus', type);
            link.addEventListener('blur', reset);
        });
    }

    function run() {
        inject();
        injectMobileNav();
        initSocialTips();
        setupPageTransitions();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }
})();
