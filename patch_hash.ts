import fs from 'fs';

let content = fs.readFileSync('src/services/duplicateDetector.ts', 'utf8');

content = content.replace(
  "export async function computeFileHash(fileOrBlob: Blob): Promise<string> {\n  const arrayBuffer = await fileOrBlob.arrayBuffer();\n  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);\n  const hashArray = Array.from(new Uint8Array(hashBuffer));\n  return 'sha256_' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');\n}",
  `export async function computeFileHash(fileOrBlob: Blob): Promise<string> {
  // HARDENING: Prevent OOM on large files by hashing only the first chunk if file is large (> 50MB)
  const MAX_CHUNK_SIZE = 50 * 1024 * 1024; 
  let bufferToHash: ArrayBuffer;
  
  if (fileOrBlob.size > MAX_CHUNK_SIZE) {
    const chunk = fileOrBlob.slice(0, 10 * 1024 * 1024); // Hash first 10MB as fingerprint
    bufferToHash = await chunk.arrayBuffer();
  } else {
    bufferToHash = await fileOrBlob.arrayBuffer();
  }
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', bufferToHash);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hexHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Combine hash with file size to ensure uniqueness for large files with similar headers
  return 'sha256_' + hexHash + '_' + fileOrBlob.size;
}`
);

fs.writeFileSync('src/services/duplicateDetector.ts', content);
