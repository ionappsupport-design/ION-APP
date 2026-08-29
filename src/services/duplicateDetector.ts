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
 * Groups files by hash and identifies original (oldest) vs duplicate copies.
 * FIX: Uses multi-strategy heuristic when native hash is unavailable:
 *   1. Exact cryptographic hash (most reliable)
 *   2. Exact name + size match (catches renamed copies in same folder)
 *   3. Same size + same extension + lastModified within 60 seconds (catches camera duplicates)
 */
export async function groupDuplicateFiles(files: ScannedFile[]): Promise<DuplicateGroup[]> {
  const hashGroups = new Map<string, ScannedFile[]>();

  const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif', '.gif', '.bmp']);
  const MIN_SIZE_FOR_HEURISTIC = 50 * 1024; // 50 KB minimum to avoid false positives on tiny files

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file.size || file.size < MIN_SIZE_FOR_HEURISTIC) continue;

    let key: string;

    if (file.hash && file.hash !== 'unknown_hash') {
      // Strategy 1: Real cryptographic hash — most reliable
      key = `hash_${file.hash}`;
    } else {
      const ext = file.name.toLowerCase().split('.').pop() || '';
      const isImage = IMAGE_EXTENSIONS.has(`.${ext}`);

      if (isImage && file.size > MIN_SIZE_FOR_HEURISTIC) {
        // Strategy 2 for images: size + extension (bucket), then refine by lastModified proximity below
        // Use size+ext as primary key — files with same size and same extension are candidates
        key = `size_ext_${file.size}_${ext}`;
      } else {
        // Strategy 3: name + size (catches exact copies with same filename)
        const cleanName = file.name.toLowerCase().replace(/\s*\(\d+\)\s*/g, '').replace(/\s*copy\s*/gi, '').trim();
        key = `name_size_${cleanName}_${file.size}`;
      }
    }

    if (key) {
      const existing = hashGroups.get(key) || [];
      existing.push(file);
      hashGroups.set(key, existing);
    }
    
    if (i % 500 === 0) await new Promise(r => setTimeout(r, 0));
  }

  const duplicateGroups: DuplicateGroup[] = [];
  let iter = 0;

  for (const [key, groupFiles] of hashGroups.entries()) {
    let candidateGroups: ScannedFile[][] = [groupFiles];

    // For size+ext buckets, sub-group by lastModified proximity (within 60 seconds)
    if (key.startsWith('size_ext_') && groupFiles.length > 1) {
      const sorted = [...groupFiles].sort((a, b) => a.lastModified - b.lastModified);
      const subGroups: ScannedFile[][] = [];
      let current: ScannedFile[] = [sorted[0]];

      for (let i = 1; i < sorted.length; i++) {
        const timeDiff = Math.abs(sorted[i].lastModified - sorted[i - 1].lastModified);
        if (timeDiff <= 60_000) { // within 60 seconds = likely duplicate burst
          current.push(sorted[i]);
        } else {
          if (current.length > 1) subGroups.push(current);
          current = [sorted[i]];
        }
      }
      if (current.length > 1) subGroups.push(current);
      candidateGroups = subGroups;
    }

    for (const group of candidateGroups) {
      if (group.length < 2) continue;

      // Sort by lastModified (oldest = original)
      const sorted = [...group].sort((a, b) => a.lastModified - b.lastModified);
      const original = sorted[0];
      const duplicates = sorted.slice(1);

      duplicateGroups.push({
        groupId: `group_${original.id.substring(0, 8)}`,
        hash: key,
        fileName: original.name,
        fileSize: original.size,
        totalSizeWithDuplicates: original.size * group.length,
        recoverableSize: original.size * duplicates.length,
        original,
        duplicates,
      });
    }
    
    if (iter++ % 100 === 0) await new Promise(r => setTimeout(r, 0));
  }

  // Sort by recoverable storage descending
  return duplicateGroups.sort((a, b) => b.recoverableSize - a.recoverableSize);
}

