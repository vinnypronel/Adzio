/**
 * Light Rays Background Effect - Vanilla JavaScript/WebGL
 * Beautiful radial rays emanating from top-center
 */

(function () {
    'use strict';

    const CONFIG = {
        colorR: 0.0,
        colorG: 0.431,
        colorB: 1.0,
        speed: 2.5,
        spread: 3.0,
        rayLength: 4.6,
        saturation: 0.9,
        distortion: 0.05,
        mouseInfluence: 0.35
    };

    const vertexShaderSource = `
        attribute vec2 position;
        varying vec2 vUv;
        void main() {
            vUv = position * 0.5 + 0.5;
            gl_Position = vec4(position, 0.0, 1.0);
        }
    `;

    const fragmentShaderSource = `
        precision highp float;

        uniform float iTime;
        uniform vec2 iResolution;
        uniform vec3 uColor;
        uniform float uSpread;
        uniform float uRayLength;
        uniform float uDistortion;
        uniform float uMouseInfluence;
        uniform vec2 uMousePos;
        uniform float uSaturation;

        varying vec2 vUv;

        #define PI 3.14159265359
        #define NUM_RAYS 12.0

        float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }

        float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            return mix(
                mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
                mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
                f.y
            );
        }

        void main() {
            vec2 uv = vUv;
            float aspect = iResolution.x / iResolution.y;
            
            // Light source at top center
            vec2 lightPos = vec2(0.5, -0.05);
            lightPos.x += (uMousePos.x - 0.5) * uMouseInfluence * 0.3;
            
            vec2 toPixel = uv - lightPos;
            toPixel.x *= aspect;
            
            float dist = length(toPixel);
            float angle = atan(toPixel.x, toPixel.y);
            
            // Only render downward
            if (toPixel.y < 0.0) {
                gl_FragColor = vec4(0.0);
                return;
            }
            
            float t = iTime * 0.12;
            float rays = 0.0;
            
            // Main rays - beautiful radial beams
            for (float i = 0.0; i < NUM_RAYS; i++) {
                // Spread rays across the cone
                float rayAngle = (i - NUM_RAYS * 0.5) / NUM_RAYS * PI * 0.6;
                
                // Add subtle animation
                float wobble = sin(i * 1.7 + t * 2.0) * uDistortion * 0.4;
                float noiseWobble = (noise(vec2(i * 0.5, t)) - 0.5) * uDistortion * 0.6;
                rayAngle += wobble + noiseWobble;
                
                // Distance from this ray's center line
                float rayDist = abs(angle - rayAngle);
                
                // Ray width - varies per ray
                float baseWidth = 0.025 * uSpread * 0.4;
                float rayWidth = baseWidth * (0.6 + hash(vec2(i, 0.0)) * 0.8);
                
                // Soft ray falloff
                float ray = smoothstep(rayWidth, rayWidth * 0.15, rayDist);
                
                // Distance-based intensity falloff
                float maxDist = uRayLength * 0.45;
                float distFade = 1.0 - smoothstep(0.0, maxDist, dist);
                ray *= distFade;
                
                // Vary ray brightness
                float brightness = 0.5 + hash(vec2(i * 2.0, 0.0)) * 0.5;
                rays += ray * brightness * 0.25;
            }
            
            // Secondary thinner rays for depth
            for (float i = 0.0; i < NUM_RAYS * 0.6; i++) {
                float rayAngle = (i - NUM_RAYS * 0.3) / (NUM_RAYS * 0.6) * PI * 0.5;
                rayAngle += PI / (NUM_RAYS * 2.0); // Offset
                
                float wobble = sin(i * 2.3 + t * 1.5 + 50.0) * uDistortion * 0.3;
                rayAngle += wobble;
                
                float rayDist = abs(angle - rayAngle);
                float rayWidth = 0.012 * uSpread * 0.4;
                float ray = smoothstep(rayWidth, rayWidth * 0.1, rayDist);
                
                float maxDist = uRayLength * 0.4;
                float distFade = 1.0 - smoothstep(0.0, maxDist, dist);
                ray *= distFade * 0.4;
                
                rays += ray * 0.15;
            }
            
            // Add soft glow behind the rays
            float coneAngle = PI * 0.35;
            float angleFromCenter = abs(angle);
            float glow = 1.0 - smoothstep(0.0, coneAngle, angleFromCenter);
            float glowDist = 1.0 - smoothstep(0.0, uRayLength * 0.5, dist);
            float softGlow = glow * glowDist * 0.4;
            
            // Source glow at top
            float sourceGlow = exp(-dist * 5.0) * 0.6;
            
            // Combine
            float totalLight = rays + softGlow + sourceGlow;
            
            // Apply color with saturation
            vec3 color = uColor;
            float luma = dot(color, vec3(0.299, 0.587, 0.114));
            color = mix(vec3(luma), color, uSaturation);
            
            vec3 finalColor = color * totalLight * 1.8;
            finalColor = clamp(finalColor, 0.0, 1.0);
            
            float alpha = clamp(totalLight * 1.2, 0.0, 1.0);
            
            gl_FragColor = vec4(finalColor, alpha);
        }
    `;

    class LightRaysRenderer {
        constructor(canvas) {
            this.canvas = canvas;
            this.gl = null;
            this.program = null;
            this.startTime = performance.now();
            this.mouse = { x: 0.5, y: 0.5 };
            this.targetMouse = { x: 0.5, y: 0.5 };
            this.animationFrame = null;
            this.isRunning = false;
            this.init();
        }

        init() {
            this.gl = this.canvas.getContext('webgl', {
                alpha: true,
                premultipliedAlpha: false,
                antialias: true
            });

            if (!this.gl) {
                console.warn('WebGL not supported');
                return;
            }

            this.setupShaders();
            if (this.program) {
                this.setupGeometry();
                this.setupEventListeners();
                this.resize();
                this.start();
            }
        }

        setupShaders() {
            const gl = this.gl;

            const vs = gl.createShader(gl.VERTEX_SHADER);
            gl.shaderSource(vs, vertexShaderSource);
            gl.compileShader(vs);
            if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
                console.error('VS:', gl.getShaderInfoLog(vs));
                return;
            }

            const fs = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(fs, fragmentShaderSource);
            gl.compileShader(fs);
            if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
                console.error('FS:', gl.getShaderInfoLog(fs));
                return;
            }

            this.program = gl.createProgram();
            gl.attachShader(this.program, vs);
            gl.attachShader(this.program, fs);
            gl.linkProgram(this.program);
            if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
                console.error('Link:', gl.getProgramInfoLog(this.program));
                this.program = null;
                return;
            }

            gl.useProgram(this.program);

            this.uniforms = {
                iTime: gl.getUniformLocation(this.program, 'iTime'),
                iResolution: gl.getUniformLocation(this.program, 'iResolution'),
                uColor: gl.getUniformLocation(this.program, 'uColor'),
                uSpread: gl.getUniformLocation(this.program, 'uSpread'),
                uRayLength: gl.getUniformLocation(this.program, 'uRayLength'),
                uDistortion: gl.getUniformLocation(this.program, 'uDistortion'),
                uMouseInfluence: gl.getUniformLocation(this.program, 'uMouseInfluence'),
                uMousePos: gl.getUniformLocation(this.program, 'uMousePos'),
                uSaturation: gl.getUniformLocation(this.program, 'uSaturation')
            };

            gl.uniform3f(this.uniforms.uColor, CONFIG.colorR, CONFIG.colorG, CONFIG.colorB);
            gl.uniform1f(this.uniforms.uSpread, CONFIG.spread);
            gl.uniform1f(this.uniforms.uRayLength, CONFIG.rayLength);
            gl.uniform1f(this.uniforms.uDistortion, CONFIG.distortion);
            gl.uniform1f(this.uniforms.uMouseInfluence, CONFIG.mouseInfluence);
            gl.uniform1f(this.uniforms.uSaturation, CONFIG.saturation);
        }

        setupGeometry() {
            const gl = this.gl;
            const verts = new Float32Array([-1, -1, 3, -1, -1, 3]);
            const buf = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buf);
            gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
            const pos = gl.getAttribLocation(this.program, 'position');
            gl.enableVertexAttribArray(pos);
            gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
        }

        setupEventListeners() {
            const hero = this.canvas.closest('.hero') || document;
            hero.addEventListener('mousemove', (e) => {
                const r = this.canvas.getBoundingClientRect();
                this.targetMouse.x = (e.clientX - r.left) / r.width;
                this.targetMouse.y = 1.0 - (e.clientY - r.top) / r.height;
            });
            hero.addEventListener('touchmove', (e) => {
                if (e.touches.length) {
                    const r = this.canvas.getBoundingClientRect();
                    this.targetMouse.x = (e.touches[0].clientX - r.left) / r.width;
                    this.targetMouse.y = 1.0 - (e.touches[0].clientY - r.top) / r.height;
                }
            }, { passive: true });
            window.addEventListener('resize', () => this.resize());
            document.addEventListener('visibilitychange', () => {
                document.hidden ? this.pause() : this.start();
            });
        }

        resize() {
            const dpr = Math.min(devicePixelRatio || 1, 2);
            const r = this.canvas.getBoundingClientRect();
            this.canvas.width = r.width * dpr;
            this.canvas.height = r.height * dpr;
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        }

        render(ts) {
            if (!this.isRunning) return;
            const gl = this.gl;
            const time = (ts - this.startTime) * 0.001 * CONFIG.speed;

            this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
            this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;

            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

            gl.uniform1f(this.uniforms.iTime, time);
            gl.uniform2f(this.uniforms.iResolution, this.canvas.width, this.canvas.height);
            gl.uniform2f(this.uniforms.uMousePos, this.mouse.x, this.mouse.y);

            gl.drawArrays(gl.TRIANGLES, 0, 3);
            this.animationFrame = requestAnimationFrame((t) => this.render(t));
        }

        start() {
            if (this.isRunning) return;
            this.isRunning = true;
            this.animationFrame = requestAnimationFrame((t) => this.render(t));
        }

        pause() {
            this.isRunning = false;
            if (this.animationFrame) {
                cancelAnimationFrame(this.animationFrame);
                this.animationFrame = null;
            }
        }
    }

    function init() {
        const canvas = document.getElementById('hero-canvas');
        if (!canvas) return;
        window.lightRaysRenderer = new LightRaysRenderer(canvas);
        console.log('Light Rays: Initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
