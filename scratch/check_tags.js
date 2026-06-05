const fs = require('fs');
const html = fs.readFileSync('c:/MY PROJECTS/Adzio/services.html', 'utf8');

// A very basic HTML parser to find unclosed divs or elements
const stack = [];
const tagRegex = /<\/?([a-zA-Z0-9:-]+)(?:\s+[^>]*)?>/g;
let match;
let hasError = false;

// List of self-closing tags
const selfClosing = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr', 'path', 'line', 'polyline', 'rect', 'circle', 'svg'
]);

while ((match = tagRegex.exec(html)) !== null) {
    const tagName = match[1].toLowerCase();
    const isClosing = match[0].startsWith('</');
    
    if (selfClosing.has(tagName)) {
        continue;
    }
    
    if (isClosing) {
        if (stack.length === 0) {
            console.error(`Error: Found closing tag </${tagName}> but stack is empty`);
            hasError = true;
        } else {
            const lastTag = stack.pop();
            if (lastTag !== tagName) {
                console.error(`Error: Mismatch! Expected </${lastTag}> but found </${tagName}>`);
                hasError = true;
            }
        }
    } else {
        stack.push(tagName);
    }
}

if (stack.length > 0) {
    console.error("Error: The following tags were never closed:", stack);
    hasError = true;
}

if (!hasError) {
    console.log("No unclosed HTML tags found in services.html.");
}
