/**
 * Volumetric God Rays - Locked Origin, Tilting Beams
 * Source fixed at top-center, rays TILT toward mouse
 * Uses coordinate skew method for spotlight effect
 */
(function () {
    'use strict';

    const VERT = `
        attribute vec2 a_pos;
        void main() {
            gl_Position = vec4(a_pos, 0.0, 1.0);
        }
    `;

    const FRAG = `
        precision highp float;
        
        uniform float uTime;
        uniform vec2 uRes;
        uniform vec2 uMouse;
        
        #define PI 3.14159265
        #define NUM_RAYS 12.0
        #define SPREAD 3.0
        #define RAY_LENGTH 4.6
        
        float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453);
        }
        
        float noise(vec2 st) {
            vec2 i = floor(st);
            vec2 f = fract(st);
            float a = random(i);
            float b = random(i + vec2(1.0, 0.0));
            float c = random(i + vec2(0.0, 1.0));
            float d = random(i + vec2(1.0, 1.0));
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }
        
        // FBM for smoky texture
        float fbm(vec2 p) {
            float v = 0.0;
            float a = 0.5;
            for (int i = 0; i < 4; i++) {
                v += a * noise(p);
                p *= 2.0;
                a *= 0.5;
            }
            return v;
        }
        
        void main() {
            vec2 uv = gl_FragCoord.xy / uRes;
            float aspect = uRes.x / uRes.y;
            
            // COORDINATE SKEW METHOD:
            // Apply mouse-based tilt that increases with depth (y distance from top)
            // This creates the "tilting spotlight" effect without moving the source
            float depth = 1.0 - uv.y;  // 0 at top, 1 at bottom
            float tilt = (0.5 - uMouse.x) * 0.5;
            uv.x += tilt * depth;  // Skew more at bottom, none at top
            
            // Convert to centered coords
            vec2 p = vec2((uv.x - 0.5) * aspect, depth);
            
            // LOCKED origin at top-center (NEVER moves)
            vec2 rayOrigin = vec2(0.0, 0.0);
            
            // Direction from fixed origin to pixel
            vec2 dir = p - rayOrigin;
            float dist = length(dir);
            float angle = atan(dir.x, dir.y);
            
            float t = uTime * 0.5;
            
            // Accumulate distinct rays
            float raySum = 0.0;
            
            for (float i = 0.0; i < NUM_RAYS; i++) {
                // Each ray at a specific angle within SPREAD cone
                float rayBaseAngle = (i / NUM_RAYS - 0.5) * PI * SPREAD * 0.25;
                
                // Time-based wobble + noise for organic movement
                float wobble = sin(t + i * 2.5) * 0.06;
                float noiseOffset = fbm(vec2(i * 0.3, t * 0.15)) * 0.1;
                float rayAngle = rayBaseAngle + wobble + noiseOffset;
                
                // Angle difference with wrapping
                float angleDiff = angle - rayAngle;
                if (angleDiff > PI) angleDiff -= 2.0 * PI;
                if (angleDiff < -PI) angleDiff += 2.0 * PI;
                
                // Sharp ray with narrow width for distinct beams
                float rayWidth = 0.05 + random(vec2(i, 0.0)) * 0.02;
                float rayIntensity = exp(-angleDiff * angleDiff / (rayWidth * rayWidth * 2.0));
                
                // Distance fade based on RAY_LENGTH
                float distFade = smoothstep(RAY_LENGTH * 0.22, 0.0, dist);
                
                // Smoky variation
                float smoky = 0.6 + fbm(vec2(angle * 2.0 + i, t * 0.2 + dist)) * 0.5;
                
                raySum += rayIntensity * distFade * smoky * 0.12;
            }
            
            // NO GLOWS - only rays
            float light = raySum;
            light = clamp(light, 0.0, 0.65);
            
            // Color #006eff = (0, 0.43, 1.0)
            vec3 color = vec3(0.0, 0.43, 1.0) * light;
            
            gl_FragColor = vec4(color, 1.0);
        }
    `;

    class GodRays {
        constructor() {
            this.canvas = null;
            this.gl = null;
            this.program = null;
            this.container = null;
            this.uniforms = {};
            this.start = performance.now();
            this.mouseX = 0.5;
            this.mouseY = 0.5;
            this.targetX = 0.5;
            this.targetY = 0.5;
            this.running = false;
            this.raf = null;
            this.heroVisible = true;
            this.init();
        }

        init() {
            this.container = document.querySelector('.hero') ||
                document.querySelector('#home') ||
                document.body;

            if (getComputedStyle(this.container).position === 'static') {
                this.container.style.position = 'relative';
            }

            const old = document.getElementById('hero-canvas');
            if (old) old.remove();

            this.canvas = document.createElement('canvas');
            this.canvas.id = 'hero-canvas';
            this.canvas.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: -1;
                pointer-events: none;
                opacity: 0.8;
            `;
            this.container.insertBefore(this.canvas, this.container.firstChild);

            this.gl = this.canvas.getContext('webgl');
            if (!this.gl) {
                console.error('WebGL not supported');
                return;
            }

            if (!this.compile()) return;
            this.geometry();
            this.events();
            this.resize();
            this.run();
            console.log('God Rays - locked origin, tilting beams');
        }

        compile() {
            const gl = this.gl;

            const vs = gl.createShader(gl.VERTEX_SHADER);
            gl.shaderSource(vs, VERT);
            gl.compileShader(vs);
            if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
                console.error('VS:', gl.getShaderInfoLog(vs));
                return false;
            }

            const fs = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(fs, FRAG);
            gl.compileShader(fs);
            if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
                console.error('FS:', gl.getShaderInfoLog(fs));
                return false;
            }

            this.program = gl.createProgram();
            gl.attachShader(this.program, vs);
            gl.attachShader(this.program, fs);
            gl.linkProgram(this.program);
            if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
                console.error('Link:', gl.getProgramInfoLog(this.program));
                return false;
            }

            gl.useProgram(this.program);
            this.uniforms.time = gl.getUniformLocation(this.program, 'uTime');
            this.uniforms.res = gl.getUniformLocation(this.program, 'uRes');
            this.uniforms.mouse = gl.getUniformLocation(this.program, 'uMouse');
            return true;
        }

        geometry() {
            const gl = this.gl;
            const buf = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buf);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
            const loc = gl.getAttribLocation(this.program, 'a_pos');
            gl.enableVertexAttribArray(loc);
            gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        }

        events() {
            document.addEventListener('mousemove', e => {
                if (!this.heroVisible) return;
                this.targetX = e.clientX / window.innerWidth;
                this.targetY = e.clientY / window.innerHeight;
            }, { passive: true });

            document.addEventListener('touchmove', e => {
                if (e.touches[0]) {
                    this.targetX = e.touches[0].clientX / window.innerWidth;
                    this.targetY = e.touches[0].clientY / window.innerHeight;
                }
            }, { passive: true });

            window.addEventListener('resize', () => this.resize());

            document.addEventListener('visibilitychange', () => {
                document.hidden ? this.stop() : this.run();
            });

            // Stop rendering when hero is scrolled off-screen
            const heroEl = this.container;
            if (heroEl && 'IntersectionObserver' in window) {
                const obs = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        this.heroVisible = entry.isIntersecting;
                        if (entry.isIntersecting && !this.running) {
                            this.run();
                        } else if (!entry.isIntersecting && this.running) {
                            this.stop();
                        }
                    });
                }, { threshold: 0 });
                obs.observe(heroEl);
            }
        }

        resize() {
            const w = this.container.clientWidth;
            const h = this.container.clientHeight;
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            this.canvas.width = w * dpr;
            this.canvas.height = h * dpr;
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        }

        frame(ts) {
            if (!this.running || !this.heroVisible) return;

            const gl = this.gl;
            const time = (ts - this.start) * 0.001;

            // Smooth lerp (0.1)
            this.mouseX += (this.targetX - this.mouseX) * 0.1;
            this.mouseY += (this.targetY - this.mouseY) * 0.1;

            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

            gl.uniform1f(this.uniforms.time, time);
            gl.uniform2f(this.uniforms.res, this.canvas.width, this.canvas.height);
            gl.uniform2f(this.uniforms.mouse, this.mouseX, this.mouseY);

            gl.drawArrays(gl.TRIANGLES, 0, 3);
            this.raf = requestAnimationFrame(t => this.frame(t));
        }

        run() {
            if (this.running) return;
            this.running = true;
            if (this.canvas) this.canvas.style.display = 'block';
            this.raf = requestAnimationFrame(t => this.frame(t));
        }

        stop() {
            this.running = false;
            if (this.canvas) this.canvas.style.display = 'none';
            if (this.raf) cancelAnimationFrame(this.raf);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new GodRays());
    } else {
        new GodRays();
    }
})();
