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
                <p class="footer-tagline">The boutique growth partner behind local market leaders.</p>
                <div class="footer-social">
                    <a href="https://www.instagram.com/adzio.io/" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Instagram">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                    </a>
                    <a href="https://www.facebook.com/profile.php?id=61583384871237" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Facebook">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                        </svg>
                    </a>
                    <a href="https://x.com/AdzioMarketing" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="X (Twitter)">
                        <svg fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                        </svg>
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
                </a>
                <a href="tel:7326546635" class="contact-item" id="phone-contact">
                    <div class="contact-icon" id="lottie-phone"></div>
                    <span>(732) 654-6635</span>
                </a>
                <div class="footer-founders">
                    <span class="founders-label">Founders</span>
                    <div class="contact-names">Anton Veliu &amp; Devyn Schroeder</div>
                </div>
            </div>
        </div>

        <!-- Bottom CTA -->
        <div class="footer-bottom-cta">
            <a href="index.html#contact" class="footer-lets-talk">
                <span>Let's Talk</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
            </a>
        </div>

        <!-- Bottom Bar -->
        <div class="footer-bottom">
            <p class="footer-copyright">&copy; 2026 Adzio.io. All rights reserved.</p>
            <div class="footer-legal">
                <a href="#" onclick="typeof openLegal==='function'&&openLegal('privacy');return false;">Privacy Policy</a>
                <a href="#" onclick="typeof openLegal==='function'&&openLegal('terms');return false;">Terms of Service</a>
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
    var mobileNav = `
<div class="m-nav" id="mNav">
    <a href="index.html#home" class="m-nav-brand" aria-label="Adzio home">
        <img src="assets/logo.png" alt="Adzio">
    </a>
    <button class="m-nav-toggle" id="mNavToggle" aria-label="Open menu" aria-expanded="false">
        <span></span><span></span>
    </button>
    <div class="m-nav-panel" id="mNavPanel">
        <nav class="m-nav-links">
            <a href="index.html#home">Home</a>
            <a href="services.html">Services</a>
            <a href="about-us.html">About</a>
            <a href="index.html#contact">Contact</a>
        </nav>
        <a href="index.html#contact" class="m-nav-cta">Book a Call</a>
        <div class="m-nav-foot">
            <a href="https://www.instagram.com/adzio.io/" target="_blank" rel="noopener noreferrer">Instagram</a>
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
        var veil = document.createElement('div');
        veil.className = 'pt-veil';
        veil.setAttribute('aria-hidden', 'true');
        veil.innerHTML = '<img src="assets/logo.png" alt="" class="veil-logo"><div class="veil-spinner"></div>';
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

            e.preventDefault();
            veil.classList.add('is-active');
            setTimeout(function () { window.location.href = url.href; }, 370);
        });

        // Reset the cover if the user returns via back/forward cache.
        window.addEventListener('pageshow', function (ev) {
            if (ev.persisted) veil.classList.remove('is-active');
        });
    }

    function run() {
        inject();
        injectMobileNav();
        setupPageTransitions();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }
})();
