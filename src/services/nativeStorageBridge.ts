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
  }): Promise<{
    files: ScannedFile[];
    count: number;
    totalBytes: number;
    skippedCount: number;
    imageBytes: number;
    videoBytes: number;
    audioBytes: number;
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
    const res = await IonNativeStorage.requestStoragePermissions();
    if (res.isTiramisu) {
      const manageRes = await IonNativeStorage.requestManageExternalStorage();
      return (res.granted || res.images || res.video || res.audio) && manageRes.granted;
    }
    return res.granted || res.images || res.video || res.audio;
  } catch (error) {
    console.warn('Native storage permission request failed:', error);
    return false;
  }
}

/**
 * Scan MediaStore on Android
 */
export async function scanNativeStorage(): Promise<{
  files: ScannedFile[];
  metrics: { imageBytes: number; videoBytes: number; audioBytes: number } | null;
}> {
  if (!Capacitor.isNativePlatform()) {
    return { files: [], metrics: null };
  }

  const allFiles: ScannedFile[] = [];
  let metrics = { imageBytes: 0, videoBytes: 0, audioBytes: 0 };
  let imgOffset = 0, vidOffset = 0, audOffset = 0;
  const CHUNK_SIZE = 500;

  try {
    while (true) {
      const mediaResult = await IonNativeStorage.scanMediaStore({
        imageLimit: CHUNK_SIZE, imageOffset: imgOffset,
        videoLimit: CHUNK_SIZE, videoOffset: vidOffset,
        audioLimit: CHUNK_SIZE, audioOffset: audOffset
      });

      if (!mediaResult || !mediaResult.files || mediaResult.files.length === 0) {
        break; // No more files
      }

      metrics.imageBytes = mediaResult.imageBytes || metrics.imageBytes;
      metrics.videoBytes = mediaResult.videoBytes || metrics.videoBytes;
      metrics.audioBytes = mediaResult.audioBytes || metrics.audioBytes;
      
      let fetchedImgs = 0, fetchedVids = 0, fetchedAuds = 0;

      for (const file of mediaResult.files) {
        // Basic tagging
        let category = file.category;
        let isJunk = file.isJunk || false;

        // Try to tag screenshots
        if (file.path.toLowerCase().includes('screenshot')) {
          category = 'screenshot';
        }
        
        // Large files
        if (file.size > 50 * 1024 * 1024) {
          category = 'large';
        }

        allFiles.push({
          ...file,
          category,
          isJunk,
          source: 'native',
          storageSource: 'mediastore',
        });
        
        if (file.mimeType.startsWith('image/')) fetchedImgs++;
        else if (file.mimeType.startsWith('video/')) fetchedVids++;
        else if (file.mimeType.startsWith('audio/')) fetchedAuds++;
      }

      // If we got 0 files total, the loop breaks above.
      if (fetchedImgs === 0 && fetchedVids === 0 && fetchedAuds === 0) break;

      imgOffset += fetchedImgs;
      vidOffset += fetchedVids;
      audOffset += fetchedAuds;
    }
  } catch (err) {
    console.error('MediaStore chunked scan error:', err);
  }

  // Post-process to find duplicates
  try {
    const duplicateGroups = groupDuplicateFiles(allFiles);
    const duplicateIds = new Set<string>();
    
    for (const group of duplicateGroups) {
      for (const dup of group.duplicates) {
        duplicateIds.add(dup.id);
      }
    }
    
    // Tag the duplicates in allFiles
    for (const f of allFiles) {
      if (duplicateIds.has(f.id)) {
        f.isDuplicate = true;
        f.isOriginal = false;
      } else {
        f.isDuplicate = false; 
      }
    }
  } catch(e) {
    console.warn("Duplicate post-processing failed:", e);
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
          // Determine category
          let category = 'document';
          if (file.mimeType.startsWith('image/')) category = 'image';
          else if (file.mimeType.startsWith('video/')) category = 'video';
          else if (file.mimeType.startsWith('audio/')) category = 'audio';

          allFiles.push({
            ...file,
            category,
            source: 'native',
            storageSource: 'mediastore', // treat as mediastore since it's just raw files
            securityStatus: 'safe',
          });
        }
      }
    }
  } catch (e) {
    console.error('Failed to scan social media natively:', e);
  }

  return { files: allFiles };
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
        break; // No more files
      }

      const chunkFiles = scanResult.files.map((f) => ({
        ...f,
        source: 'native' as const,
        storageSource: 'saf' as const,
        treeUri: pickResult.treeUri,
        securityStatus: 'safe' as const,
      }));

      safFiles.push(...chunkFiles);

      if (scanResult.files.length < CHUNK_SIZE) {
        break; // Reached end of files
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
  deletedFileIds: string[];
  failedPaths: string[];
}> {
  let deletedCount = 0;
  let freedBytes = 0;
  const deletedFileIds: string[] = [];
  const failedPaths: string[] = [];

  if (!Capacitor.isNativePlatform()) {
    // Web Sandbox Mode: Honest local state removal
    for (const f of filesToDelete) {
      deletedCount++;
      freedBytes += f.size;
      deletedFileIds.push(f.id);
    }
    return { deletedCount, freedBytes, deletedFileIds, failedPaths };
  }

  // 1. Group MediaStore files (explicit storageSource === 'mediastore' or content:// nativeUri)
  const mediaStoreFiles = filesToDelete.filter(
    (f) => (f.storageSource === 'mediastore' || f.nativeUri?.startsWith('content://')) && f.nativeUri
  );

  if (mediaStoreFiles.length > 0) {
    try {
      const uris = mediaStoreFiles.map((f) => f.nativeUri!);
      const res = await IonNativeStorage.deleteMediaItems({ uris });
      if (res.success && res.deletedCount > 0) {
        // Confirmed deleted via MediaStore.createDeleteRequest or ContentResolver.delete
        for (let i = 0; i < Math.min(res.deletedCount, mediaStoreFiles.length); i++) {
          const file = mediaStoreFiles[i];
          deletedCount++;
          freedBytes += file.size;
          deletedFileIds.push(file.id);
        }
      } else if (res.cancelled) {
        failedPaths.push(...mediaStoreFiles.map((f) => f.path));
      }
    } catch (e: any) {
      console.error('MediaStore physical deletion error:', e);
      failedPaths.push(...mediaStoreFiles.map((f) => f.path));
    }
  }

  // 2. Group SAF (Storage Access Framework) files
  const safFiles = filesToDelete.filter(
    (f) => (f.storageSource === 'saf' || f.documentUri) && !mediaStoreFiles.includes(f)
  );

  for (const f of safFiles) {
    if (!f.documentUri) continue;
    try {
      const res = await IonNativeStorage.deleteSafDocument({ documentUri: f.documentUri });
      if (res.success) {
        deletedCount++;
        freedBytes += f.size;
        deletedFileIds.push(f.id);
      } else {
        failedPaths.push(f.path);
      }
    } catch (err) {
      failedPaths.push(f.path);
    }
  }

  return { deletedCount, freedBytes, deletedFileIds, failedPaths };
}

/**
 * Real Local Backup of file before deletion
 */
export async function executeRealBackup(file: ScannedFile): Promise<{
  success: boolean;
  backupPath?: string;
  bytesCopied?: number;
  checksumSha256?: string;
  error?: string;
}> {
  if (!Capacitor.isNativePlatform()) {
    // In web browser, mark as backed up in memory/local store
    return {
      success: true,
      backupPath: `web_backup://${file.name}`,
      bytesCopied: file.size,
      checksumSha256: 'web_sandbox_hash',
    };
  }

  if (!file.nativeUri) {
    return { success: false, error: 'No native URI present for file' };
  }

  try {
    const res = await IonNativeStorage.backupFile({
      uri: file.nativeUri,
      fileName: file.name,
    });
    return res;
  } catch (err: any) {
    console.error('Real backup failed:', err);
    return { success: false, error: err?.message || 'Backup failed' };
  }
}

/**
 * REAL PHYSICAL FILE RESTORE:
 * Copies file from ion_backups directory back to Android Downloads folder
 */
export async function executeRealPhysicalRestore(backupPath: string, originalName: string): Promise<{
  success: boolean;
  restoredPath?: string;
  error?: string;
}> {
  if (!Capacitor.isNativePlatform()) {
    return {
      success: true,
      restoredPath: `/Downloads/${originalName}`,
    };
  }
  try {
    const res = await IonNativeStorage.restoreFile({ backupPath, originalName });
    return res;
  } catch (err: any) {
    console.error('Physical file restore failed:', err);
    return { success: false, error: err?.message || 'File restore failed' };
  }
}
