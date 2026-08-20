import { RecycleBinItem, ScannedFile } from '../types';
import { executeRealPhysicalRestore } from './nativeStorageBridge';

const RECYCLE_BIN_KEY = 'ion_recycle_bin_items_v4';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export function loadRecycleBin(): RecycleBinItem[] {
  try {
    const raw = localStorage.getItem(RECYCLE_BIN_KEY);
    if (!raw) return [];
    const items: RecycleBinItem[] = JSON.parse(raw);
    const now = Date.now();

    // Auto-purge items older than 30 days
    const activeItems = items
      .filter((item) => item.expiresAt > now)
      .map((item) => ({
        ...item,
        remainingDays: Math.max(0, Math.ceil((item.expiresAt - now) / (24 * 60 * 60 * 1000))),
      }));

    if (activeItems.length !== items.length) {
      saveRecycleBin(activeItems);
    }

    return activeItems;
  } catch (err) {
    console.error('Failed to load recycle bin items:', err);
    return [];
  }
}

export function saveRecycleBin(items: RecycleBinItem[]): void {
  try {
    localStorage.setItem(RECYCLE_BIN_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save recycle bin:', err);
  }
}

export function addToRecycleBin(file: ScannedFile, backupPath?: string): RecycleBinItem {
  const items = loadRecycleBin();
  const now = Date.now();
  const expiresAt = now + THIRTY_DAYS_MS;

  const newItem: RecycleBinItem = {
    id: `bin_${now}_${crypto.randomUUID().substring(0, 8)}`,
    fileId: file.id,
    name: file.name,
    originalPath: file.path,
    backupPath: backupPath || undefined,
    size: file.size,
    category: file.category,
    mimeType: file.mimeType,
    deletedAt: now,
    expiresAt,
    remainingDays: 30,
    fileData: file,
  };

  const updated = [newItem, ...items];
  saveRecycleBin(updated);
  return newItem;
}

export async function restoreItemFromRecycleBin(binId: string): Promise<{ success: boolean; restoredFile?: ScannedFile }> {
  const items = loadRecycleBin();
  const target = items.find((i) => i.id === binId);
  if (!target) {
    return { success: false };
  }

  // Trigger real physical file copy if backup exists
  if (target.backupPath) {
    const res = await executeRealPhysicalRestore(target.backupPath, target.name);
    if (!res.success) {
      console.error(`Physical restore failed for ${target.name}: ${res.error}`);
      return { success: false };
    }
  }

  const remaining = items.filter((i) => i.id !== binId);
  saveRecycleBin(remaining);
  return { success: true, restoredFile: target.fileData };
}

import { registerPlugin } from '@capacitor/core';
const IonNativeStorage = registerPlugin<any>('IonNativeStorage');

export async function permanentlyDeleteFromBin(binId: string): Promise<boolean> {
  const items = loadRecycleBin();
  const target = items.find((i) => i.id === binId);
  
  if (target && target.backupPath) {
    try {
      await IonNativeStorage.deleteBackupFile({ backupPath: target.backupPath });
    } catch (e) {
      console.error('Failed to natively delete backup file:', e);
    }
  }

  const remaining = items.filter((i) => i.id !== binId);
  saveRecycleBin(remaining);
  return true;
}

export async function clearEntireRecycleBin(): Promise<number> {
  const items = loadRecycleBin();
  let totalFreed = 0;
  
  for (const item of items) {
    if (item.backupPath) {
      try {
        await IonNativeStorage.deleteBackupFile({ backupPath: item.backupPath });
      } catch (e) {
        console.error('Failed to natively delete backup file for all:', e);
      }
    }
    totalFreed += item.size;
  }
  
  saveRecycleBin([]);
  return totalFreed;
}
