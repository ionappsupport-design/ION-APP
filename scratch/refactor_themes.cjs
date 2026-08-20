const fs = require('fs');
const path = require('path');

const replacements = [
  // Backgrounds
  { search: /\bbg-slate-900(?!\/)(?!.*dark:bg-slate-900)/g, replace: 'bg-slate-50 dark:bg-slate-900' },
  { search: /\bbg-slate-950\/80(?!.*dark:bg-slate-950\/80)/g, replace: 'bg-white/90 dark:bg-slate-950/80' },
  { search: /\bbg-slate-950(?!\/)(?!.*dark:bg-slate-950)/g, replace: 'bg-white dark:bg-slate-950' },
  { search: /\bbg-slate-800\/80(?!.*dark:bg-slate-800\/80)/g, replace: 'bg-slate-100 dark:bg-slate-800/80' },
  { search: /\bbg-slate-800\/70(?!.*dark:bg-slate-800\/70)/g, replace: 'bg-white dark:bg-slate-800/70' },
  { search: /\bbg-slate-800\/60(?!.*dark:bg-slate-800\/60)/g, replace: 'bg-white dark:bg-slate-800/60' },
  { search: /\bbg-slate-800(?!\/)(?!.*dark:bg-slate-800)/g, replace: 'bg-white dark:bg-slate-800' },
  { search: /\bbg-slate-900\/80(?!.*dark:bg-slate-900\/80)/g, replace: 'bg-slate-100 dark:bg-slate-900/80' },
  { search: /\bbg-slate-900\/60(?!.*dark:bg-slate-900\/60)/g, replace: 'bg-slate-100 dark:bg-slate-900/60' },
  
  // Text
  { search: /\btext-white(?!\/)(?!.*dark:text-white)/g, replace: 'text-slate-900 dark:text-white' },
  { search: /\btext-slate-100(?!\/)(?!.*dark:text-slate-100)/g, replace: 'text-slate-900 dark:text-slate-100' },
  { search: /\btext-slate-300(?!\/)(?!.*dark:text-slate-300)/g, replace: 'text-slate-600 dark:text-slate-300' },
  { search: /\btext-slate-400(?!\/)(?!.*dark:text-slate-400)/g, replace: 'text-slate-500 dark:text-slate-400' },
  
  // Borders
  { search: /\bborder-slate-800(?!\/)(?!.*dark:border-slate-800)/g, replace: 'border-slate-200 dark:border-slate-800' },
  { search: /\bborder-slate-700\/60(?!.*dark:border-slate-700\/60)/g, replace: 'border-slate-200 dark:border-slate-700/60' },
  { search: /\bborder-slate-700(?!\/)(?!.*dark:border-slate-700)/g, replace: 'border-slate-200 dark:border-slate-700' },
  
  // Colored backgrounds
  { search: /\bbg-blue-950\/40(?!.*dark:bg-blue-950\/40)/g, replace: 'bg-blue-50 dark:bg-blue-950/40' },
  { search: /\bbg-emerald-950\/40(?!.*dark:bg-emerald-950\/40)/g, replace: 'bg-emerald-50 dark:bg-emerald-950/40' },
  { search: /\bbg-emerald-950\/60(?!.*dark:bg-emerald-950\/60)/g, replace: 'bg-emerald-50 dark:bg-emerald-950/60' },
  { search: /\bbg-purple-950\/30(?!.*dark:bg-purple-950\/30)/g, replace: 'bg-purple-50 dark:bg-purple-950/30' },
  { search: /\bbg-rose-500\/20(?!.*dark:bg-rose-500\/20)/g, replace: 'bg-rose-100 dark:bg-rose-500/20' },
  { search: /\bbg-rose-500\/30(?!.*dark:bg-rose-500\/30)/g, replace: 'bg-rose-200 dark:bg-rose-500/30' },

  // Colored borders
  { search: /\bborder-blue-500\/30(?!.*dark:border-blue-500\/30)/g, replace: 'border-blue-200 dark:border-blue-500/30' },
  { search: /\bborder-emerald-500\/30(?!.*dark:border-emerald-500\/30)/g, replace: 'border-emerald-200 dark:border-emerald-500/30' },
  { search: /\bborder-emerald-500\/40(?!.*dark:border-emerald-500\/40)/g, replace: 'border-emerald-200 dark:border-emerald-500/40' },
  { search: /\bborder-rose-500\/30(?!.*dark:border-rose-500\/30)/g, replace: 'border-rose-200 dark:border-rose-500/30' },

  // Colored text
  { search: /\btext-blue-200(?!\/)(?!.*dark:text-blue-200)/g, replace: 'text-blue-800 dark:text-blue-200' },
  { search: /\btext-blue-300(?!\/)(?!.*dark:text-blue-300)/g, replace: 'text-blue-700 dark:text-blue-300' },
  { search: /\btext-blue-400(?!\/)(?!.*dark:text-blue-400)/g, replace: 'text-blue-600 dark:text-blue-400' },
  { search: /\btext-emerald-200(?!\/)(?!.*dark:text-emerald-200)/g, replace: 'text-emerald-800 dark:text-emerald-200' },
  { search: /\btext-emerald-300(?!\/)(?!.*dark:text-emerald-300)/g, replace: 'text-emerald-700 dark:text-emerald-300' },
  { search: /\btext-emerald-400(?!\/)(?!.*dark:text-emerald-400)/g, replace: 'text-emerald-600 dark:text-emerald-400' },
  { search: /\btext-purple-200(?!\/)(?!.*dark:text-purple-200)/g, replace: 'text-purple-800 dark:text-purple-200' },
  { search: /\btext-cyan-400(?!\/)(?!.*dark:text-cyan-400)/g, replace: 'text-cyan-600 dark:text-cyan-400' },
  { search: /\btext-rose-300(?!\/)(?!.*dark:text-rose-300)/g, replace: 'text-rose-600 dark:text-rose-300' },
  { search: /\btext-rose-400(?!\/)(?!.*dark:text-rose-400)/g, replace: 'text-rose-600 dark:text-rose-400' }
];

const filesToProcess = [
  'src/components/RecycleBinScreen.tsx',
  'src/components/VideoCompressorScreen.tsx',
  'src/components/SocialCleanerScreen.tsx',
  'src/components/SplashScreen.tsx'
];

filesToProcess.forEach(relPath => {
  const file = path.join(process.cwd(), relPath);
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  replacements.forEach(rep => {
    content = content.replace(rep.search, rep.replace);
  });
  
  // Fix nested dark:dark: artifacts just in case
  content = content.replace(/dark:dark:/g, 'dark:');
  
  if (content !== originalContent) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Processed ${path.basename(file)}`);
  }
});

console.log('Done.');
