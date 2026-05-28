const fs = require('fs');
const path = require('path');

function processDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (!content.match(/import\s+React/)) {
                content = "import React from 'react';\n" + content;
                fs.writeFileSync(fullPath, content);
                console.log('Added React to ' + fullPath);
            }
        }
    }
}

processDir(path.join(__dirname, 'src', 'components'));
processDir(path.join(__dirname, 'src', 'pages'));
console.log('Done.');
