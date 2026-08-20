const fs = require('fs');
const path = require('path');

const replacements = [
  { search: /\bbg-slate-900\b/g, replace: 'bg-slate-50' },
  { search: /\bbg-slate-950\/80\b/g, replace: 'bg-white/90' },
  { search: /\bbg-slate-950\b/g, replace: 'bg-white' },
  { search: /\bbg-slate-800\/80\b/g, replace: 'bg-slate-100' },
  { search: /\bbg-slate-800\/70\b/g, replace: 'bg-white' },
  { search: /\bbg-slate-800\/60\b/g, replace: 'bg-white' },
  { search: /\bbg-slate-800\b/g, replace: 'bg-white' },
  { search: /\bbg-slate-900\/80\b/g, replace: 'bg-slate-100' },
  { search: /\bbg-slate-900\/60\b/g, replace: 'bg-slate-100' },
  
  { search: /\btext-white\b/g, replace: 'text-slate-900' },
  { search: /\btext-slate-100\b/g, replace: 'text-slate-900' },
  { search: /\btext-slate-300\b/g, replace: 'text-slate-600' },
  { search: /\btext-slate-400\b/g, replace: 'text-slate-500' },
  
  { search: /\bborder-slate-800\b/g, replace: 'border-slate-200' },
  { search: /\bborder-slate-700\/60\b/g, replace: 'border-slate-200' },
  { search: /\bborder-slate-700\b/g, replace: 'border-slate-200' },
  
  { search: /\bbg-blue-950\/40\b/g, replace: 'bg-blue-50' },
  { search: /\bborder-blue-500\/30\b/g, replace: 'border-blue-200' },
  { search: /\btext-blue-200\b/g, replace: 'text-blue-800' },
  { search: /\btext-blue-300\b/g, replace: 'text-blue-700' },
  { search: /\btext-blue-400\b/g, replace: 'text-blue-600' },
  
  { search: /\bbg-emerald-950\/40\b/g, replace: 'bg-emerald-50' },
  { search: /\bbg-emerald-950\/60\b/g, replace: 'bg-emerald-50' },
  { search: /\bborder-emerald-500\/30\b/g, replace: 'border-emerald-200' },
  { search: /\bborder-emerald-500\/40\b/g, replace: 'border-emerald-200' },
  { search: /\btext-emerald-200\b/g, replace: 'text-emerald-800' },
  { search: /\btext-emerald-300\b/g, replace: 'text-emerald-700' },
  { search: /\btext-emerald-400\b/g, replace: 'text-emerald-600' },
  
  { search: /\bbg-purple-950\/30\b/g, replace: 'bg-purple-50' },
  { search: /\btext-purple-200\b/g, replace: 'text-purple-800' },
  { search: /\btext-cyan-400\b/g, replace: 'text-cyan-600' },
  
  { search: /\btext-rose-300\b/g, replace: 'text-rose-600' },
  { search: /\btext-rose-400\b/g, replace: 'text-rose-600' },
  { search: /\bbg-rose-500\/20\b/g, replace: 'bg-rose-100' },
  { search: /\bbg-rose-500\/30\b/g, replace: 'bg-rose-200' },
  { search: /\bborder-rose-500\/30\b/g, replace: 'border-rose-200' }
];

const files = [
  'src/components/RecycleBinScreen.tsx',
  'src/components/VideoCompressorScreen.tsx',
  'src/components/SocialCleanerScreen.tsx'
];

files.forEach(file => {
  const filePath = path.join('/Users/aditya/Desktop/ion---clean-storage-&-speed 2', file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  replacements.forEach(rep => {
    content = content.replace(rep.search, rep.replace);
  });
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Processed ${file}`);
});
