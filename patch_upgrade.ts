import fs from 'fs';

let content = fs.readFileSync('src/components/UpgradeModal.tsx', 'utf8');

content = content.replace(
  "setTimeout(() => {\n      setIsProcessing(false);\n      onUpgradeSuccess();\n      onClose();\n    }, 1200);",
  "setTimeout(() => {\n      setIsProcessing(false);\n      alert('Google Play Billing integration is required for production deployment. Mock purchases are disabled.');\n    }, 1200);"
);

fs.writeFileSync('src/components/UpgradeModal.tsx', content);
