import { describe, it, expect } from 'vitest';
import { filterSelectedFiles } from '../utils/selectionUtils';
import { ScannedFile } from '../types';

describe('Selection Utils - Deletion Payload Safety', () => {
  const mockFiles: ScannedFile[] = [
    {
      id: 'f1',
      name: 'screenshot_1.jpg',
      category: 'screenshot',
      size: 100,
      path: '/media/screenshots/1.jpg',
      source: 'native',
      mimeType: 'image/jpeg',
      lastModified: 0,
      isDuplicate: false,
      isBlurry: false,
      securityStatus: 'safe',
    },
    {
      id: 'f2',
      name: 'dup_copy.jpg',
      category: 'image',
      size: 200,
      path: '/media/images/copy.jpg',
      source: 'native',
      mimeType: 'image/jpeg',
      lastModified: 0,
      isDuplicate: true,
      isOriginal: false,
      isBlurry: false,
      securityStatus: 'safe',
    },
    {
      id: 'f3',
      name: 'large_video.mp4',
      category: 'large',
      size: 1000,
      path: '/media/video.mp4',
      source: 'native',
      mimeType: 'video/mp4',
      lastModified: 0,
      isDuplicate: false,
      isBlurry: false,
      securityStatus: 'safe',
    },
    {
      id: 'f4',
      name: 'junk_cache.tmp',
      category: 'junk',
      size: 50,
      path: '/media/cache.tmp',
      source: 'native',
      mimeType: 'application/octet-stream',
      lastModified: 0,
      isDuplicate: false,
      isBlurry: false,
      isJunk: true,
      securityStatus: 'safe',
    }
  ];

  it('ZERO-SELECTION TEST: should return an empty array if nothing is selected', () => {
    const selectedCategories = {
      duplicate: false,
      large: false,
      screenshot: false,
      blurry: false,
      junk: false,
    };
    const result = filterSelectedFiles(mockFiles, selectedCategories);
    expect(result.length).toBe(0);
  });

  it('SINGLE-SELECTION TEST: should return exactly the selected category', () => {
    const selectedCategories = {
      duplicate: false,
      large: false,
      screenshot: true,
      blurry: false,
      junk: false,
    };
    const result = filterSelectedFiles(mockFiles, selectedCategories);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('f1');
    expect(result[0].category).toBe('screenshot');
  });

  it('MULTI-SELECTION TEST: should return multiple selected categories without overlap', () => {
    const selectedCategories = {
      duplicate: true,
      large: true,
      screenshot: false,
      blurry: false,
      junk: false,
    };
    const result = filterSelectedFiles(mockFiles, selectedCategories);
    expect(result.length).toBe(2);
    const ids = result.map(f => f.id).sort();
    expect(ids).toEqual(['f2', 'f3']);
  });

  it('SAFETY TEST: should NEVER return files belonging to unselected categories', () => {
    const selectedCategories = {
      duplicate: false,
      large: false,
      screenshot: false,
      blurry: false,
      junk: true,
    };
    const result = filterSelectedFiles(mockFiles, selectedCategories);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('f4');
    expect(result[0].isJunk).toBe(true);
    
    // Ensure f3 (large file) is not included
    expect(result.find(f => f.id === 'f3')).toBeUndefined();
  });
});
