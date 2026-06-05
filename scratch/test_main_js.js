// Mock standard browser APIs
global.window = {
    innerWidth: 1024,
    addEventListener: () => {},
    scrollTo: () => {},
    pageYOffset: 0,
    scrollY: 0
};
global.document = {
    addEventListener: () => {},
    getElementById: (id) => {
        return {
            addEventListener: () => {},
            querySelector: () => null,
            querySelectorAll: () => [],
            style: {},
            setAttribute: () => {},
            classList: { add: () => {}, remove: () => {}, toggle: () => {} },
            options: [{ text: '' }]
        };
    },
    querySelectorAll: () => [],
    querySelector: () => null,
    documentElement: {
        style: {
            setProperty: () => {}
        }
    }
};
global.IntersectionObserver = class {
    observe() {}
    unobserve() {}
};
global.lottie = {
    loadAnimation: () => ({ goToAndPlay: () => {} })
};
global.gsap = {
    registerPlugin: () => {},
    utils: { toArray: () => [] },
    timeline: () => ({ to: () => {} }),
    set: () => {},
    fromTo: () => {},
    to: () => {}
};
global.ScrollTrigger = {};

try {
    require('c:/MY PROJECTS/Adzio/js/main.js');
    console.log("Successfully ran main.js without crash.");
} catch (e) {
    console.error("Crash in main.js execution:", e);
}
