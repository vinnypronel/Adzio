(function () {
    const consoleEl = document.querySelector('[data-growth-console]');
    if (!consoleEl) return;

    const views = {
        7: {
            revenue: '$9.6K', leads: '31', roas: '4.9x',
            revenueDelta: '+12.4%', leadsDelta: '+8', roasDelta: '+0.6x',
            meta: 51, google: 31, organic: 18,
            line: 'M0 148 C55 146 78 135 118 138 C160 141 184 112 225 118 C270 125 292 91 337 98 C380 105 407 67 448 72 C474 75 487 51 500 45',
            endY: 45
        },
        30: {
            revenue: '$38.4K', leads: '126', roas: '5.8x',
            revenueDelta: '+28.6%', leadsDelta: '+34', roasDelta: '+1.3x',
            meta: 46, google: 34, organic: 20,
            line: 'M0 145 C48 142 66 126 106 130 C151 134 166 103 210 108 C253 113 276 79 319 84 C365 89 386 51 425 58 C459 64 478 30 500 23',
            endY: 23
        },
        90: {
            revenue: '$112K', leads: '384', roas: '6.4x',
            revenueDelta: '+47.2%', leadsDelta: '+109', roasDelta: '+1.9x',
            meta: 42, google: 36, organic: 22,
            line: 'M0 151 C44 148 67 132 108 136 C148 140 175 111 216 115 C258 119 285 83 327 87 C370 91 397 48 438 52 C470 55 486 18 500 12',
            endY: 12
        }
    };

    const setText = (selector, value) => {
        const element = consoleEl.querySelector(selector);
        if (element) element.textContent = value;
    };

    consoleEl.querySelectorAll('[data-period]').forEach(button => {
        button.addEventListener('click', () => {
            const view = views[button.dataset.period];
            if (!view) return;

            consoleEl.querySelectorAll('[data-period]').forEach(item => {
                item.classList.toggle('active', item === button);
            });

            setText('[data-metric="revenue"]', view.revenue);
            setText('[data-metric="leads"]', view.leads);
            setText('[data-metric="roas"]', view.roas);
            setText('[data-delta="revenue"]', view.revenueDelta);
            setText('[data-delta="leads"]', view.leadsDelta);
            setText('[data-delta="roas"]', view.roasDelta);

            const line = consoleEl.querySelector('[data-chart-line]');
            const area = consoleEl.querySelector('[data-chart-area]');
            const end = consoleEl.querySelector('[data-chart-end]');
            if (line) line.setAttribute('d', view.line);
            if (area) area.setAttribute('d', `${view.line} L500 170 L0 170 Z`);
            if (end) end.setAttribute('cy', view.endY);

            ['meta', 'google', 'organic'].forEach(channel => {
                const value = view[channel];
                const label = consoleEl.querySelector(`[data-channel="${channel}"]`);
                const bar = label?.previousElementSibling?.querySelector('b');
                if (label) label.textContent = `${value}%`;
                if (bar) bar.style.setProperty('--channel-width', `${value}%`);
            });

            consoleEl.classList.remove('growth-console--updated');
            void consoleEl.offsetWidth;
            consoleEl.classList.add('growth-console--updated');
        });
    });
})();
