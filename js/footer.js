(function () {
    var html = `
<footer class="footer">
    <div class="footer-glow glow-1"></div>
    <div class="footer-glow glow-2"></div>

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
                <a href="index.html#contact" class="footer-lets-talk">
                    <span class="footer-lets-talk-spacer"></span>
                    <span>Let's talk</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                </a>
            </div>

            <!-- Nav Columns -->
            <nav class="footer-nav">
                <div class="footer-column">
                    <h4>Sitemap</h4>
                    <ul class="footer-links">
                        <li><a href="index.html#home">Home</a></li>
                        <li><a href="about-us.html">About</a></li>
                        <li><a href="services.html#services-overview">Services</a></li>
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
                    <div class="contact-names">Devyn Schroeder &amp; Anton Veliu</div>
                </div>
            </div>
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

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inject);
    } else {
        inject();
    }
})();
