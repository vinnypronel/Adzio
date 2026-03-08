const fs = require('fs');
const file = 'c:\\Users\\vinny\\OneDrive\\Desktop\\Adzio\\index.html';
let content = fs.readFileSync(file, 'utf8');

const newProcessSection = `<!-- Process Section -->
    <section class="process-section" id="process">
        <div id="process-pin-wrapper">
          <div id="process-pin-panel">

            <div id="process-bg-glow"></div>

            <div id="process-pips">
              <div class="process-pip"></div>
              <div class="process-pip"></div>
              <div class="process-pip"></div>
              <div class="process-pip"></div>
              <div class="process-pip"></div>
              <div class="process-pip"></div>
            </div>

            <div id="process-scroll-hint"><span>Scroll</span><div class="process-arrow"></div></div>

            <!-- SLIDE 0 — OUR PROCESS (mirrors THE PROBLEM) -->
            <div class="process-slide" id="process-slide-0">
              <p class="process-s0-label">
                <span class="our">OUR</span>
                <span class="process">PROCESS</span>
              </p>
              <div class="process-s0-bottom">
                <p class="process-s0-desc">A proven 4-step system that turns your ad spend into consistent, compounding revenue — tailored to your business, not a template.</p>
                <div class="process-s0-stat">
                  <span class="process-s0-stat-num">4</span>
                  <span class="process-s0-stat-label">Steps to results</span>
                </div>
              </div>
            </div>

            <!-- SLIDE 1 — intro step overview (mirrors INVISIBLE slide) -->
            <div class="process-slide" id="process-slide-1">
              <p class="process-s1-label">— HERE IS HOW WE DO IT...</p>
              <div class="process-s1-title">
                <span class="line-ghost">FROM</span>
                <span class="line-solid">STRATEGY</span>
                <span class="line-orange">TO SUCCESS</span>
              </div>
              <div class="process-s1-card">
                <div class="process-s1-card-item">
                  <span class="process-s1-card-num">01</span>
                  <span class="process-s1-card-label">Discovery<br>Call</span>
                </div>
                <div class="process-s1-card-item">
                  <span class="process-s1-card-num">02</span>
                  <span class="process-s1-card-label">Custom Strategy</span>
                </div>
                <div class="process-s1-card-item">
                  <span class="process-s1-card-num">03</span>
                  <span class="process-s1-card-label">Launch &amp; Optimize</span>
                </div>
                <div class="process-s1-card-item">
                  <span class="process-s1-card-num">04</span>
                  <span class="process-s1-card-label">Scale &amp;<br>Grow</span>
                </div>
              </div>
            </div>

            <!-- SLIDE 2 — Discovery Call -->
            <div class="process-slide" id="process-slide-2">
              <div class="process-pain-inner">
                <div>
                  <span class="process-pain-tag">01 · Discovery Call</span>
                  <h2 class="process-pain-heading">We start with a <em>real conversation</em></h2>
                  <p class="process-pain-body">We learn about your business, goals, target customers, and current challenges. No sales pitch — just an honest look at where you are and where you want to go.</p>
                </div>
                <div class="process-pain-visual">
                  <div class="process-icon-ring">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.6 3.38 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.5a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </div>
                </div>
              </div>
              <div class="process-ghost-num">01</div>
            </div>

            <!-- SLIDE 3 — Custom Strategy -->
            <div class="process-slide" id="process-slide-3">
              <div class="process-pain-inner">
                <div>
                  <span class="process-pain-tag">02 · Custom Strategy</span>
                  <h2 class="process-pain-heading">A plan built <em>around your business</em></h2>
                  <p class="process-pain-body">We create a tailored marketing plan designed specifically for your business and market. No cookie-cutter templates — every campaign is built from scratch for your goals.</p>
                </div>
                <div class="process-pain-visual">
                  <div class="process-icon-ring">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  </div>
                </div>
              </div>
              <div class="process-ghost-num">02</div>
            </div>

            <!-- SLIDE 4 — Launch & Optimize -->
            <div class="process-slide" id="process-slide-4">
              <div class="process-pain-inner">
                <div>
                  <span class="process-pain-tag">03 · Launch &amp; Optimize</span>
                  <h2 class="process-pain-heading">Live campaigns, <em>real results fast</em></h2>
                  <p class="process-pain-body">We launch your campaigns and continuously optimize based on real data. You see results within the first week — not months of waiting while your budget drains away.</p>
                </div>
                <div class="process-pain-visual">
                  <div class="process-icon-ring">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke-dasharray="60" stroke-dashoffset="-60"/>
                    </svg>
                  </div>
                </div>
              </div>
              <div class="process-ghost-num">03</div>
            </div>

            <!-- SLIDE 5 — Scale & Grow -->
            <div class="process-slide" id="process-slide-5">
              <div class="process-pain-inner">
                <div>
                  <span class="process-pain-tag">04 · Scale &amp; Grow</span>
                  <h2 class="process-pain-heading">Find what works, <em>then scale it</em></h2>
                  <p class="process-pain-body">Once we find what works, we scale it. More leads, more customers, more revenue — every single month. Your growth compounds as we double down on what's winning.</p>
                </div>
                <div class="process-pain-visual">
                  <div class="process-icon-ring">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="20" x2="18" y2="10"/>
                      <line x1="12" y1="20" x2="12" y2="4"/>
                      <line x1="6"  y1="20" x2="6"  y2="14"/>
                    </svg>
                  </div>
                </div>
              </div>
              <div class="process-ghost-num">04</div>
            </div>

          </div>
        </div>
    </section>`;

const startToken = '<!-- Process Section -->';
const endToken = '<!-- CTA Section -->';

const startIndex = content.indexOf(startToken);
const endIndex = content.indexOf(endToken);

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find tokens!");
    process.exit(1);
}

// Replace the chunk
const before = content.slice(0, startIndex);
const after = content.slice(endIndex);

content = before + newProcessSection + '\n\n    ' + after;

// Add css link
content = content.replace('<link rel="stylesheet" href="css/problem.css?v=1.0">', '<link rel="stylesheet" href="css/problem.css?v=1.0">\n    <link rel="stylesheet" href="css/process.css?v=1.0">');

// Add js link
content = content.replace('<script src="js/problem.js?v=1.0"></script>', '<script src="js/problem.js?v=1.0"></script>\n    <script src="js/process.js?v=1.0"></script>');

fs.writeFileSync(file, content);
console.log("Done!");
