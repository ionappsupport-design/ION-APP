import fs from 'fs';

let content = fs.readFileSync('src/components/BackupBeforeDeleteModal.tsx', 'utf8');

// Replace handleStartCloudBackup logic
content = content.replace(
  "const handleStartCloudBackup = () => {\n    setIsBackingUp(true);\n    let p = 0;\n    const interval = setInterval(() => {\n      p += 15;\n      if (p >= 100) {\n        clearInterval(interval);\n        setBackupProgress(100);\n        setTimeout(() => {\n          onConfirmBackupAndDelete();\n        }, 500);\n      } else {\n        setBackupProgress(p);\n      }\n    }, 150);\n  };",
  "const handleStartLocalBackup = async () => {\n    setIsBackingUp(true);\n    // Real local backup happens sequentially in App.tsx executeClean.\n    // Here we just show a brief UI transition.\n    setBackupProgress(100);\n    setTimeout(() => {\n      onConfirmBackupAndDelete();\n    }, 400);\n  };"
);

// Replace "Google Drive" badge
content = content.replace(
  '<motion.div\n            animate={{ y: [-4, -18, -4], opacity: [0.6, 1, 0.6] }}\n            transition={{ repeat: Infinity, duration: 2.4 }}\n            className="absolute -top-1 -right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md z-20"\n          >\n            Google Drive\n          </motion.div>',
  '<motion.div\n            animate={{ y: [-4, -18, -4], opacity: [0.6, 1, 0.6] }}\n            transition={{ repeat: Infinity, duration: 2.4 }}\n            className="absolute -top-1 -right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md z-20"\n          >\n            Secure Bin\n          </motion.div>'
);

// Replace "Back up your files to Google Drive before deleting?"
content = content.replace(
  'Back up your files to Google Drive before deleting?',
  'Back up files to Secure Local Bin before deleting?'
);

// Replace the connected Google Drive Account Card with an info box
content = content.replace(
  /<div className="w-full bg-slate-50 dark:bg-slate-800\/80 rounded-2xl p-3\.5 border border-slate-200\/80 dark:border-slate-700 flex items-center justify-between mt-2">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/,
  `<div className="w-full bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between mt-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-2 shadow-xs">
              <HardDrive className="w-6 h-6 text-slate-500" />
            </div>
            <div className="text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Local Storage</span>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Encrypted Recycle Bin
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>`
);

content = content.replace('Uploading to cloud backup...', 'Copying to secure bin...');
content = content.replace('onClick={handleStartCloudBackup}', 'onClick={handleStartLocalBackup}');

fs.writeFileSync('src/components/BackupBeforeDeleteModal.tsx', content);
