import fs from 'fs';

let content = fs.readFileSync('src/components/ScanScreen.tsx', 'utf8');

content = content.replace(
  "import { ScannedFile, StorageOverview } from '../types';",
  "import { ScannedFile, StorageOverview } from '../types';\nimport { Capacitor } from '@capacitor/core';"
);

content = content.replace(
  "const isNative = window.Capacitor && window.Capacitor.isNative;",
  "const isNative = Capacitor.isNative;"
);

fs.writeFileSync('src/components/ScanScreen.tsx', content);
