/**
 * Image Quality & Similarity Heuristics:
 * 1. Laplacian Variance for Blur Detection
 * 2. Perceptual Difference Hashing (dHash) for Image Similarity
 */

export interface ImageQualityAnalysis {
  isBlurry: boolean;
  blurScore: number; // 0 (very blurry) to 100 (razor sharp)
  similarityHash?: string;
}

import { registerPlugin } from '@capacitor/core';
const IonNativeStorage = registerPlugin<any>('IonNativeStorage');

/**
 * Computes image sharpness natively to bypass WebView Content URI limitations
 */
export async function analyzeImageQuality(imageSrc: string): Promise<ImageQualityAnalysis> {
  try {
    const res = await IonNativeStorage.getBlurScore({ uri: imageSrc });
    const variance = res.variance || 0;
    
    // Call native perceptual hash (dHash)
    let similarityHash = '';
    try {
      const hashRes = await IonNativeStorage.getPerceptualHash({ uri: imageSrc });
      similarityHash = hashRes.hash || '';
    } catch (e) {}
    
    const blurScore = Math.min(100, Math.max(0, Math.round((variance / 200) * 100)));
    const isBlurry = blurScore < 28;

    return {
      isBlurry,
      blurScore,
      similarityHash,
    };
  } catch (e) {
    console.warn('Native blur/hash detection failed', e);
    return { isBlurry: false, blurScore: 70, similarityHash: '' };
  }
}

/**
 * Computes Hamming distance between two binary hashes
 */
export function computeHashDifference(hash1: string, hash2: string): number {
  let diff = 0;
  const len = Math.min(hash1.length, hash2.length);
  for (let i = 0; i < len; i++) {
    if (hash1[i] !== hash2[i]) diff++;
  }
  return diff;
}
