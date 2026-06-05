const fs = require('fs');
const html = fs.readFileSync('c:/MY PROJECTS/Adzio/services.html', 'utf8');

const idRegex = /id="([^"]+)"/g;
let match;
const ids = new Map();

while ((match = idRegex.exec(html)) !== null) {
    const id = match[1];
    if (ids.has(id)) {
        ids.set(id, ids.get(id) + 1);
    } else {
        ids.set(id, 1);
    }
}

let hasDuplicates = false;
for (const [id, count] of ids.entries()) {
    if (count > 1) {
        console.error(`Error: Duplicate ID "${id}" found ${count} times`);
        hasDuplicates = true;
    }
}

if (!hasDuplicates) {
    console.log("No duplicate IDs found in services.html.");
}
