const fs = require('fs');
const css = fs.readFileSync('c:/MY PROJECTS/Adzio/css/services-page.css', 'utf8');

let braces = 0;
let lineNum = 1;
let colNum = 1;
let inString = false;
let stringChar = '';
let inComment = false;
let errors = [];

for (let i = 0; i < css.length; i++) {
    const char = css[i];
    const nextChar = css[i+1];
    
    if (char === '\n') {
        lineNum++;
        colNum = 1;
    } else {
        colNum++;
    }
    
    // Handle comments
    if (inComment) {
        if (char === '*' && nextChar === '/') {
            inComment = false;
            i++;
        }
        continue;
    } else if (char === '/' && nextChar === '*') {
        inComment = true;
        i++;
        continue;
    }
    
    // Handle strings
    if (inString) {
        if (char === stringChar && css[i-1] !== '\\') {
            inString = false;
        }
        continue;
    } else if (char === '"' || char === "'") {
        inString = true;
        stringChar = char;
        continue;
    }
    
    // Count braces
    if (char === '{') {
        braces++;
    } else if (char === '}') {
        braces--;
        if (braces < 0) {
            errors.push(`Extra closing brace '}' at line ${lineNum}, column ${colNum}`);
            braces = 0; // reset
        }
    }
}

if (braces > 0) {
    errors.push(`Unmatched opening braces: ${braces} unclosed '{' at the end of file`);
}

if (errors.length > 0) {
    console.error("Errors found in services-page.css:", errors);
} else {
    console.log("services-page.css braces are fully balanced.");
}
