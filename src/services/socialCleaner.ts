import { ScannedFile, SocialAppMediaCategory } from '../types';

export function categorizeSocialMedia(files: ScannedFile[]): SocialAppMediaCategory[] {
  const whatsAppFiles = files.filter(
    (f) =>
      f.path.toLowerCase().includes('whatsapp') ||
      f.name.toLowerCase().includes('whatsapp') ||
      f.path.toLowerCase().includes('com.whatsapp') ||
      f.path.toLowerCase().includes('opus')
  );

  const telegramFiles = files.filter(
    (f) =>
      f.path.toLowerCase().includes('telegram') ||
      f.name.toLowerCase().includes('telegram') ||
      f.path.toLowerCase().includes('org.telegram')
  );

  // Group WhatsApp Deep Subfolders
  const waSentVideos = whatsAppFiles.filter(
    (f) => (f.category === 'video' || f.mimeType.startsWith('video/')) && f.path.toLowerCase().includes('sent')
  );
  const waSentImages = whatsAppFiles.filter(
    (f) => (f.category === 'image' || f.mimeType.startsWith('image/')) && f.path.toLowerCase().includes('sent')
  );
  const waVoiceNotes = whatsAppFiles.filter(
    (f) => f.category === 'audio' || f.path.toLowerCase().includes('voice') || f.path.toLowerCase().includes('opus')
  );
  const waStatuses = whatsAppFiles.filter(
    (f) => f.path.toLowerCase().includes('status') || f.path.toLowerCase().includes('.statuses')
  );
  const waDatabases = whatsAppFiles.filter(
    (f) => f.path.toLowerCase().includes('databases') || f.name.toLowerCase().includes('.crypt')
  );
  const waStickers = whatsAppFiles.filter(
    (f) => f.path.toLowerCase().includes('stickers') || f.name.toLowerCase().endsWith('.webp')
  );
  
  // Received Images (Exclude Sent)
  const waAllReceivedImages = whatsAppFiles.filter(
    (f) => (f.category === 'image' || f.mimeType.startsWith('image/')) && !f.path.toLowerCase().includes('sent') && !f.path.toLowerCase().includes('status')
  );

  // Junk & Forwarded Memes Heuristic
  // Typically, small compressed JPEGs (under 150KB) that are received are often memes or "Good Morning" forwards
  const waJunkForwards = waAllReceivedImages.filter(f => (f.size || 0) < 150 * 1024);
  const waImages = waAllReceivedImages.filter(f => (f.size || 0) >= 150 * 1024);

  // Group Telegram Deep Subfolders
  const tgVideos = telegramFiles.filter((f) => f.category === 'video' || f.mimeType.startsWith('video/'));
  const tgImages = telegramFiles.filter((f) => f.category === 'image' || f.mimeType.startsWith('image/'));
  const tgDocs = telegramFiles.filter((f) => f.category === 'document' || f.path.toLowerCase().includes('document'));

  return [
    {
      appName: 'WhatsApp',
      categoryTitle: 'Junk & Forwarded Memes',
      path: '/WhatsApp/Media/WhatsApp Images',
      count: waJunkForwards.length,
      sizeBytes: waJunkForwards.reduce((sum, f) => sum + (f.size || 0), 0),
      files: waJunkForwards,
      description: '"Good Morning" quotes and small forwarded images',
    },
    {
      appName: 'WhatsApp',
      categoryTitle: 'Sent Media',
      path: '/WhatsApp/Media/Sent',
      count: waSentVideos.length + waSentImages.length,
      sizeBytes: [...waSentVideos, ...waSentImages].reduce((sum, f) => sum + (f.size || 0), 0),
      files: [...waSentVideos, ...waSentImages],
      description: 'Duplicate forwarded and sent videos/images taking up space',
    },
    {
      appName: 'WhatsApp',
      categoryTitle: 'Received Photos',
      path: '/WhatsApp/Media/WhatsApp Images',
      count: waImages.length,
      sizeBytes: waImages.reduce((sum, f) => sum + (f.size || 0), 0),
      files: waImages,
      description: 'Higher quality received images and camera photos',
    },
    {
      appName: 'WhatsApp',
      categoryTitle: 'Statuses Cache',
      path: '/WhatsApp/Media/.Statuses',
      count: waStatuses.length,
      sizeBytes: waStatuses.reduce((sum, f) => sum + (f.size || 0), 0),
      files: waStatuses,
      description: 'Temporary status videos and photos downloaded in background',
    },
    {
      appName: 'WhatsApp',
      categoryTitle: 'Voice Notes (.opus)',
      path: '/WhatsApp/Media/WhatsApp Voice Notes',
      count: waVoiceNotes.length,
      sizeBytes: waVoiceNotes.reduce((sum, f) => sum + (f.size || 0), 0),
      files: waVoiceNotes,
      description: 'Old voice notes and cached audio clips',
    },
    {
      appName: 'WhatsApp',
      categoryTitle: 'Databases & Backups',
      path: '/WhatsApp/Databases',
      count: waDatabases.length,
      sizeBytes: waDatabases.reduce((sum, f) => sum + (f.size || 0), 0),
      files: waDatabases,
      description: 'Daily local backups that can consume gigabytes of storage',
    },
    {
      appName: 'WhatsApp',
      categoryTitle: 'Stickers & GIFs',
      path: '/WhatsApp/Media/WhatsApp Stickers',
      count: waStickers.length,
      sizeBytes: waStickers.reduce((sum, f) => sum + (f.size || 0), 0),
      files: waStickers,
      description: 'Saved and cached sticker packs',
    },
    {
      appName: 'Telegram',
      categoryTitle: 'Telegram Cached Videos',
      path: '/Telegram/Telegram Video',
      count: tgVideos.length,
      sizeBytes: tgVideos.reduce((sum, f) => sum + (f.size || 0), 0),
      files: tgVideos,
      description: 'Downloaded video files and streams from channels',
    },
    {
      appName: 'Telegram',
      categoryTitle: 'Telegram Images & Documents',
      path: '/Telegram/Telegram Documents',
      count: tgImages.length + tgDocs.length,
      sizeBytes: [...tgImages, ...tgDocs].reduce((sum, f) => sum + (f.size || 0), 0),
      files: [...tgImages, ...tgDocs],
      description: 'Channel images, downloaded PDFs, and archives',
    },
  ];
}
