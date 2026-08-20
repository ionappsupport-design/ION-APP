import fs from 'fs';
let content = fs.readFileSync('src/services/videoCompressor.ts', 'utf8');

content = content.replace(
  "export async function compressVideoFile(\n  videoFile: File | Blob,\n  fileName: string,\n  quality: CompressionQuality,\n  onProgress: (progress: number) => void\n): Promise<{ blob: Blob; downloadUrl: string; actualSize: number; spaceSaved: number }> {\n  return new Promise((resolve, reject) => {",
  "export async function compressVideoFile(\n  videoFile: File | Blob,\n  fileName: string,\n  quality: CompressionQuality,\n  onProgress: (progress: number) => void\n): Promise<{ blob: Blob; downloadUrl: string; actualSize: number; spaceSaved: number }> {\n  return new Promise((resolve, reject) => {\n    // HARDENING: Prevent OOM on lower-end devices by restricting max file size (1.5 GB limit)\n    if (videoFile.size > 1.5 * 1024 * 1024 * 1024) {\n      reject(new Error('Video is too large (> 1.5GB) for safe local memory compression.'));\n      return;\n    }"
);

fs.writeFileSync('src/services/videoCompressor.ts', content);
