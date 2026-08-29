import { registerPlugin, Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { ScannedFile, StorageOverview, DeviceSystemMetrics } from '../types';
import { groupDuplicateFiles } from './duplicateDetector';

export interface IonNativeStoragePluginInterface {
  getStorageOverview(): Promise<{
    totalBytes: number;
    usedBytes: number;
    availableBytes: number;
    isRealData: boolean;
    storageApiSource: 'android_native';
  }>;
  getSystemMetrics(): Promise<{
    ramTotalBytes: number;
    ramAvailableBytes: number;
    ramUsedBytes: number;
    ramUsagePercent: number;
    batteryLevel: number | null;
    isCharging: boolean;
    cpuCores: number;
    lowMemory: boolean;
    osVersion: string;
  }>;
  checkStoragePermissions(): Promise<{
    images: boolean;
    video: boolean;
    audio: boolean;
    granted: boolean;
    isTiramisu: boolean;
  }>;
  requestStoragePermissions(): Promise<{
    images: boolean;
    video: boolean;
    audio: boolean;
    granted: boolean;
    isTiramisu: boolean;
  }>;
  requestManageExternalStorage(): Promise<{ granted: boolean }>;
  scanSpecificFolder(options: { path: string }): Promise<{
    files: ScannedFile[];
    count: number;
  }>;
  scanMediaStore(options?: {
    imageLimit?: number;
    imageOffset?: number;
    videoLimit?: number;
    videoOffset?: number;
    audioLimit?: number;
    audioOffset?: number;
    documentLimit?: number;
    documentOffset?: number;
  }): Promise<{
    files: ScannedFile[];
    count: number;
    totalBytes: number;
    skippedCount: number;
    imageBytes: number;
    videoBytes: number;
    audioBytes: number;
    documentBytes: number;
  }>;
  deleteMediaItems(options: { uris: string[] }): Promise<{
    deletedCount: number;
    success: boolean;
    cancelled?: boolean;
  }>;
  deleteSafDocument(options: { documentUri: string }): Promise<{
    success: boolean;
    documentUri: string;
  }>;
  backupFile(options: { uri: string; fileName: string }): Promise<{
    success: boolean;
    backupPath: string;
    bytesCopied: number;
    checksumSha256: string;
  }>;
  openDocumentTree(options?: { initialUri?: string }): Promise<{
    treeUri?: string;
    cancelled: boolean;
  }>;
  scanDocumentTree(options: { treeUri: string; limit?: number; offset?: number }): Promise<{
    files: ScannedFile[];
    count: number;
    skippedCount: number;
    totalBytes: number;
  }>;
  restoreFile(options: { backupPath: string; originalName: string }): Promise<{
    success: boolean;
    restoredPath: string;
    fileName: string;
    size: number;
  }>;
  getFileHash(options: { uri: string }): Promise<{ hash: string }>;
  getBlurScore(options: { uri: string }): Promise<{ variance: number }>;
  getPerceptualHash(options: { uri: string }): Promise<{ hash: string }>;
  generateThumbnail(options: { uri: string }): Promise<{ thumbnail: string }>;
  deleteBackupFile(options: { backupPath: string }): Promise<{ success: boolean }>;
  scanInstalledApps(): Promise<{ apps: any[] }>;
  analyzeApkFile(options: { uri: string }): Promise<{ packageName: string; versionName: string; permissions: string[]; securityStatus: string }>;
  compressVideo(options: { uri: string; quality: 'low' | 'medium' | 'high' }): Promise<{
    success: boolean;
    compressedPath?: string;
    actualSize?: number;
    error?: string;
  }>;
  scheduleAutoClean(options: { intervalHours: number }): Promise<{ success: boolean }>;
}

export const IonNativeStorage = registerPlugin<IonNativeStoragePluginInterface>('IonNativeStorage');

export interface NativeStorageStatus {
  isNativeAvailable: boolean;
  platform: 'android' | 'ios' | 'web';
  hasManageStoragePermission: boolean;
}

/**
 * Check if the application is running in a native Android/iOS Capacitor environment
 */
export async function checkNativePlatform(): Promise<NativeStorageStatus> {
  try {
    const isNative = Capacitor.isNativePlatform();
    const info = await Device.getInfo();
    return {
      isNativeAvailable: isNative,
      platform: (info.platform as 'android' | 'ios' | 'web') || 'web',
      hasManageStoragePermission: isNative,
    };
  } catch {
    return {
      isNativeAvailable: false,
      platform: 'web',
      hasManageStoragePermission: false,
    };
  }
}

/**
 * Query real Android device storage capacity and availability (via StatFs on native)
 */
export async function getNativeStorageOverview(): Promise<StorageOverview | null> {
  try {
    if (!Capacitor.isNativePlatform()) {
      return null;
    }
    const res = await IonNativeStorage.getStorageOverview();
    const total = res.totalBytes || 64 * 1024 * 1024 * 1024;
    const used = res.usedBytes || 0;
    const available = res.availableBytes || (total - used);
    const percentage = Math.min(100, Math.round((used / total) * 100));

    return {
      totalBytes: total,
      usedBytes: used,
      availableBytes: available,
      usedPercentage: percentage,
      isRealData: true,
      storageApiSource: 'android_native',
    };
  } catch (error) {
    console.warn('Native storage overview query failed:', error);
    return null;
  }
}

/**
 * Query native Android device RAM, battery and system metrics
 */
export async function getNativeSystemMetrics(): Promise<Partial<DeviceSystemMetrics> | null> {
  try {
    if (!Capacitor.isNativePlatform()) {
      return null;
    }
    const res = await IonNativeStorage.getSystemMetrics();
    const totalGb = Number((res.ramTotalBytes / (1024 * 1024 * 1024)).toFixed(1));
    const availGb = Number((res.ramAvailableBytes / (1024 * 1024 * 1024)).toFixed(1));

    return {
      ramTotalGb: totalGb,
      ramAvailableGb: availGb,
      ramUsagePercent: res.ramUsagePercent,
      batteryLevel: res.batteryLevel,
      isCharging: res.isCharging,
      cpuCores: res.cpuCores,
      osVersion: res.osVersion,
      isNativeData: true,
    };
  } catch (error) {
    console.warn('Native system metrics query failed:', error);
    return null;
  }
}

/**
 * Request real Android storage permissions (Android 13+ READ_MEDIA_* or legacy READ_EXTERNAL_STORAGE)
 */
export async function requestNativeStoragePermissions(): Promise<boolean> {
  try {
    if (!Capacitor.isNativePlatform()) {
      return true;
    }
    const checkRes = await IonNativeStorage.checkStoragePermissions();
    let permissionsGranted = checkRes.granted || checkRes.images || checkRes.video || checkRes.audio || false;
    
    if (!permissionsGranted) {
       const res = await IonNativeStorage.requestStoragePermissions();
       permissionsGranted = res.granted || res.images || res.video || res.audio || false;
    }

    // MANAGE_EXTERNAL_STORAGE is critical for a cleaner app (access to Downloads, WhatsApp, Cache)
    // On Android 11+ (API 30+), we MUST wait for the user to grant this in Settings.
    try {
      const manageRes = await IonNativeStorage.requestManageExternalStorage();
      if (!manageRes.granted) {
        console.error("Manage External Storage was denied by the user. Hard blocking scan.");
        return false;
      }
      // If granted (or on Android 10 where it auto-resolves true), we have full access
      permissionsGranted = true;
    } catch (e) {
      console.warn('Manage external storage request failed', e);
      return false;
    }

    return permissionsGranted;
  } catch (error) {
    console.warn('Native storage permission request failed:', error);
    return false;
  }
}

/**
 * Scan MediaStore on Android
 * FIX: Screenshot tagging now happens AFTER large-file check to prevent override
 */
export async function scanNativeStorage(): Promise<{
  files: ScannedFile[];
  metrics: { imageBytes: number; videoBytes: number; audioBytes: number; documentBytes: number } | null;
}> {
  if (!Capacitor.isNativePlatform()) {
    return { files: [], metrics: null };
  }

  const allFiles: ScannedFile[] = [];
  let metrics = { imageBytes: 0, videoBytes: 0, audioBytes: 0, documentBytes: 0 };

  try {
    // SPEED FIX: Limit file counts so scan completes in <3s
    const mediaResult = await IonNativeStorage.scanMediaStore({
      imageLimit: 300,
      videoLimit: 100,
      audioLimit: 100,
      documentLimit: 200,
    });

    if (mediaResult && mediaResult.files && mediaResult.files.length > 0) {
      for (const file of mediaResult.files) {
        let category = file.category;
        let isJunk = file.isJunk || false;

        file.size = Number(file.size) || 0;

        // Large file check FIRST
        if (file.size > 50 * 1024 * 1024) {
          category = 'large';
        }

        const lowPath = file.path.toLowerCase();
        // Screenshot check AFTER large
        if (category !== 'large' &&
            (lowPath.includes('screenshot') || lowPath.includes('screenshots'))) {
          category = 'screenshot';
        }

        // Social Media Tagging
        let socialApp: 'WhatsApp' | 'Telegram' | 'Instagram' | undefined = undefined;
        let socialCategory: 'sent' | 'received' | 'status' | 'voice' | 'sticker' | 'database' | undefined = undefined;

        if (lowPath.includes('whatsapp')) {
          socialApp = 'WhatsApp';
          if (lowPath.includes('/sent/')) socialCategory = 'sent';
          else if (lowPath.includes('/statuses/') || lowPath.includes('.statuses/')) socialCategory = 'status';
          else if (lowPath.includes('voice notes')) socialCategory = 'voice';
          else if (lowPath.includes('stickers')) socialCategory = 'sticker';
          else if (lowPath.includes('databases') || lowPath.endsWith('.crypt14') || lowPath.endsWith('.crypt15')) socialCategory = 'database';
          else socialCategory = 'received';
        } else if (lowPath.includes('telegram')) {
          socialApp = 'Telegram';
          socialCategory = 'received';
        } else if (lowPath.includes('instagram')) {
          socialApp = 'Instagram';
          socialCategory = 'received';
        }

        allFiles.push({
          ...file,
          category,
          isJunk,
          socialApp,
          socialCategory,
          source: 'native',
          storageSource: 'mediastore',
        });
      }
    }
  } catch (err) {
    console.error('MediaStore scan error:', err);
  }

  // SPEED FIX: Run duplicate detection in background — don't block scan return
  // Caller (App.tsx) will call updateFiles() again when duplicates are ready.
  groupDuplicateFiles(allFiles).then(duplicateGroups => {
    const duplicateIds = new Set<string>();
    const originalIds = new Set<string>();
    for (const group of duplicateGroups) {
      originalIds.add(group.original.id);
      for (const dup of group.duplicates) duplicateIds.add(dup.id);
    }
    for (const f of allFiles) {
      if (duplicateIds.has(f.id)) { f.isDuplicate = true; f.isOriginal = false; }
      else if (originalIds.has(f.id)) { f.isDuplicate = true; f.isOriginal = true; }
      else { f.isDuplicate = false; }
    }
  }).catch(() => {});

  // Metrics — calculated immediately from current files
  metrics = { imageBytes: 0, videoBytes: 0, audioBytes: 0, documentBytes: 0 };
  for (const f of allFiles) {
    if (f.category === 'image' || f.category === 'screenshot') metrics.imageBytes += f.size;
    else if (f.category === 'video' || f.category === 'large') metrics.videoBytes += f.size;
    else if (f.category === 'document') metrics.documentBytes += f.size;
    else if (f.category === 'audio') metrics.audioBytes += f.size;
  }

  return { files: allFiles, metrics };
}

/**
 * Scans Social Media specifically (WhatsApp & Telegram) via native File API directly,
 * avoiding SAF picker for instant results (requires MANAGE_EXTERNAL_STORAGE).
 */
export async function scanSocialMediaNative(): Promise<{ files: ScannedFile[] }> {
  if (!Capacitor.isNativePlatform()) return { files: [] };

  const allFiles: ScannedFile[] = [];
  try {
    const pathsToScan = [
      'Android/media/com.whatsapp/WhatsApp/Media',
      'Telegram/Telegram Video',
      'Telegram/Telegram Documents'
    ];

    for (const path of pathsToScan) {
      const res = await IonNativeStorage.scanSpecificFolder({ path });
      if (res && res.files) {
        for (const file of res.files) {
          file.size = Number(file.size) || 0;
          
          let category = 'document';
          if (file.mimeType.startsWith('image/')) category = 'image';
          else if (file.mimeType.startsWith('video/')) category = 'video';
          else if (file.mimeType.startsWith('audio/')) category = 'audio';

          let socialApp: 'WhatsApp' | 'Telegram' | 'Instagram' | undefined = undefined;
          let socialCategory: 'sent' | 'received' | 'status' | 'voice' | 'sticker' | 'database' | undefined = undefined;
          const lowPath = file.path.toLowerCase();

          if (lowPath.includes('whatsapp')) {
            socialApp = 'WhatsApp';
            if (lowPath.includes('/sent/')) socialCategory = 'sent';
            else if (lowPath.includes('/statuses/') || lowPath.includes('.statuses/')) socialCategory = 'status';
            else if (lowPath.includes('voice notes')) socialCategory = 'voice';
            else if (lowPath.includes('stickers')) socialCategory = 'sticker';
            else if (lowPath.includes('databases') || lowPath.endsWith('.crypt14') || lowPath.endsWith('.crypt15')) socialCategory = 'database';
            else socialCategory = 'received';
          } else if (lowPath.includes('telegram')) {
            socialApp = 'Telegram';
            socialCategory = 'received';
          } else if (lowPath.includes('instagram')) {
            socialApp = 'Instagram';
            socialCategory = 'received';
          }

          allFiles.push({
            ...file,
            category: category as any,
            socialApp,
            socialCategory,
            source: 'native',
            storageSource: 'mediastore',
            securityStatus: 'safe',
          });
          
          if (allFiles.length % 500 === 0) await new Promise(r => setTimeout(r, 0));
        }
      }
    }
  } catch (e) {
    console.error('Failed to scan social media natively:', e);
  }

  return { files: allFiles };
}

/**
 * FIX: Expanded junk scan — more folders + more extensions
 * Now scans: Download, cache dirs, thumbnails, temp dirs, WhatsApp DBs
 */
export async function scanJunkFilesNative(): Promise<{ files: ScannedFile[] }> {
  if (!Capacitor.isNativePlatform()) return { files: [] };

  const junkFiles: ScannedFile[] = [];

  // Extended junk file extensions
  const JUNK_EXTENSIONS = new Set([
    '.apk', '.tmp', '.temp', '.log', '.bak', '.old', '.orig',
    '.crypt14', '.crypt15', '.crypt12',
    '.part', '.crdownload', '.download',
    '.dmp', '.crash', '.trace',
    '.cache',
  ]);

  // Extended junk path patterns
  const JUNK_PATH_PATTERNS = [
    /\/cache\//i,
    /\/\.cache\//i,
    /\/thumbnails\//i,
    /\/\.thumbnails\//i,
    /\/temp\//i,
    /\/tmp\//i,
    /\.tmp$/i,
    /\.log$/i,
    /\.bak$/i,
    /\.part$/i,
    /\.crash$/i,
  ];

  const pathsToScan = [
    'Download',
    'Downloads',
    'DCIM/.thumbnails',
    '.thumbnails',
    'Android/media/com.whatsapp/WhatsApp/Databases',
    'WhatsApp/Databases',
  ];

  try {
    for (const path of pathsToScan) {
      try {
        const res = await IonNativeStorage.scanSpecificFolder({ path });
        if (res && res.files) {
          for (const file of res.files) {
            file.size = Number(file.size) || 0;
            const lowName = file.name.toLowerCase();
            const lowPath = file.path.toLowerCase();

            const ext = '.' + lowName.split('.').pop();
            const isJunkByExt = JUNK_EXTENSIONS.has(ext);
            const isJunkByPath = JUNK_PATH_PATTERNS.some(r => r.test(lowPath));

            if (isJunkByExt || isJunkByPath || file.isJunk) {
              // Determine junk sub-type
              let junkType: string = 'system_cache';
              if (lowName.endsWith('.apk')) junkType = 'temp_file';
              else if (lowName.endsWith('.log') || lowName.endsWith('.crash') || lowName.endsWith('.dmp')) junkType = 'obsolete_log';
              else if (lowPath.includes('thumbnail')) junkType = 'thumbnail_cache';
              else if (lowPath.includes('database') || lowName.includes('.crypt')) junkType = 'app_residual';

              junkFiles.push({
                ...file,
                category: 'junk',
                isJunk: true,
                junkType: junkType as any,
                source: 'native',
                storageSource: 'mediastore',
                securityStatus: 'safe',
              });
              
              if (junkFiles.length % 500 === 0) await new Promise(r => setTimeout(r, 0));
            }
          }
        }
      } catch {
        // Some paths may not exist on all devices — skip silently
      }
    }
  } catch (e) {
    console.error('Failed to scan junk files natively:', e);
  }

  return { files: junkFiles };
}

/**
 * NEW: Scans Downloads and Documents folders for all file types (PDFs, ZIPs, DOCs, etc.)
 * This is separate from junkScan — captures ALL document files, not just junk.
 */
export async function scanDocumentsNative(): Promise<{ files: ScannedFile[] }> {
  if (!Capacitor.isNativePlatform()) return { files: [] };

  const docFiles: ScannedFile[] = [];

  const DOCUMENT_EXTENSIONS = new Set([
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
    '.txt', '.csv', '.zip', '.rar', '.7z', '.tar', '.gz',
    '.epub', '.mobi', '.odt', '.ods', '.odp',
    '.json', '.xml', '.html', '.htm',
  ]);

  const pathsToScan = [
    'Download',
    'Downloads',
    'Documents',
    'DCIM/Documents',
    'Android/media/com.whatsapp/WhatsApp/Media/WhatsApp Documents',
    'Telegram/Telegram Documents',
  ];

  try {
    for (const path of pathsToScan) {
      try {
        const res = await IonNativeStorage.scanSpecificFolder({ path });
        if (res && res.files) {
          for (const file of res.files) {
            file.size = Number(file.size) || 0;
            if (file.size === 0) continue;

            const lowName = file.name.toLowerCase();
            const ext = '.' + lowName.split('.').pop();

            // Skip files already tagged as junk
            if (file.isJunk) continue;

            // Determine category
            let category: string = 'document';
            if (file.mimeType?.startsWith('image/')) category = 'image';
            else if (file.mimeType?.startsWith('video/')) category = 'video';
            else if (file.mimeType?.startsWith('audio/')) category = 'audio';
            else if (DOCUMENT_EXTENSIONS.has(ext)) category = 'document';
            else if (!file.mimeType || file.mimeType === 'application/octet-stream') {
              // Try to infer from extension
              category = 'document';
            }

            docFiles.push({
              ...file,
              category: category as any,
              source: 'native',
              storageSource: 'mediastore',
              securityStatus: 'safe',
            });
            
            if (docFiles.length % 500 === 0) await new Promise(r => setTimeout(r, 0));
          }
        }
      } catch {
        // Path may not exist — skip silently
      }
    }
  } catch (e) {
    console.error('Failed to scan documents natively:', e);
  }

  return { files: docFiles };
}

/**
 * NEW: Runs blur detection on image files in batches.
 * Tags files with isBlurry: true if variance < blur threshold.
 * Runs async after main scan — non-blocking.
 */
export async function runBlurDetectionBatch(
  files: ScannedFile[],
  onProgress?: (tagged: number, total: number) => void
): Promise<ScannedFile[]> {
  if (!Capacitor.isNativePlatform()) return files;

  const BLUR_THRESHOLD = 100; // Laplacian variance — below this = blurry
  const BATCH_SIZE = 50;
  const MAX_FILES = 300; // Cap to avoid too-long processing

  // Only process image files with nativeUri
  const imageFiles = files
    .filter(f => (f.category === 'image' || f.category === 'screenshot') && f.nativeUri)
    .slice(0, MAX_FILES);

  const updatedIds = new Map<string, boolean>(); // id -> isBlurry

  for (let i = 0; i < imageFiles.length; i += BATCH_SIZE) {
    const batch = imageFiles.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (file) => {
        try {
          const res = await IonNativeStorage.getBlurScore({ uri: file.nativeUri! });
          updatedIds.set(file.id, (res.variance ?? 999) < BLUR_THRESHOLD);
        } catch {
          // Ignore individual failures
        }
      })
    );
    onProgress?.(Math.min(i + BATCH_SIZE, imageFiles.length), imageFiles.length);
    await new Promise(r => setTimeout(r, 0));
  }

  // Apply blur tags
  return files.map(f => {
    if (updatedIds.has(f.id)) {
      return { ...f, isBlurry: updatedIds.get(f.id) };
    }
    return f;
  });
}

/**
 * Storage Access Framework (SAF) Directory Picker & Discovery
 */
export async function scanUserSelectedNativeFolder(initialUri?: string): Promise<{
  cancelled: boolean;
  files: ScannedFile[];
  treeUri?: string;
  error?: string;
}> {
  if (!Capacitor.isNativePlatform()) {
    return { cancelled: true, files: [] };
  }

  try {
    const pickResult = await IonNativeStorage.openDocumentTree(initialUri ? { initialUri } : undefined);
    if (pickResult.cancelled || !pickResult.treeUri) {
      return { cancelled: true, files: [] };
    }

    const safFiles: ScannedFile[] = [];
    const CHUNK_SIZE = 500;
    let offset = 0;

    while (true) {
      const scanResult = await IonNativeStorage.scanDocumentTree({ 
        treeUri: pickResult.treeUri,
        limit: CHUNK_SIZE,
        offset: offset
      });
      
      if (!scanResult || !scanResult.files || scanResult.files.length === 0) {
        break;
      }

      const chunkFiles = scanResult.files.map((f) => ({
        ...f,
        size: Number(f.size) || 0,
        source: 'native' as const,
        storageSource: 'saf' as const,
        treeUri: pickResult.treeUri,
        securityStatus: 'safe' as const,
      }));

      safFiles.push(...chunkFiles);

      if (scanResult.files.length < CHUNK_SIZE) {
        break;
      }
      
      offset += scanResult.files.length;
    }

    return {
      cancelled: false,
      files: safFiles,
      treeUri: pickResult.treeUri,
    };
  } catch (err: any) {
    console.error('SAF folder scan failed:', err);
    return {
      cancelled: false,
      files: [],
      error: err?.message || 'SAF folder scan failed',
    };
  }
}

/**
 * REAL PHYSICAL FILE DELETION:
 * Dispatches MediaStore items to MediaStore.createDeleteRequest (Android 11+)
 * and SAF items to DocumentFile.delete().
 * Genuinely tracks confirmed deletions.
 */
export async function executePhysicalDeletion(filesToDelete: ScannedFile[]): Promise<{
  deletedCount: number;
  freedBytes: number;
  failedCount: number;
  deletedFileIds: string[];
}> {
  if (!Capacitor.isNativePlatform()) {
    return { deletedCount: 0, freedBytes: 0, failedCount: 0, deletedFileIds: [] };
  }

  let deletedCount = 0;
  let freedBytes = 0;
  let failedCount = 0;
  const deletedFileIds: string[] = [];

  // Separate MediaStore files (have nativeUri) vs SAF files (have documentUri)
  const mediaStoreFiles = filesToDelete.filter(f => f.nativeUri && f.storageSource === 'mediastore');
  const safFiles = filesToDelete.filter(f => f.documentUri && f.storageSource === 'saf');

  // Delete MediaStore files in bulk
  if (mediaStoreFiles.length > 0) {
    try {
      const uris = mediaStoreFiles.map(f => f.nativeUri!);
      const result = await IonNativeStorage.deleteMediaItems({ uris });
      if (!result.cancelled) {
        deletedCount += result.deletedCount;
        const successfullyDeletedFiles = mediaStoreFiles.slice(0, result.deletedCount);
        freedBytes += successfullyDeletedFiles.reduce((sum, f) => sum + f.size, 0);
        successfullyDeletedFiles.forEach(f => deletedFileIds.push(f.id));
      }
    } catch (e) {
      console.error('MediaStore deletion failed:', e);
      failedCount += mediaStoreFiles.length;
    }
  }

  // Delete SAF files one by one
  for (const file of safFiles) {
    try {
      const result = await IonNativeStorage.deleteSafDocument({ documentUri: file.documentUri! });
      if (result.success) {
        deletedCount++;
        freedBytes += file.size;
        deletedFileIds.push(file.id);
      } else {
        failedCount++;
      }
    } catch {
      failedCount++;
    }
  }

  return { deletedCount, freedBytes, failedCount, deletedFileIds };
}

/**
 * Real file backup before deletion
 */
export async function executeRealBackup(filesToBackup: ScannedFile[]): Promise<{
  successfulBackups: { file: ScannedFile; backupPath: string }[];
  failedCount: number;
}> {
  if (!Capacitor.isNativePlatform()) {
    return { successfulBackups: [], failedCount: 0 };
  }

  const successfulBackups: { file: ScannedFile; backupPath: string }[] = [];
  let failedCount = 0;

  for (const file of filesToBackup) {
    if (!file.nativeUri) {
      failedCount++;
      continue;
    }
    try {
      const result = await IonNativeStorage.backupFile({
        uri: file.nativeUri,
        fileName: file.name,
      });
      if (result.success && result.backupPath) {
        successfulBackups.push({ file, backupPath: result.backupPath });
      } else {
        failedCount++;
      }
    } catch {
      failedCount++;
    }
  }

  return { successfulBackups, failedCount };
}
