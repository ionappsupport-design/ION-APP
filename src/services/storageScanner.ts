import { ScannedFile, StorageOverview, JunkCategory, CleaningRecommendation } from '../types';
import { getNativeStorageOverview } from './nativeStorageBridge';

import { Capacitor } from '@capacitor/core';

// Initial empty file array for native device filesystem scanning
export const INITIAL_DEVICE_FILES: ScannedFile[] = [];

export async function getRealStorageOverview(currentFiles: ScannedFile[]): Promise<StorageOverview> {
  const appFilesBytes = currentFiles.reduce((acc, f) => acc + f.size, 0);

  // 1. On Native Android, query native device storage statistics (StatFs)
  if (Capacitor.getPlatform() !== 'web') {
    const nativeOverview = await getNativeStorageOverview();
    if (nativeOverview && nativeOverview.totalBytes > 0) {
      return nativeOverview;
    }
  }

  // 2. Storage estimate on Web/Browser
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      const total = estimate.quota || (64 * 1024 * 1024 * 1024);
      const used = (estimate.usage || 0) + appFilesBytes;
      const available = Math.max(0, total - used);
      const percentage = Math.min(100, Math.round((used / total) * 100));

      return {
        totalBytes: total,
        usedBytes: used,
        availableBytes: available,
        usedPercentage: percentage,
        isRealData: true,
        storageApiSource: 'navigator.storage',
      };
    } catch {
      // ignore
    }
  }

  return {
    totalBytes: appFilesBytes,
    usedBytes: appFilesBytes,
    availableBytes: 0,
    usedPercentage: appFilesBytes > 0 ? 100 : 0,
    isRealData: false,
    storageApiSource: 'fallback_estimate',
  };
}

export function detectJunkCategories(files: ScannedFile[]): JunkCategory[] {
  // Strict Junk Rules
  const systemCacheRules = [/\/cache\//i, /\.cache$/i, /\/webview\//i, /\.tmp$/i];
  const tempFilesRules = [/\.temp$/i, /\.apk$/i, /download\/.*\.zip$/i];
  const obsoleteLogRules = [/\.log$/i, /crash-.*\.txt/i, /metrics\.txt/i];
  const thumbCacheRules = [/\/\.thumbnails\//i, /\.thumb$/i, /thumb_.*\.jpg/i];
  const residualsRules = [/\/Android\/data\/.*(deleted|removed).*/i];

  const systemCache: ScannedFile[] = [];
  const tempFiles: ScannedFile[] = [];
  const obsoleteLogs: ScannedFile[] = [];
  const thumbCache: ScannedFile[] = [];
  const residuals: ScannedFile[] = [];

  for (const f of files) {
    if (systemCacheRules.some(r => r.test(f.path))) {
      systemCache.push(f);
    } else if (tempFilesRules.some(r => r.test(f.path))) {
      tempFiles.push(f);
    } else if (obsoleteLogRules.some(r => r.test(f.path))) {
      obsoleteLogs.push(f);
    } else if (thumbCacheRules.some(r => r.test(f.path))) {
      thumbCache.push(f);
    } else if (residualsRules.some(r => r.test(f.path))) {
      residuals.push(f);
    } else if (f.isJunk || f.category === 'junk' || f.category === 'temp' || f.category === 'cache') {
      // Fallback to legacy categories if native bridge marked them
      if (f.junkType === 'system_cache' || f.category === 'cache') systemCache.push(f);
      else if (f.junkType === 'temp_file' || f.category === 'temp') tempFiles.push(f);
      else if (f.junkType === 'obsolete_log') obsoleteLogs.push(f);
      else if (f.junkType === 'thumbnail_cache') thumbCache.push(f);
      else if (f.junkType === 'app_residual') residuals.push(f);
      else systemCache.push(f); // default fallback
    }
  }

  const categories: JunkCategory[] = [
    {
      id: 'system_cache',
      name: 'System & Webview Cache',
      description: 'Temporary cached data from browsers and system renderers',
      count: systemCache.length,
      totalSize: systemCache.reduce((sum, f) => sum + f.size, 0),
      files: systemCache,
      isSafe: true,
    },
    {
      id: 'temp_files',
      name: 'Temporary Files',
      description: 'Orphaned installer archives and temporary extraction files',
      count: tempFiles.length,
      totalSize: tempFiles.reduce((sum, f) => sum + f.size, 0),
      files: tempFiles,
      isSafe: true,
    },
    {
      id: 'obsolete_logs',
      name: 'Obsolete System Logs',
      description: 'Old crash dumps and execution traces safe to purge',
      count: obsoleteLogs.length,
      totalSize: obsoleteLogs.reduce((sum, f) => sum + f.size, 0),
      files: obsoleteLogs,
      isSafe: true,
    },
    {
      id: 'thumb_cache',
      name: 'Thumbnail Cache',
      description: 'Generated media preview thumbnails that can be rebuilt automatically',
      count: thumbCache.length,
      totalSize: thumbCache.reduce((sum, f) => sum + f.size, 0),
      files: thumbCache,
      isSafe: true,
    },
    {
      id: 'app_residuals',
      name: 'App Residuals',
      description: 'Leftover data folders from uninstalled applications',
      count: residuals.length,
      totalSize: residuals.reduce((sum, f) => sum + f.size, 0),
      files: residuals,
      isSafe: true,
    }
  ].filter(cat => cat.count > 0);

  return categories;
}

export async function generateSmartRecommendations(files: ScannedFile[]): Promise<CleaningRecommendation[]> {
  const recommendations: CleaningRecommendation[] = [];

  // 1. Junk & Cache
  const junkFiles = files.filter(f => f.isJunk || f.category === 'junk' || f.category === 'temp' || f.category === 'cache');
  if (junkFiles.length > 0) {
    const totalJunkBytes = junkFiles.reduce((sum, f) => sum + f.size, 0);
    recommendations.push({
      id: 'rec_junk',
      title: 'Clean Temporary & Cache Junk',
      description: `${junkFiles.length} temporary files and caches can be safely removed without affecting personal data.`,
      recoverableBytes: totalJunkBytes,
      fileCount: junkFiles.length,
      type: 'junk',
      files: junkFiles,
      badgeColor: 'blue',
    });
  }

  // 2. Duplicate Files
  const duplicateCopies = files.filter(f => f.isDuplicate && !f.isOriginal);
  if (duplicateCopies.length > 0) {
    const totalDupBytes = duplicateCopies.reduce((sum, f) => sum + f.size, 0);
    recommendations.push({
      id: 'rec_duplicates',
      title: 'Remove Duplicate File Copies',
      description: `Identified ${duplicateCopies.length} exact matching duplicate copies. Keeping original versions intact.`,
      recoverableBytes: totalDupBytes,
      fileCount: duplicateCopies.length,
      type: 'duplicates',
      files: duplicateCopies,
      badgeColor: 'amber',
    });
  }

  // 3. Old Screenshots
  const oldScreenshots = files.filter(f => f.category === 'screenshot' || f.name.toLowerCase().includes('screenshot') || f.path.toLowerCase().includes('screenshot'));
  if (oldScreenshots.length > 0) {
    const totalScBytes = oldScreenshots.reduce((sum, f) => sum + f.size, 0);
    recommendations.push({
      id: 'rec_screenshots',
      title: 'Review Stored Screenshots',
      description: `${oldScreenshots.length} screenshots found taking up valuable storage. Review and clear unneeded captures.`,
      recoverableBytes: totalScBytes,
      fileCount: oldScreenshots.length,
      type: 'screenshots',
      files: oldScreenshots,
      badgeColor: 'cyan',
    });
  }

  // 4. Unused Large Files
  const largeFiles = files.filter(f => f.category === 'large' || f.size > 20 * 1024 * 1024);
  if (largeFiles.length > 0) {
    const totalLargeBytes = largeFiles.reduce((sum, f) => sum + f.size, 0);
    recommendations.push({
      id: 'rec_large',
      title: 'Compress or Archive Large Videos',
      description: `${largeFiles.length} large media files detected. Compress to reclaim up to 60% space.`,
      recoverableBytes: Math.round(totalLargeBytes * 0.5), // estimated 50% recovery via video compressor
      fileCount: largeFiles.length,
      type: 'large_files',
      files: largeFiles,
      badgeColor: 'purple',
    });
  }

  // Sort strictly by recoverable storage descending
  return recommendations.sort((a, b) => b.recoverableBytes - a.recoverableBytes);
}
