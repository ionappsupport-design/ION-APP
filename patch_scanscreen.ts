import fs from 'fs';

let content = fs.readFileSync('src/components/ScanScreen.tsx', 'utf8');

// Update Interface
content = content.replace(
  "interface ScanScreenProps {\n  files: ScannedFile[];",
  "interface ScanScreenProps {\n  isNativeScanning?: boolean;\n  files: ScannedFile[];"
);

content = content.replace(
  "export const ScanScreen: React.FC<ScanScreenProps> = ({\n  files,\n  storageOverview,",
  "export const ScanScreen: React.FC<ScanScreenProps> = ({\n  isNativeScanning = false,\n  files,\n  storageOverview,"
);

// Update Simulation logic to respect isNativeScanning
content = content.replace(
  "useEffect(() => {\n    const timer = startScanSimulation();\n    return () => clearInterval(timer);\n  }, []);",
  `useEffect(() => {
    let timer: any;
    if (isNativeScanning) {
      setIsScanning(true);
      // For native, just loop indeterminate progress visually while we wait for App.tsx to drop isNativeScanning
      let currentProgress = 0;
      timer = setInterval(() => {
        currentProgress = (currentProgress + 2) % 100;
        setProgress(currentProgress);
        
        const pathIndex = Math.floor((currentProgress / 100) * REALISTIC_SCAN_PATHS.length) % REALISTIC_SCAN_PATHS.length;
        setCurrentFilePath(REALISTIC_SCAN_PATHS[pathIndex]);
        setScannedIndex(Math.floor((currentProgress / 100) * TOTAL_INDEXED_FILES));
      }, 100);
    } else if (files.length === 0) {
      // Fake browser scan simulation
      timer = startScanSimulation();
    } else {
      // Already have files (browser re-entering tab)
      setIsScanning(false);
      setProgress(100);
    }
    return () => clearInterval(timer);
  }, []);

  // Listen for native scan completion
  useEffect(() => {
    if (isNativeScanning === false && files.length > 0) {
      setIsScanning(false);
      setProgress(100);
      onScanCompleted();
    }
  }, [isNativeScanning]);`
);

fs.writeFileSync('src/components/ScanScreen.tsx', content);
