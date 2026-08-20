import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  `onStartScan={async () => {
              logAnalyticsEvent('scan_started');
              setCurrentTab('scan');
              
              const { isNativeAvailable } = await checkNativePlatform();
              if (isNativeAvailable) {
                setIsNativeScanning(true);`,
  `onStartScan={async () => {
              logAnalyticsEvent('scan_started');
              
              const { isNativeAvailable } = await checkNativePlatform();
              if (isNativeAvailable) {
                setIsNativeScanning(true);
                setCurrentTab('scan');`
);

fs.writeFileSync('src/App.tsx', content);
