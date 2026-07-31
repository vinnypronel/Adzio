(function () {
    const consoleEl = document.querySelector('[data-growth-console]');
    if (!consoleEl) return;

    /* ------------------------------------------------------------------
       PLACEHOLDER DATA - illustrative sample account, not a real client.
       Swap these arrays for real reporting numbers before this goes live.
       Every headline figure below is derived from `baseline` / `growth`,
       so the KPIs, the chart and the deltas can never disagree.
       ------------------------------------------------------------------ */
    const views = {
        7: {
            unit: 'day',
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            baseline: [1.15, 1.2, 1.1, 1.25, 1.2, 1.15, 1.2],
            growth: [1.2, 1.25, 1.3, 1.4, 1.45, 1.5, 1.5],
            yMax: 2,
            leads: { base: 22, now: 31 },
            cpa: { base: 58, now: 44 },
            channels: { meta: 16, google: 9, organic: 6 }
        },
        30: {
            unit: 'week',
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            baseline: [5.9, 6.0, 6.1, 6.2],
            growth: [7.2, 9.0, 10.6, 11.6],
            yMax: 16,
            leads: { base: 92, now: 126 },
            cpa: { base: 62, now: 41 },
            channels: { meta: 58, google: 43, organic: 25 }
        },
        90: {
            unit: 'month',
            labels: ['Month 1', 'Month 2', 'Month 3'],
            baseline: [25, 25, 26],
            growth: [28, 38, 46],
            yMax: 60,
            leads: { base: 261, now: 384 },
            cpa: { base: 66, now: 38 },
            channels: { meta: 161, google: 138, organic: 85 }
        }
    };

    // Plot box inside the 520x196 viewBox: left gutter for value labels,
    // bottom strip for the period labels.
    const P = { x0: 46, x1: 508, yTop: 16, yBot: 150, xLabelY: 172 };

    const sum = (a) => a.reduce((t, n) => t + n, 0);
    const pct = (now, base) => Math.round(((now - base) / base) * 100);
    const money = (n) => (n >= 100 ? `$${Math.round(n)}K` : `$${n.toFixed(1)}K`);

    const xAt = (i, n) => (n < 2 ? P.x0 : P.x0 + ((P.x1 - P.x0) * i) / (n - 1));
    const yAt = (v, yMax) => P.yBot - (v / yMax) * (P.yBot - P.yTop);

    const linePath = (arr, yMax) =>
        arr.map((v, i) => `${i ? 'L' : 'M'}${xAt(i, arr.length).toFixed(1)} ${yAt(v, yMax).toFixed(1)}`).join(' ');

    const set = (sel, value) => {
        const el = consoleEl.querySelector(sel);
        if (el) el.textContent = value;
    };

    const svgNS = 'http://www.w3.org/2000/svg';
    const el = (name, attrs, text) => {
        const node = document.createElementNS(svgNS, name);
        Object.keys(attrs).forEach((k) => node.setAttribute(k, attrs[k]));
        if (text != null) node.textContent = text;
        return node;
    };
    const clear = (node) => { while (node && node.firstChild) node.removeChild(node.firstChild); };

    const render = (view) => {
        const revNow = sum(view.growth);
        const revBase = sum(view.baseline);

        // KPI row - value, change vs the pre-Adzio baseline, and the baseline itself,
        // so the number is always shown against something instead of floating alone.
        set('[data-metric="revenue"]', money(revNow));
        set('[data-base="revenue"]', money(revBase));
        set('[data-delta="revenue"]', `+${pct(revNow, revBase)}% vs baseline`);

        set('[data-metric="leads"]', String(view.leads.now));
        set('[data-base="leads"]', String(view.leads.base));
        set('[data-delta="leads"]', `+${pct(view.leads.now, view.leads.base)}% vs baseline`);

        set('[data-metric="cpa"]', `$${view.cpa.now}`);
        set('[data-base="cpa"]', `$${view.cpa.base}`);
        // Cost falling is the good direction, so this one reads as a minus.
        set('[data-delta="cpa"]', `−${Math.abs(pct(view.cpa.now, view.cpa.base))}% vs baseline`);

        set('[data-chart-unit]', view.unit);

        // Chart -------------------------------------------------------
        const grid = consoleEl.querySelector('[data-chart-grid]');
        const yLabels = consoleEl.querySelector('[data-chart-ylabels]');
        const xLabels = consoleEl.querySelector('[data-chart-xlabels]');
        const dots = consoleEl.querySelector('[data-chart-dots]');
        clear(grid); clear(yLabels); clear(xLabels); clear(dots);

        const steps = 4;
        for (let i = 0; i <= steps; i++) {
            const v = (view.yMax / steps) * i;
            const y = yAt(v, view.yMax);
            grid.appendChild(el('line', { x1: P.x0, y1: y.toFixed(1), x2: P.x1, y2: y.toFixed(1) }));
            // Keep halves readable on the small-value views instead of rounding
            // two ticks to the same number.
            const tick = v === 0 ? '0'
                : `${(v < 10 ? v.toFixed(1).replace(/\.0$/, '') : String(Math.round(v)))}K`;
            yLabels.appendChild(el('text', { x: P.x0 - 10, y: (y + 3.5).toFixed(1), 'text-anchor': 'end' }, tick));
        }

        view.labels.forEach((label, i) => {
            const n = view.labels.length;
            xLabels.appendChild(el('text', {
                x: xAt(i, n).toFixed(1),
                y: P.xLabelY,
                'text-anchor': i === 0 ? 'start' : (i === n - 1 ? 'end' : 'middle')
            }, label));
        });

        const growthPath = linePath(view.growth, view.yMax);
        consoleEl.querySelector('[data-chart-line]').setAttribute('d', growthPath);
        consoleEl.querySelector('[data-chart-baseline]').setAttribute('d', linePath(view.baseline, view.yMax));
        consoleEl.querySelector('[data-chart-area]').setAttribute(
            'd', `${growthPath} L${P.x1} ${P.yBot} L${P.x0} ${P.yBot} Z`
        );

        // Only the final point is marked, and only on the Adzio series - a dot on
        // every point turns the line into noise.
        const lastI = view.growth.length - 1;
        dots.appendChild(el('circle', {
            class: 'growth-chart-end',
            cx: xAt(lastI, view.growth.length).toFixed(1),
            cy: yAt(view.growth[lastI], view.yMax).toFixed(1),
            r: 5
        }));

        // Channels ----------------------------------------------------
        const channelTotal = sum(Object.values(view.channels));
        set('[data-channel-total]', `${channelTotal} total`);
        const max = Math.max.apply(null, Object.values(view.channels));
        Object.keys(view.channels).forEach((key) => {
            const value = view.channels[key];
            const label = consoleEl.querySelector(`[data-channel="${key}"]`);
            const bar = label && label.previousElementSibling
                ? label.previousElementSibling.querySelector('b') : null;
            if (label) label.textContent = String(value);
            if (bar) bar.style.setProperty('--channel-width', `${Math.round((value / max) * 100)}%`);
        });

        consoleEl.classList.remove('growth-console--updated');
        void consoleEl.offsetWidth;
        consoleEl.classList.add('growth-console--updated');
    };

    const buttons = consoleEl.querySelectorAll('[data-period]');
    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            const view = views[button.dataset.period];
            if (!view) return;
            buttons.forEach((item) => item.classList.toggle('active', item === button));
            render(view);
        });
    });

    const initial = consoleEl.querySelector('[data-period].active') || buttons[0];
    if (initial && views[initial.dataset.period]) render(views[initial.dataset.period]);
})();
