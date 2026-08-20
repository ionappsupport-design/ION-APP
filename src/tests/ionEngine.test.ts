import { describe, it, expect } from 'vitest';
import { formatBytes } from '../utils/formatters';
import { categorizeSocialMedia } from '../services/socialCleaner';
import { generateSmartRecommendations } from '../services/storageScanner';
import { ScannedFile } from '../types';

describe('ION Core Storage Utilities & Math', () => {
  it('correctly formats bytes into human readable strings', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1024 * 1024)).toBe('1 MB');
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB');
    expect(formatBytes(5.5 * 1024 * 1024 * 1024)).toBe('5.5 GB');
  });

  it('categorizes social media files into deep WhatsApp/Telegram subfolders', () => {
    const mockFiles: ScannedFile[] = [
      {
        id: 'f1',
        name: 'VID_SENT_1.mp4',
        size: 50 * 1024 * 1024,
        path: '/Android/media/com.whatsapp/WhatsApp/Media/WhatsApp Video/Sent/VID_SENT_1.mp4',
        source: 'native',
        category: 'video',
        mimeType: 'video/mp4',
        lastModified: Date.now(),
        securityStatus: 'safe',
      },
      {
        id: 'f2',
        name: 'AUD_VOICE_1.opus',
        size: 2 * 1024 * 1024,
        path: '/Android/media/com.whatsapp/WhatsApp/Media/WhatsApp Voice Notes/AUD_VOICE_1.opus',
        source: 'native',
        category: 'audio',
        mimeType: 'audio/opus',
        lastModified: Date.now(),
        securityStatus: 'safe',
      },
    ];

    const categories = categorizeSocialMedia(mockFiles);
    expect(categories).toBeDefined();
    expect(categories.length).toBeGreaterThan(0);

    const sentCategory = categories.find((c) => c.categoryTitle.includes('Sent Videos'));
    expect(sentCategory).toBeDefined();
    expect(sentCategory?.count).toBe(1);
    expect(sentCategory?.sizeBytes).toBe(50 * 1024 * 1024);
  });

  it('generates smart recommendations from scanned files', () => {
    const mockFiles: ScannedFile[] = [
      {
        id: 'j1',
        name: 'app_cache.tmp',
        size: 15 * 1024 * 1024,
        path: '/Android/data/cache.tmp',
        source: 'native',
        category: 'junk',
        mimeType: 'application/octet-stream',
        lastModified: Date.now(),
        isJunk: true,
        junkType: 'system_cache',
        securityStatus: 'safe',
      },
    ];

    const recs = generateSmartRecommendations(mockFiles);
    expect(recs).toBeDefined();
    expect(Array.isArray(recs)).toBe(true);
  });
});
