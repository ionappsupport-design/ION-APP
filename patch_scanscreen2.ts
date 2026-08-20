import fs from 'fs';

let content = fs.readFileSync('src/components/ScanScreen.tsx', 'utf8');

content = content.replace(
  `} else if (files.length === 0) {\n      // Fake browser scan simulation\n      timer = startScanSimulation();\n    } else {`,
  `} else if (files.length === 0) {
      const isNative = window.Capacitor && window.Capacitor.isNative;
      if (!isNative) {
        // Fake browser scan simulation ONLY in web preview
        timer = startScanSimulation();
      } else {
        // Native scan completed but found 0 files (or permission denied)
        setIsScanning(false);
        setProgress(100);
      }
    } else {`
);

fs.writeFileSync('src/components/ScanScreen.tsx', content);
