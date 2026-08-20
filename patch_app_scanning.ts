import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add isNativeScanning state
content = content.replace(
  "const [files, setFiles] = useState<ScannedFile[]>",
  "const [isNativeScanning, setIsNativeScanning] = useState(false);\n  const [files, setFiles] = useState<ScannedFile[]>"
);

// Update onStartScan
content = content.replace(
  /onStartScan=\{async \(\) => \{[\s\S]*?console\.log\("Not on native, user must use 'Select Local Device Folder'"\);\n\s*\}\n\s*\}\}/,
  `onStartScan={async () => {
              logAnalyticsEvent('scan_started');
              setCurrentTab('scan');
              
              const { isNativeAvailable } = await checkNativePlatform();
              if (isNativeAvailable) {
                setIsNativeScanning(true);
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
                }
                setIsNativeScanning(false);
              } else {
                console.log("Not on native, user must use 'Select Local Device Folder'");
              }
            }}`
);

content = content.replace(
  "<ScanScreen\n            files={files}\n            storageOverview={storageOverview}",
  "<ScanScreen\n            isNativeScanning={isNativeScanning}\n            files={files}\n            storageOverview={storageOverview}"
);

fs.writeFileSync('src/App.tsx', content);
