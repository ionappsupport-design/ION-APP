const fs = require('fs');
const path = require('path');

function walkDir(dir) {
    let files = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            files = files.concat(walkDir(file));
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                files.push(file);
            }
        }
    });
    return files;
}

const allFiles = walkDir(path.join(__dirname, 'src'));
let totalReplaced = 0;

for (const file of allFiles) {
    let content = fs.readFileSync(file, 'utf8');
    // Match dark: followed by word characters, dashes, brackets, slashes etc.
    // e.g. dark:bg-slate-900, dark:border-slate-800/80, dark:hover:bg-slate-800
    // A robust regex for tailwind classes starting with dark:
    const regex = /dark:[a-zA-Z0-9\-/_\[\]#]+/g;
    
    if (regex.test(content)) {
        const newContent = content.replace(regex, '').replace(/  +/g, ' '); // also clean up double spaces
        fs.writeFileSync(file, newContent, 'utf8');
        totalReplaced++;
        console.log(`Stripped dark classes from: ${path.basename(file)}`);
    }
}

console.log(`Done. Processed ${allFiles.length} files, modified ${totalReplaced} files.`);
