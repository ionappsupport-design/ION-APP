import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  "onStartScan={() => {\n              logAnalyticsEvent('scan_started');\n              setCurrentTab('scan');\n            }}",
  `onStartScan={async () => {
              logAnalyticsEvent('scan_started');
              setCurrentTab('scan');
              
              const { isNativeAvailable } = await checkNativePlatform();
              if (isNativeAvailable) {
                const granted = await requestNativeStoragePermissions();
                if (granted) {
                  try {
                    const scanned = await scanNativeDirectories();
                    updateFiles(scanned);
                  } catch (e) {
                    console.error("Native scan failed:", e);
                  }
                } else {
                  console.warn("Storage permission denied");
                  // You might want to show a UI state here
                }
              } else {
                console.log("Not on native, user must use 'Select Local Device Folder'");
              }
            }}`
);

content = `import { checkNativePlatform, requestNativeStoragePermissions, scanNativeDirectories } from './services/nativeStorageBridge';\n` + content;

fs.writeFileSync('src/App.tsx', content);
