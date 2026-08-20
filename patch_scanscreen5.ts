import fs from 'fs';

let content = fs.readFileSync('src/components/ScanScreen.tsx', 'utf8');

content = content.replace(
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
      const isNative = Capacitor.isNative;
      if (!isNative) {
        // Fake browser scan simulation ONLY in web preview
        timer = startScanSimulation();
      } else {
        // Native scan completed but found 0 files (or permission denied)
        setIsScanning(false);
        setProgress(100);
      }
    } else {
      // Already have files (browser re-entering tab)
      setIsScanning(false);
      setProgress(100);
    }
    return () => clearInterval(timer);
  }, []);`,
  `useEffect(() => {
    let timer: any;
    
    if (Capacitor.isNative) {
      if (isNativeScanning) {
        setIsScanning(true);
        let currentProgress = 0;
        timer = setInterval(() => {
          currentProgress = (currentProgress + 2) % 100;
          setProgress(currentProgress);
          
          const pathIndex = Math.floor((currentProgress / 100) * REALISTIC_SCAN_PATHS.length) % REALISTIC_SCAN_PATHS.length;
          setCurrentFilePath(REALISTIC_SCAN_PATHS[pathIndex]);
          setScannedIndex(Math.floor((currentProgress / 100) * TOTAL_INDEXED_FILES));
        }, 100);
      }
    } else {
       if (files.length === 0) {
         timer = startScanSimulation();
       } else {
         setIsScanning(false);
         setProgress(100);
       }
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isNativeScanning]);`
);

fs.writeFileSync('src/components/ScanScreen.tsx', content);
