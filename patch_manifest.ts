import fs from 'fs';
let content = fs.readFileSync('android/app/src/main/AndroidManifest.xml', 'utf8');
content = content.replace(
  '<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />',
  `<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />
    <uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />`
);
fs.writeFileSync('android/app/src/main/AndroidManifest.xml', content);
