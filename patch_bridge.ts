import fs from 'fs';

let content = fs.readFileSync('src/services/nativeStorageBridge.ts', 'utf8');

content = content.replace(
  /export async function scanNativeDirectories.*?return scannedFiles;\n}/s,
  `export async function scanNativeDirectories(): Promise<ScannedFile[]> {
  const scannedFiles: ScannedFile[] = [];
  
  // Public directories typically accessible with READ_EXTERNAL_STORAGE on Android
  const targetDirectories = [
    { dir: Directory.Documents, name: 'Documents' },
    { dir: Directory.External, name: 'External' }, // Maps to app-specific external or public depending on Capacitor config
    { dir: Directory.Cache, name: 'Cache' },
  ];

  // Also scan known public folders if we can reach them from ExternalStorage
  // In Capacitor, Directory.ExternalStorage is the root of external storage.
  const publicFolders = ['Download', 'DCIM', 'Pictures', 'Movies', 'Music'];
  
  const scanDir = async (directory: any, path: string, sourceName: string, depth = 0) => {
    if (depth > 4) return; // Prevent infinite recursion/too deep
    try {
      const result = await Filesystem.readdir({
        directory,
        path,
      });
      
      if (result.files) {
        for (const fileInfo of result.files) {
          // In Capacitor v6+, fileInfo is an object. In older versions, it might be a string.
          const isString = typeof fileInfo === 'string';
          const fileName = isString ? fileInfo : fileInfo.name;
          const isDir = isString ? false : fileInfo.type === 'directory';
          const subPath = path ? \`\${path}/\${fileName}\` : fileName;
          
          if (isDir) {
            await scanDir(directory, subPath, sourceName, depth + 1);
            continue;
          }

          const ext = fileName.split('.').pop()?.toLowerCase() || '';
          
          let category: ScannedFile['category'] = 'document';
          let isJunk = false;
          let junkType: ScannedFile['junkType'] = undefined;

          if (['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(ext)) {
            category = fileName.toLowerCase().includes('screenshot') ? 'screenshot' : 'image';
          } else if (['mp4', 'mkv', 'mov', 'avi', '3gp'].includes(ext)) {
            category = 'video';
          } else if (['mp3', 'aac', 'wav', 'flac', 'm4a'].includes(ext)) {
            category = 'audio';
          } else if (['tmp', 'temp', 'cache', 'log', 'bak'].includes(ext) || sourceName === 'Cache') {
            category = 'cache';
            isJunk = true;
            junkType = 'system_cache';
          } else if (['apk', 'xapk'].includes(ext)) {
            category = 'junk';
            isJunk = true;
            junkType = 'app_residual';
          }

          let size = isString ? 1024 * 1024 * 5 : (fileInfo.size || 1024 * 1024 * 5);
          let mtime = isString ? Date.now() : (fileInfo.mtime || Date.now());
          let uri = isString ? undefined : fileInfo.uri;

          // If size or uri is missing, try stat
          if (isString || !fileInfo.size || !fileInfo.uri) {
            try {
              const stat = await Filesystem.stat({
                directory,
                path: subPath,
              });
              size = stat.size || size;
              mtime = stat.mtime || mtime;
              uri = stat.uri || uri;
            } catch {
              // Ignore
            }
          }

          scannedFiles.push({
            id: \`native_\${sourceName}_\${fileName}_\${Date.now()}_\${Math.random().toString(36).substring(2,6)}\`,
            name: fileName,
            size,
            path: subPath, // relative path within the directory enum
            source: 'native',
            nativeUri: uri,
            capacitorDirectory: directory,
            category,
            mimeType: 'application/octet-stream',
            lastModified: mtime,
            securityStatus: 'safe',
            isJunk,
            junkType,
            selected: isJunk,
          });
        }
      }
    } catch (e) {
      console.log(\`Directory read skipped or protected (\${sourceName}/\${path}):\`, e);
    }
  };

  for (const target of targetDirectories) {
    await scanDir(target.dir, '', target.name);
  }
  
  for (const folder of publicFolders) {
    await scanDir(Directory.ExternalStorage, folder, folder);
  }

  return scannedFiles;
}`
);

fs.writeFileSync('src/services/nativeStorageBridge.ts', content);
