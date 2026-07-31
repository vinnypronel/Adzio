const browserSync = require('browser-sync').create();

const port = Number(process.env.PORT || process.argv[2] || 3000);
const host = process.env.HOST || 'localhost';

browserSync.init({
    server: {
        baseDir: './'
    },
    host: host,
    port: port,
    files: [
        '*.html',
        'css/**/*.css',
        'js/**/*.js',
        'assets/**/*'
    ],
    notify: false,
    open: false,
    ui: false
}, () => {
    console.log(`\n🚀 Adzio dev server running with Live Reload at http://${host}:${port}\n`);
});

