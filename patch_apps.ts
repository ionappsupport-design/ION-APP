import fs from 'fs';

let content = fs.readFileSync('src/components/AppManagerScreen.tsx', 'utf8');

// Replace INITIAL_APPS array with empty array
content = content.replace(/const INITIAL_APPS: InstalledApp\[\] = \[[\s\S]*?\];/m, 'const INITIAL_APPS: InstalledApp[] = [];');

// Add restriction message
content = content.replace(
  '{apps.map((app) => (',
  `{apps.length === 0 && (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl mt-4">
            <ShieldCheck className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Android Privacy Restrictions</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Google Play policies and Android 11+ scoped storage restrict broad access to other installed applications (QUERY_ALL_PACKAGES). ION respects your privacy and does not circumvent these OS-level sandbox limits.
            </p>
          </div>
        )}
        {apps.map((app) => (`
);

fs.writeFileSync('src/components/AppManagerScreen.tsx', content);
