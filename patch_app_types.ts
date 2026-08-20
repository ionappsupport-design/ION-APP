import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  "const restoredFile: ScannedFile = {\n        id: restoredItem.fileId,\n        name: restoredItem.name,\n        size: restoredItem.size,\n        path: restoredItem.path,\n        category: restoredItem.category,\n        mimeType: restoredItem.mimeType,\n        lastModified: Date.now(),\n        securityStatus: 'safe',\n      };",
  `const restoredFile: ScannedFile = {
        id: restoredItem.fileId,
        name: restoredItem.name,
        size: restoredItem.size,
        path: restoredItem.path,
        source: 'browser',
        category: restoredItem.category,
        mimeType: restoredItem.mimeType,
        lastModified: Date.now(),
        securityStatus: 'safe',
      };`
);

content = content.replace(
  "const restoredFiles: ScannedFile[] = items.map(item => ({\n      id: item.fileId,\n      name: item.name,\n      size: item.size,\n      path: item.path,\n      category: item.category,\n      mimeType: item.mimeType,\n      lastModified: Date.now(),\n      securityStatus: 'safe',\n    }));",
  `const restoredFiles: ScannedFile[] = items.map(item => ({
      id: item.fileId,
      name: item.name,
      size: item.size,
      path: item.path,
      source: 'browser',
      category: item.category,
      mimeType: item.mimeType,
      lastModified: Date.now(),
      securityStatus: 'safe',
    }));`
);

fs.writeFileSync('src/App.tsx', content);
