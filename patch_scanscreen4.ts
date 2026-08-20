import fs from 'fs';

let content = fs.readFileSync('src/components/ScanScreen.tsx', 'utf8');

content = content.replace(
  `useEffect(() => {\n    if (isNativeScanning === false && files.length > 0) {\n      setIsScanning(false);\n      setProgress(100);\n      onScanCompleted();\n    }\n  }, [isNativeScanning]);`,
  `useEffect(() => {
    // Only trigger completion if we were natively scanning and now stopped
    if (Capacitor.isNative && isNativeScanning === false) {
      setIsScanning(false);
      setProgress(100);
      // Wait a tick to allow state to settle
      setTimeout(() => onScanCompleted(), 100);
    }
  }, [isNativeScanning]);`
);

fs.writeFileSync('src/components/ScanScreen.tsx', content);
