import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const sourceFile = path.join(rootDir, 'android/patches/BannerExecutor.java');
const targetFile = path.join(
  rootDir,
  'node_modules/@capacitor-community/admob/android/src/main/java/com/getcapacitor/community/admob/banner/BannerExecutor.java'
);

if (fs.existsSync(sourceFile) && fs.existsSync(path.dirname(targetFile))) {
  fs.copyFileSync(sourceFile, targetFile);
  console.log('Successfully applied AdMob BannerExecutor null-safety patch.');
} else {
  console.log('AdMob module not found or patch missing, skipping patch application.');
}
