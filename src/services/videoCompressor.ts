import { ScannedFile } from '../types';

export interface CompressionResult {
  success: boolean;
  compressedBlob?: Blob;
  downloadUrl?: string;
  actualSize?: number;
  savingsBytes?: number;
  reductionPercentage?: number;
  error?: string;
}

import { registerPlugin } from '@capacitor/core';
const IonNativeStorage = registerPlugin<any>('IonNativeStorage');

/**
 * Real client-side Video Compressor Engine using native LightCompressor
 */
export async function compressVideoFile(
  file: ScannedFile,
  targetQuality: 'low' | 'medium' | 'high',
  onProgress: (progress: number) => void,
  realVideoFile?: File
): Promise<CompressionResult> {
  onProgress(10);
  
  try {
    const res = await IonNativeStorage.compressVideo({ uri: file.nativeUri || file.path, quality: targetQuality });
    
    if (res && res.success) {
      onProgress(100);
      const actualSize = res.actualSize || 0;
      const savingsBytes = Math.max(0, file.size - actualSize);
      const reductionPercentage = file.size > 0 ? Math.round((savingsBytes / file.size) * 100) : 0;
      
      return {
        success: true,
        downloadUrl: res.compressedPath,
        actualSize,
        savingsBytes,
        reductionPercentage,
      };
    }
    
    return {
      success: false,
      error: res?.error || 'Native video compression failed',
    };
  } catch (err: any) {
    console.error('Video compression error:', err);
    return {
      success: false,
      error: err?.message || 'Video compression process encountered an unexpected error.',
    };
  }
}

export async function saveVideoToGallery(filePath: string): Promise<boolean> {
  try {
    const res = await IonNativeStorage.saveVideoToGallery({ path: filePath });
    return res && res.success;
  } catch (err) {
    console.error('Save to gallery error:', err);
    return false;
  }
}
