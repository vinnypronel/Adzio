/**
 * Silk on Black — full-page scroll-reactive WebGL background.
 *
 * One fixed canvas behind all content (all pages). Procedural "flowing silk"
 * ribbons rendered by a single fullscreen fragment shader: 2-3 parallax depth
 * layers on near-black, motion energy driven by scroll velocity, and (on the
 * homepage) exclusion masks that route the lines around the hero headline and
 * VSL, flooding the vacated space as the VSL docks (reads window._vslProgress /
 * window._vslRect published by vsl-scroll.js).
 *
 * Resilience contract: the `silk-active` class is added to <html> only after
 * the GL context and program are alive — every CSS change that removes the old
 * static background is scoped under that class, so any failure (no WebGL,
 * reduced motion, context loss, sustained low FPS) leaves or returns the site
 * to its original look. This file must never be able to break the page.
 */
(function () {
    'use strict';

    var VERT = [
        'attribute vec2 a_pos;',
        'void main() {',
        '    gl_Position = vec4(a_pos, 0.0, 1.0);',
        '}'
    ].join('\n');

    // Fragment source is a function of the quality tier: WebGL1 requires
    // constant loop bounds, so OCTAVES/LAYERS are baked in via #define and a
    // tier change means a one-off recompile.
    function buildFrag(octaves, layers) {
        return [
            '#ifdef GL_FRAGMENT_PRECISION_HIGH',
            'precision highp float;',
            '#else',
            'precision mediump float;',
            '#endif',
            '',
            '#define OCTAVES ' + octaves,
            '#define LAYERS ' + layers,
            '',
            'uniform float uTime;         // flow-time: pre-warped by scroll velocity in JS',
            'uniform vec2  uRes;',
            'uniform float uScrollN;      // scrollY / viewport css height',
            'uniform float uVelocity;     // 0-1 smoothed scroll energy',
            'uniform float uIntensity;    // 0-1 ambient level (hero bright -> whisper)',
            'uniform float uMaskStrength; // 1 on index (hero masks live), 0 elsewhere',
            'uniform float uTitleWeight;  // fades the title mask as the VSL docks',
            'uniform vec4  uRectTitle;    // cx, cy, hw, hh in uv, y-up',
            'uniform vec4  uRectVsl;',
            'uniform vec3  uBloom;        // cx, cy, strength — silk floods the vacated hero space',
            '',
            'float hash(vec2 st) {',
            '    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453);',
            '}',
            '',
            'float noise(vec2 st) {',
            '    vec2 i = floor(st);',
            '    vec2 f = fract(st);',
            '    float a = hash(i);',
            '    float b = hash(i + vec2(1.0, 0.0));',
            '    float c = hash(i + vec2(0.0, 1.0));',
            '    float d = hash(i + vec2(1.0, 1.0));',
            '    vec2 u = f * f * (3.0 - 2.0 * f);',
            '    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;',
            '}',
            '',
            'float fbm(vec2 p) {',
            '    float v = 0.0;',
            '    float a = 0.5;',
            '    for (int i = 0; i < OCTAVES; i++) {',
            '        v += a * noise(p);',
            '        p *= 2.0;',
            '        a *= 0.5;',
            '    }',
            '    return v;',
            '}',
            '',
            '// One depth layer of ribbons. Domain-warped horizontal bands: a fbm',
            '// field bends straight lines into flowing silk; a second fbm sampled',
            '// along the flow makes each ribbon catch light unevenly (the sheen).',
            'float silkLayer(vec2 p, float parallax, float lineCount, float width,',
            '                float warpAmp, float speed, float seed) {',
            '    p.y -= uScrollN * parallax;',
            '    vec2 np = p * vec2(1.2, 2.4);',
            '    // fast scroll stretches the noise domain horizontally -> streaks',
            '    np.x /= (1.0 + uVelocity * 1.2);',
            '    float w = fbm(np + vec2(uTime * speed + seed * 13.1, seed * 7.31));',
            '    float f = p.y * lineCount + w * warpAmp;',
            '    float d = abs(fract(f) - 0.5);',
            '    float soft = width * (1.0 + uVelocity * 0.6);',
            '    float line = exp(-d * d / (soft * soft));',
            '    float shimmer = 0.35 + 0.65 * fbm(vec2(p.x * 0.9 - uTime * speed * 0.55, f * 0.8) + seed);',
            '    // cluster gate: ribbons arrive in flowing bands with black gaps',
            '    // between them, instead of filling the whole frame uniformly',
            '    float gate = smoothstep(0.30, 0.75, noise(p * 0.9 + vec2(seed * 2.7, uTime * 0.015)));',
            '    return line * shimmer * gate;',
            '}',
            '',
            '// 1 outside the (feathered) rect, 0 inside — carves quiet pockets',
            '// behind the hero headline and video.',
            'float rectMask(vec2 pos, vec4 rect, float aspect, float feather) {',
            '    vec2 c  = vec2(rect.x * aspect, rect.y);',
            '    vec2 he = vec2(rect.z * aspect, rect.w);',
            '    vec2 d = abs(pos - c) - he;',
            '    float sdf = length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0);',
            '    return smoothstep(0.0, feather, sdf);',
            '}',
            '',
            'void main() {',
            '    vec2 uv = gl_FragCoord.xy / uRes;',
            '    float aspect = uRes.x / uRes.y;',
            '    vec2 p = vec2(uv.x * aspect, uv.y);',
            '',
            '    // Far: wide + soft (reads as blurred distance). Near: thin + sharp.',
            '    float far = silkLayer(p, 0.12, 3.0, 0.22, 0.90, 0.030, 1.7);',
            '    float mid = silkLayer(p, 0.30, 4.0, 0.10, 1.15, 0.042, 4.3);',
            '    float silk = far * 0.13 + mid * 0.28;',
            '    float near = 0.0;',
            '#if LAYERS >= 3',
            '    near = silkLayer(p, 0.55, 5.0, 0.045, 1.50, 0.055, 9.2);',
            '    // velocity lowers the falloff exponent -> motion-blur ribbons',
            '    near = pow(near, 1.0 / (1.0 + uVelocity * 0.8));',
            '    silk += near * 0.70;',
            '#endif',
            '',
            '    float mTitle = mix(1.0, rectMask(p, uRectTitle, aspect, 0.12),',
            '                       uMaskStrength * uTitleWeight);',
            '    float mVsl = mix(1.0, rectMask(p, uRectVsl, aspect, 0.035), uMaskStrength);',
            '    silk *= mTitle * mVsl;',
            '',
            '    // As the VSL docks, silk floods the space it vacated.',
            '    vec2 bc = vec2(uBloom.x * aspect, uBloom.y);',
            '    float bd = length(p - bc);',
            '    silk += uBloom.z * exp(-bd * bd / 0.09) * (mid * 0.5 + near) * 0.6 * uMaskStrength;',
            '',
            '    float s = silk * uIntensity;',
            '',
            '    // Desaturated cyan, kept close to black: deep teal in the body,',
            '    // with only a muted cyan at the brightest cores.',
            '    vec3 dimC = vec3(0.005, 0.095, 0.120);',
            '    vec3 briC = vec3(0.100, 0.420, 0.500);',
            '    vec3 col = mix(dimC, briC, clamp(s, 0.0, 1.0)) * s;',
            '    col = vec3(1.0) - exp(-col * 1.4);',
            '',
            '    col += vec3(0.0314, 0.0431, 0.0667); // base #080B11',
            '    // dither: near-black gradients band badly, especially on OLED',
            '    col += (hash(gl_FragCoord.xy + vec2(fract(uTime))) - 0.5) / 255.0;',
            '',
            '    gl_FragColor = vec4(col, 1.0);',
            '}'
        ].join('\n');
    }

    // Quality tiers, low to high. The watchdog only ever steps DOWN.
    var TIERS = [
        { dprCap: 1.0, layers: 2, octaves: 3 },
        { dprCap: 1.25, layers: 3, octaves: 3 },
        { dprCap: 1.5, layers: 3, octaves: 4 }
    ];

    function pickTier() {
        var w = window.innerWidth;
        var cores = navigator.hardwareConcurrency || 4;
        var conn = navigator.connection;
        if (conn && conn.saveData) return 0;
        if (w <= 768 && cores <= 4) return 0;
        if (w >= 1024 && cores >= 6) return 2;
        return 1;
    }

    function SilkBg() {
        this.canvas = null;
        this.gl = null;
        this.program = null;
        this.u = {};
        this.tier = pickTier();
        this.dprCap = TIERS[this.tier].dprCap;
        this.running = false;
        this.raf = null;
        this.dead = false;

        // scroll / velocity pipeline
        this.prevY = window.scrollY;
        this.vSmooth = 0;
        this.flowTime = 0;
        this.lastTs = 0;

        // watchdog
        this.bootTs = performance.now();
        this.frameMsSum = 0;
        this.frameCount = 0;
        this.lastCheck = this.bootTs;

        // hero geometry (index only; null elsewhere)
        this.hero = document.querySelector('.hero');
        this.heroH = 0;
        this.titleDoc = null;   // { top, left, w, h } in document space
        this.bloomDoc = null;   // { cx, cy } document-space center of the VSL's hero spot
        this.isMobile = window.matchMedia('(max-width: 768px)').matches;

        this.init();
    }

    SilkBg.prototype.init = function () {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'silk-canvas';
        this.canvas.style.cssText =
            'position:fixed;top:0;left:0;width:100%;height:100%;' +
            'z-index:-1;pointer-events:none;';

        this.gl = this.canvas.getContext('webgl', {
            alpha: false,
            antialias: false,
            depth: false,
            stencil: false,
            powerPreference: 'high-performance',
            failIfMajorPerformanceCaveat: true
        });
        if (!this.gl) return; // silk-active never added; static CSS stays

        if (!this.compile()) return;
        this.geometry();

        document.body.insertBefore(this.canvas, document.body.firstChild);
        this.events();
        this.measure();
        this.sizeCanvas();

        document.documentElement.classList.add('silk-active');
        this.run();
    };

    SilkBg.prototype.compile = function () {
        var gl = this.gl;
        var spec = TIERS[this.tier];

        var vs = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vs, VERT);
        gl.compileShader(vs);
        if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) return false;

        var fs = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fs, buildFrag(spec.octaves, spec.layers));
        gl.compileShader(fs);
        if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) return false;

        var prog = gl.createProgram();
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;

        if (this.program) gl.deleteProgram(this.program);
        this.program = prog;
        gl.useProgram(prog);

        var names = ['uTime', 'uRes', 'uScrollN', 'uVelocity', 'uIntensity',
            'uMaskStrength', 'uTitleWeight', 'uRectTitle', 'uRectVsl', 'uBloom'];
        for (var i = 0; i < names.length; i++) {
            this.u[names[i]] = gl.getUniformLocation(prog, names[i]);
        }
        return true;
    };

    SilkBg.prototype.geometry = function () {
        var gl = this.gl;
        var buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        var loc = gl.getAttribLocation(this.program, 'a_pos');
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    };

    // Document-space rects, read once at boot / width-resize — never per frame.
    SilkBg.prototype.measure = function () {
        var y = window.scrollY;
        if (this.hero) this.heroH = this.hero.offsetHeight || window.innerHeight;

        var title = document.querySelector('.hero-title');
        if (title) {
            var r = title.getBoundingClientRect();
            this.titleDoc = { top: r.top + y, left: r.left, w: r.width, h: r.height };
        } else {
            this.titleDoc = null;
        }

        var vsl = document.querySelector('.hero-vsl');
        if (vsl) {
            var v = vsl.getBoundingClientRect();
            this.bloomDoc = { cx: v.left + v.width / 2, cy: v.top + y + v.height / 2 };
        } else {
            this.bloomDoc = null;
        }
    };

    SilkBg.prototype.sizeCanvas = function () {
        var gl = this.gl;
        var dpr = Math.min(window.devicePixelRatio || 1, this.dprCap);
        this.canvas.width = Math.max(1, Math.round(window.innerWidth * dpr));
        this.canvas.height = Math.max(1, Math.round(window.innerHeight * dpr));
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    };

    SilkBg.prototype.events = function () {
        var self = this;

        this.canvas.addEventListener('webglcontextlost', function (e) {
            e.preventDefault();
            self.stop();
            document.documentElement.classList.remove('silk-active');
        });
        this.canvas.addEventListener('webglcontextrestored', function () {
            if (self.dead) return;
            if (self.compile()) {
                self.geometry();
                self.sizeCanvas();
                document.documentElement.classList.add('silk-active');
                self.run();
            }
        });

        document.addEventListener('visibilitychange', function () {
            if (self.dead) return;
            if (document.hidden) self.stop();
            else self.run();
        });

        // Height-only resizes (mobile URL bar) resize the buffer immediately but
        // skip re-measuring — a layout read mid-scroll would jank. Width changes
        // (rotation, window resize) re-measure after settling.
        var lastW = window.innerWidth;
        var timer = null;
        window.addEventListener('resize', function () {
            if (self.dead) return;
            if (window.innerWidth === lastW) {
                self.sizeCanvas();
                return;
            }
            clearTimeout(timer);
            timer = setTimeout(function () {
                lastW = window.innerWidth;
                self.isMobile = window.matchMedia('(max-width: 768px)').matches;
                self.measure();
                self.sizeCanvas();
            }, 150);
        });
    };

    // px rect (viewport, y-down) -> uv vec4 (cx, cy, hw, hh, y-up), padded so
    // the quiet pocket breathes around the content instead of hugging it.
    function rectToUv(left, top, w, h, cssW, cssH, pad) {
        return [
            (left + w / 2) / cssW,
            1.0 - (top + h / 2) / cssH,
            (w / 2 + pad) / cssW,
            (h / 2 + pad) / cssH
        ];
    }

    var OFFSCREEN_RECT = [-9.0, -9.0, 0.0, 0.0];

    SilkBg.prototype.frame = function (ts) {
        if (!this.running) return;
        var gl = this.gl;
        var self = this;

        if (!this.lastTs) this.lastTs = ts;
        var dt = Math.min(ts - this.lastTs, 100); // clamp across pauses
        this.lastTs = ts;

        var cssW = window.innerWidth;
        var cssH = window.innerHeight;
        var y = window.scrollY;

        // ── velocity: fast attack, slow release (calms over ~1.5-2s) ──
        var vRaw = dt > 0 ? Math.abs(y - this.prevY) / (dt / 1000) : 0;
        this.prevY = y;
        var tau = vRaw > this.vSmooth ? 120 : 650;
        this.vSmooth += (vRaw - this.vSmooth) * (1 - Math.exp(-dt / tau));
        var vel = 1 - Math.exp(-this.vSmooth / 1400);

        // flow-time accumulates faster while scrolling — smooth speed-up with
        // no time-jump, and the base rate is the idle "breathing"
        this.flowTime += (dt / 1000) * (1 + vel * 3);

        // ── ambient intensity: hero statement -> post-hero whisper ──
        var intensity;
        if (this.hero && this.heroH) {
            var f = Math.min(Math.max((y - this.heroH * 0.45) / (this.heroH * 0.55), 0), 1);
            intensity = 1.0 - 0.65 * f;
        } else {
            intensity = 0.55 - 0.23 * Math.min(y / 600, 1);
        }
        intensity = Math.min(1, intensity + 0.25 * vel);

        // ── hero masks (index only) ──
        var p = typeof window._vslProgress === 'number' ? window._vslProgress : 0;
        var maskStrength = 0;
        var rectTitle = OFFSCREEN_RECT;
        var rectVsl = OFFSCREEN_RECT;
        var bloom = [0, 0, 0];

        if (this.titleDoc) {
            maskStrength = 1;
            // mobile vsl-scroll shifts the copy down by up to 100px as it docks
            var shift = this.isMobile ? 100 * p : 0;
            rectTitle = rectToUv(
                this.titleDoc.left, this.titleDoc.top - y + shift,
                this.titleDoc.w, this.titleDoc.h, cssW, cssH, 28);
        }
        var vr = window._vslRect;
        if (vr) {
            maskStrength = 1;
            rectVsl = rectToUv(vr.x, vr.y, vr.w, vr.h, cssW, cssH, 4);
        }
        if (this.bloomDoc) {
            bloom = [
                this.bloomDoc.cx / cssW,
                1.0 - (this.bloomDoc.cy - y) / cssH,
                p
            ];
        }

        gl.uniform1f(this.u.uTime, this.flowTime);
        gl.uniform2f(this.u.uRes, this.canvas.width, this.canvas.height);
        gl.uniform1f(this.u.uScrollN, y / cssH);
        gl.uniform1f(this.u.uVelocity, vel);
        gl.uniform1f(this.u.uIntensity, intensity);
        gl.uniform1f(this.u.uMaskStrength, maskStrength);
        gl.uniform1f(this.u.uTitleWeight, 1 - p);
        gl.uniform4f(this.u.uRectTitle, rectTitle[0], rectTitle[1], rectTitle[2], rectTitle[3]);
        gl.uniform4f(this.u.uRectVsl, rectVsl[0], rectVsl[1], rectVsl[2], rectVsl[3]);
        gl.uniform3f(this.u.uBloom, bloom[0], bloom[1], bloom[2]);

        gl.drawArrays(gl.TRIANGLES, 0, 3);

        this.watchdog(ts, dt);
        if (this.running) {
            this.raf = requestAnimationFrame(function (t) { self.frame(t); });
        }
    };

    // FPS watchdog: one-way quality ratchet. DPR steps are cheap (resize);
    // tier drops recompile the shader; the last resort tears everything down
    // and restores the static CSS background.
    SilkBg.prototype.watchdog = function (ts, dt) {
        if (ts - this.bootTs < 3000) return; // warm-up
        this.frameMsSum += dt;
        this.frameCount++;
        if (ts - this.lastCheck < 5000) return;

        var avg = this.frameCount ? this.frameMsSum / this.frameCount : 0;
        this.frameMsSum = 0;
        this.frameCount = 0;
        this.lastCheck = ts;
        if (avg <= 22) return;

        if (this.dprCap > 0.75) {
            this.dprCap = Math.max(0.75, this.dprCap - 0.25);
            this.sizeCanvas();
        } else if (this.tier > 0) {
            this.tier--;
            if (this.compile()) {
                this.geometry();
            } else {
                this.teardown();
            }
        } else {
            this.teardown();
        }
    };

    SilkBg.prototype.teardown = function () {
        this.dead = true;
        this.stop();
        document.documentElement.classList.remove('silk-active');
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    };

    SilkBg.prototype.run = function () {
        if (this.running || this.dead) return;
        this.running = true;
        this.lastTs = 0;
        var self = this;
        this.raf = requestAnimationFrame(function (t) { self.frame(t); });
    };

    SilkBg.prototype.stop = function () {
        this.running = false;
        if (this.raf) cancelAnimationFrame(this.raf);
    };

    function boot() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        try {
            new SilkBg();
        } catch (e) {
            // any unexpected failure: never touch the page
            document.documentElement.classList.remove('silk-active');
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
