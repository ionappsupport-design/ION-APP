import fs from 'fs';

let content = fs.readFileSync('src/components/ScanScreen.tsx', 'utf8');

content = content.replace(
  "if (Capacitor.isNative) {",
  "if (Capacitor.getPlatform() !== 'web') {"
);

content = content.replace(
  "if (Capacitor.isNative && isNativeScanning === false) {",
  "if (Capacitor.getPlatform() !== 'web' && isNativeScanning === false) {"
);

fs.writeFileSync('src/components/ScanScreen.tsx', content);
