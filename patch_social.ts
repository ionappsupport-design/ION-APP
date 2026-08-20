import fs from 'fs';

let content = fs.readFileSync('src/components/SocialCleanerScreen.tsx', 'utf8');

// Replace whatsappCategories and telegramCategories sizes/counts with 0
content = content.replace(/count: \d+,/g, 'count: 0,');
content = content.replace(/sizeBytes: [\d\.\* ]+,/g, 'sizeBytes: 0,');

// Add info banner
content = content.replace(
  '<div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 flex flex-col items-center justify-center shrink-0 border-b border-emerald-100 dark:border-emerald-900/30">',
  `<div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 flex flex-col items-center justify-center shrink-0 border-b border-emerald-100 dark:border-emerald-900/30">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 rounded-xl mb-4 text-xs text-amber-800 dark:text-amber-400 font-medium text-center">
          Android 11+ Scoped Storage prevents direct background scanning of external app media folders. Select the WhatsApp folder manually via the Dashboard to analyze media.
        </div>`
);

fs.writeFileSync('src/components/SocialCleanerScreen.tsx', content);
