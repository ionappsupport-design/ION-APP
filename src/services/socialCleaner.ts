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
  const waVoiceNotes = whatsAppFiles.filter(
    (f) => f.category === 'audio' || f.path.toLowerCase().includes('voice') || f.path.toLowerCase().includes('opus')
  );
  const waImages = whatsAppFiles.filter((f) => f.category === 'image' || f.mimeType.startsWith('image/'));
  const waStatuses = whatsAppFiles.filter(
    (f) => f.path.toLowerCase().includes('status') || f.path.toLowerCase().includes('.statuses')
  );

  // Group Telegram Deep Subfolders
  const tgVideos = telegramFiles.filter((f) => f.category === 'video' || f.mimeType.startsWith('video/'));
  const tgImages = telegramFiles.filter((f) => f.category === 'image' || f.mimeType.startsWith('image/'));
  const tgDocs = telegramFiles.filter((f) => f.category === 'document' || f.path.toLowerCase().includes('document'));

  return [
    {
      appName: 'WhatsApp',
      categoryTitle: 'WhatsApp Sent Videos & Media',
      path: '/Android/media/com.whatsapp/WhatsApp/Media/WhatsApp Video/Sent',
      count: waSentVideos.length,
      sizeBytes: waSentVideos.reduce((sum, f) => sum + f.size, 0),
      files: waSentVideos,
      description: 'Duplicate forwarded and sent videos taking up device space',
    },
    {
      appName: 'WhatsApp',
      categoryTitle: 'WhatsApp Voice Notes & Audio (.opus)',
      path: '/Android/media/com.whatsapp/WhatsApp/Media/WhatsApp Voice Notes',
      count: waVoiceNotes.length,
      sizeBytes: waVoiceNotes.reduce((sum, f) => sum + f.size, 0),
      files: waVoiceNotes,
      description: 'Old voice notes and cached audio clips',
    },
    {
      appName: 'WhatsApp',
      categoryTitle: 'WhatsApp Statuses Cache',
      path: '/Android/media/com.whatsapp/WhatsApp/Media/.Statuses',
      count: waStatuses.length,
      sizeBytes: waStatuses.reduce((sum, f) => sum + f.size, 0),
      files: waStatuses,
      description: 'Temporary status videos and photos downloaded in background',
    },
    {
      appName: 'WhatsApp',
      categoryTitle: 'WhatsApp Images & Stickers',
      path: '/Android/media/com.whatsapp/WhatsApp/Media/WhatsApp Images',
      count: waImages.length,
      sizeBytes: waImages.reduce((sum, f) => sum + f.size, 0),
      files: waImages,
      description: 'Received images, memes, and downloaded stickers',
    },
    {
      appName: 'Telegram',
      categoryTitle: 'Telegram Cached Videos & Streams',
      path: '/Telegram/Telegram Video',
      count: tgVideos.length,
      sizeBytes: tgVideos.reduce((sum, f) => sum + f.size, 0),
      files: tgVideos,
      description: 'Downloaded video files and streams from channels',
    },
    {
      appName: 'Telegram',
      categoryTitle: 'Telegram Images & Documents',
      path: '/Telegram/Telegram Documents',
      count: tgImages.length + tgDocs.length,
      sizeBytes: [...tgImages, ...tgDocs].reduce((sum, f) => sum + f.size, 0),
      files: [...tgImages, ...tgDocs],
      description: 'Channel images, downloaded PDFs, and archives',
    },
  ];
}
