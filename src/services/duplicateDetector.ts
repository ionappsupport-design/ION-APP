import { ScannedFile } from '../types';

export interface DuplicateGroup {
  groupId: string;
  hash: string;
  fileName: string;
  fileSize: number;
  totalSizeWithDuplicates: number;
  recoverableSize: number;
  original: ScannedFile;
  duplicates: ScannedFile[];
}

import { registerPlugin } from '@capacitor/core';
const IonNativeStorage = registerPlugin<any>('IonNativeStorage');

/**
 * Computes a MD5/SHA-256 hash natively for a physical file
 */
export async function computeFileHashNative(nativeUri: string): Promise<string> {
  try {
    const res = await IonNativeStorage.getFileHash({ uri: nativeUri });
    return res.hash || 'unknown_hash';
  } catch (e) {
    console.error('Native hash failed', e);
    return 'unknown_hash';
  }
}

/**
 * Computes a SHA-256 hash for a File or Blob using the Web Crypto API (Fallback)
 */
export async function computeFileHash(fileOrBlob: Blob): Promise<string> {
  const MAX_CHUNK_SIZE = 50 * 1024 * 1024; 
  let bufferToHash: ArrayBuffer;
  
  if (fileOrBlob.size > MAX_CHUNK_SIZE) {
    const chunk = fileOrBlob.slice(0, 10 * 1024 * 1024); 
    bufferToHash = await chunk.arrayBuffer();
  } else {
    bufferToHash = await fileOrBlob.arrayBuffer();
  }
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', bufferToHash);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hexHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return 'sha256_' + hexHash + '_' + fileOrBlob.size;
}

/**
 * Groups files by hash and identifies original (oldest) vs duplicate copies
 */
export function groupDuplicateFiles(files: ScannedFile[]): DuplicateGroup[] {
  const hashGroups = new Map<string, ScannedFile[]>();

  files.forEach(file => {
    if (file.hash) {
      const existing = hashGroups.get(file.hash) || [];
      existing.push(file);
      hashGroups.set(file.hash, existing);
    }
  });

  const duplicateGroups: DuplicateGroup[] = [];

  hashGroups.forEach((groupFiles, hash) => {
    if (groupFiles.length > 1) {
      // Sort by lastModified (oldest is considered original)
      const sorted = [...groupFiles].sort((a, b) => a.lastModified - b.lastModified);
      const original = sorted[0];
      const duplicates = sorted.slice(1);

      const fileSize = original.size;
      const totalSize = fileSize * groupFiles.length;
      const recoverableSize = fileSize * duplicates.length;

      duplicateGroups.push({
        groupId: `group_${hash.substring(7, 15)}`,
        hash,
        fileName: original.name,
        fileSize,
        totalSizeWithDuplicates: totalSize,
        recoverableSize,
        original,
        duplicates,
      });
    }
  });

  // Sort by recoverable storage descending
  return duplicateGroups.sort((a, b) => b.recoverableSize - a.recoverableSize);
}
