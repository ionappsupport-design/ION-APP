const fs = require('fs');
const path = require('path');

const replacements = [
  // Backgrounds
  { search: /\bbg-slate-50(?! dark:)\b/g, replace: 'bg-slate-50 dark:bg-slate-900' },
  { search: /\bbg-white(?!(\/| dark:))\b/g, replace: 'bg-white dark:bg-slate-800' },
  { search: /\bbg-white\/90(?! dark:)\b/g, replace: 'bg-white/90 dark:bg-slate-900/90' },
  { search: /\bbg-white\/80(?! dark:)\b/g, replace: 'bg-white/80 dark:bg-slate-900/80' },
  { search: /\bbg-white\/60(?! dark:)\b/g, replace: 'bg-white/60 dark:bg-slate-900/60' },
  { search: /\bbg-slate-100(?! dark:)\b/g, replace: 'bg-slate-100 dark:bg-slate-800/60' },
  { search: /\bbg-slate-200(?! dark:)\b/g, replace: 'bg-slate-200 dark:bg-slate-700' },
  
  // Texts
  { search: /\btext-slate-900(?! dark:)\b/g, replace: 'text-slate-900 dark:text-white' },
  { search: /\btext-slate-800(?! dark:)\b/g, replace: 'text-slate-800 dark:text-slate-200' },
  { search: /\btext-slate-700(?! dark:)\b/g, replace: 'text-slate-700 dark:text-slate-300' },
  { search: /\btext-slate-600(?! dark:)\b/g, replace: 'text-slate-600 dark:text-slate-300' },
  { search: /\btext-slate-500(?! dark:)\b/g, replace: 'text-slate-500 dark:text-slate-400' },
  { search: /\btext-slate-400(?! dark:)\b/g, replace: 'text-slate-400 dark:text-slate-500' },
  
  // Borders
  { search: /\bborder-slate-100(?! dark:)\b/g, replace: 'border-slate-100 dark:border-slate-800' },
  { search: /\bborder-slate-200(?!(\/| dark:))\b/g, replace: 'border-slate-200 dark:border-slate-700' },
  { search: /\bborder-slate-200\/50(?! dark:)\b/g, replace: 'border-slate-200/50 dark:border-slate-700/50' },
  { search: /\bborder-slate-300(?! dark:)\b/g, replace: 'border-slate-300 dark:border-slate-600' },
  
  // Colored backgrounds
  { search: /\bbg-blue-50(?! dark:)\b/g, replace: 'bg-blue-50 dark:bg-blue-950/40' },
  { search: /\bbg-blue-100(?!(\/| dark:))\b/g, replace: 'bg-blue-100 dark:bg-blue-900/40' },
  { search: /\bbg-emerald-50(?! dark:)\b/g, replace: 'bg-emerald-50 dark:bg-emerald-950/40' },
  { search: /\bbg-emerald-100(?! dark:)\b/g, replace: 'bg-emerald-100 dark:bg-emerald-900/40' },
  { search: /\bbg-rose-50(?! dark:)\b/g, replace: 'bg-rose-50 dark:bg-rose-950/40' },
  { search: /\bbg-rose-100(?! dark:)\b/g, replace: 'bg-rose-100 dark:bg-rose-900/40' },
  
  // Colored text
  { search: /\btext-blue-800(?! dark:)\b/g, replace: 'text-blue-800 dark:text-blue-200' },
  { search: /\btext-blue-700(?! dark:)\b/g, replace: 'text-blue-700 dark:text-blue-300' },
  { search: /\btext-blue-600(?! dark:)\b/g, replace: 'text-blue-600 dark:text-blue-400' },
  { search: /\btext-emerald-800(?! dark:)\b/g, replace: 'text-emerald-800 dark:text-emerald-200' },
  { search: /\btext-emerald-700(?! dark:)\b/g, replace: 'text-emerald-700 dark:text-emerald-300' },
  { search: /\btext-emerald-600(?! dark:)\b/g, replace: 'text-emerald-600 dark:text-emerald-400' },
  { search: /\btext-rose-800(?! dark:)\b/g, replace: 'text-rose-800 dark:text-rose-200' },
  { search: /\btext-rose-700(?! dark:)\b/g, replace: 'text-rose-700 dark:text-rose-300' },
  { search: /\btext-rose-600(?! dark:)\b/g, replace: 'text-rose-600 dark:text-rose-400' },
  
  // Colored borders
  { search: /\bborder-blue-100(?! dark:)\b/g, replace: 'border-blue-100 dark:border-blue-500/20' },
  { search: /\bborder-blue-200(?! dark:)\b/g, replace: 'border-blue-200 dark:border-blue-500/30' },
  { search: /\bborder-emerald-100(?! dark:)\b/g, replace: 'border-emerald-100 dark:border-emerald-500/20' },
  { search: /\bborder-emerald-200(?! dark:)\b/g, replace: 'border-emerald-200 dark:border-emerald-500/30' },
  { search: /\bborder-rose-100(?! dark:)\b/g, replace: 'border-rose-100 dark:border-rose-500/20' },
  { search: /\bborder-rose-200(?! dark:)\b/g, replace: 'border-rose-200 dark:border-rose-500/30' }
];

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

const allFiles = walkDir(path.join(process.cwd(), 'src/components'));

allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  replacements.forEach(rep => {
    content = content.replace(rep.search, rep.replace);
  });
  
  if (content !== originalContent) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Processed ${path.basename(file)}`);
  }
});

console.log('Done.');
