const fs = require('fs');
const html = fs.readFileSync('c:/MY PROJECTS/Adzio/services.html', 'utf8');

const scriptRegex = /<script>([\s\S]*?)<\/script>/g;
let match;
let count = 0;
while ((match = scriptRegex.exec(html)) !== null) {
    count++;
    const code = match[1];
    try {
        new Function(code);
        console.log(`Script ${count} parsed successfully.`);
    } catch (e) {
        console.error(`Syntax error in inline script ${count}:`, e);
    }
}
