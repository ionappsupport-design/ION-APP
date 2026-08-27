package com.ioncleaner.app;

import android.Manifest;
import android.app.Activity;
import android.app.ActivityManager;
import android.app.PendingIntent;
import android.content.ContentResolver;
import android.content.ContentUris;
import android.content.Context;
import android.content.Intent;
import android.content.IntentSender;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.net.Uri;
import android.os.BatteryManager;
import android.os.Build;
import android.os.Environment;
import android.os.StatFs;
import android.provider.MediaStore;
import android.webkit.MimeTypeMap;
import androidx.activity.result.ActivityResult;
import androidx.activity.result.IntentSenderRequest;
import androidx.core.content.ContextCompat;
import androidx.documentfile.provider.DocumentFile;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.security.MessageDigest;
import java.util.ArrayList;
import androidx.work.ExistingPeriodicWorkPolicy;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;
import java.util.concurrent.TimeUnit;
import java.util.HashMap;
import java.util.List;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Base64;
import java.io.ByteArrayOutputStream;
import android.content.pm.PackageInfo;
import android.content.pm.ApplicationInfo;

@CapacitorPlugin(
    name = "IonNativeStorage",
    permissions = {
        @Permission(
            alias = "media_images",
            strings = { Manifest.permission.READ_MEDIA_IMAGES }
        ),
        @Permission(
            alias = "media_video",
            strings = { Manifest.permission.READ_MEDIA_VIDEO }
        ),
        @Permission(
            alias = "media_audio",
            strings = { Manifest.permission.READ_MEDIA_AUDIO }
        ),
        @Permission(
            alias = "publicStorage",
            strings = { Manifest.permission.READ_EXTERNAL_STORAGE, Manifest.permission.WRITE_EXTERNAL_STORAGE }
        )
    }
)
public class IonNativeStoragePlugin extends Plugin {

    private PluginCall activeDeleteCall = null;
    private List<Uri> pendingDeleteUris = new ArrayList<>();

    /**
     * Scan a specific path using the java.io.File API directly.
     * Works instantly if MANAGE_EXTERNAL_STORAGE is granted.
     */
    @PluginMethod
    public void scanSpecificFolder(PluginCall call) {
        String folderPath = call.getString("path");
        if (folderPath == null || folderPath.isEmpty()) {
            call.reject("Must provide a path to scan.");
            return;
        }

        File targetFolder = new File(Environment.getExternalStorageDirectory(), folderPath);
        JSArray filesArray = new JSArray();
        
        if (targetFolder.exists() && targetFolder.isDirectory()) {
            scanDirectoryRecursive(targetFolder, filesArray, 0);
        }

        JSObject result = new JSObject();
        result.put("files", filesArray);
        result.put("count", filesArray.length());
        call.resolve(result);
    }

    private void scanDirectoryRecursive(File dir, JSArray filesArray, int depth) {
        if (depth > 10 || dir == null || !dir.exists() || !dir.canRead()) return;
        File[] files = dir.listFiles();
        if (files == null) return;

        for (File f : files) {
            if (f.isDirectory()) {
                scanDirectoryRecursive(f, filesArray, depth + 1);
            } else {
                JSObject fileObj = new JSObject();
                fileObj.put("id", UUID.randomUUID().toString());
                fileObj.put("name", f.getName());
                fileObj.put("path", f.getAbsolutePath());
                fileObj.put("size", f.length());
                fileObj.put("nativeUri", Uri.fromFile(f).toString());
                
                String mimeType = "application/octet-stream";
                String ext = MimeTypeMap.getFileExtensionFromUrl(Uri.fromFile(f).toString());
                if (ext != null) {
                    String type = MimeTypeMap.getSingleton().getMimeTypeFromExtension(ext.toLowerCase());
                    if (type != null) {
                        mimeType = type;
                    }
                }
                fileObj.put("mimeType", mimeType);
                filesArray.put(fileObj);
            }
        }
    }

    /**
     * 1. Get real Android device storage capacity and usage using StatFs
     */
    @PluginMethod
    public void getStorageOverview(PluginCall call) {
        try {
            // Use external storage directory for StatFs to get accurate user storage stats
            File path = Environment.getExternalStorageDirectory();
            StatFs stat = new StatFs(path.getPath());

            long blockSize = stat.getBlockSizeLong();
            long totalBlocks = stat.getBlockCountLong();
            long availableBlocks = stat.getAvailableBlocksLong();

            long totalBytes = totalBlocks * blockSize;
            long availableBytes = availableBlocks * blockSize;
            long usedBytes = totalBytes - availableBytes;

            JSObject ret = new JSObject();
            ret.put("totalBytes", totalBytes);
            ret.put("usedBytes", usedBytes);
            ret.put("availableBytes", availableBytes);
            ret.put("isRealData", true);
            ret.put("storageApiSource", "android_native");
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to query native storage overview: " + e.getMessage());
        }
    }

    /**
     * 2. Get real device RAM and battery status from Android system services
     */
    @PluginMethod
    public void getSystemMetrics(PluginCall call) {
        try {
            Context context = getContext();
            ActivityManager activityManager = (ActivityManager) context.getSystemService(Context.ACTIVITY_SERVICE);
            ActivityManager.MemoryInfo memoryInfo = new ActivityManager.MemoryInfo();
            activityManager.getMemoryInfo(memoryInfo);

            long totalRamBytes = memoryInfo.totalMem;
            long availRamBytes = memoryInfo.availMem;
            long usedRamBytes = totalRamBytes - availRamBytes;
            double ramPercent = ((double) usedRamBytes / (double) totalRamBytes) * 100.0;

            // Battery info
            BatteryManager batteryManager = (BatteryManager) context.getSystemService(Context.BATTERY_SERVICE);
            int batteryLevel = -1;
            boolean isCharging = false;
            if (batteryManager != null) {
                batteryLevel = batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY);
                int status = batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_STATUS);
                isCharging = (status == BatteryManager.BATTERY_STATUS_CHARGING || status == BatteryManager.BATTERY_STATUS_FULL);
            }

            int cpuCores = Runtime.getRuntime().availableProcessors();

            JSObject ret = new JSObject();
            ret.put("ramTotalBytes", totalRamBytes);
            ret.put("ramAvailableBytes", availRamBytes);
            ret.put("ramUsedBytes", usedRamBytes);
            ret.put("ramUsagePercent", Math.round(ramPercent));
            ret.put("batteryLevel", batteryLevel >= 0 ? batteryLevel : null);
            ret.put("isCharging", isCharging);
            ret.put("cpuCores", cpuCores);
            ret.put("lowMemory", memoryInfo.lowMemory);
            ret.put("osVersion", "Android " + Build.VERSION.RELEASE + " (API " + Build.VERSION.SDK_INT + ")");

            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to query native system metrics: " + e.getMessage());
        }
    }

    /**
     * 3. Check current Android storage/media permissions
     */
    @PluginMethod
    public void checkStoragePermissions(PluginCall call) {
        JSObject ret = new JSObject();
        boolean isTiramisuOrHigher = Build.VERSION.SDK_INT >= 33; // Android 13+

        if (isTiramisuOrHigher) {
            boolean images = ContextCompat.checkSelfPermission(getContext(), Manifest.permission.READ_MEDIA_IMAGES) == PackageManager.PERMISSION_GRANTED;
            boolean video = ContextCompat.checkSelfPermission(getContext(), Manifest.permission.READ_MEDIA_VIDEO) == PackageManager.PERMISSION_GRANTED;
            boolean audio = ContextCompat.checkSelfPermission(getContext(), Manifest.permission.READ_MEDIA_AUDIO) == PackageManager.PERMISSION_GRANTED;
            boolean partial = Build.VERSION.SDK_INT >= 34 && ContextCompat.checkSelfPermission(getContext(), "android.permission.READ_MEDIA_VISUAL_USER_SELECTED") == PackageManager.PERMISSION_GRANTED;

            ret.put("images", images || partial);
            ret.put("video", video || partial);
            ret.put("audio", audio);
            ret.put("granted", images || video || audio || partial);
            ret.put("isTiramisu", true);
        } else {
            boolean readStorage = ContextCompat.checkSelfPermission(getContext(), Manifest.permission.READ_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED;
            ret.put("images", readStorage);
            ret.put("video", readStorage);
            ret.put("audio", readStorage);
            ret.put("granted", readStorage);
            ret.put("isTiramisu", false);
        }

        call.resolve(ret);
    }

    /**
     * 4. Request storage permissions based on Android version
     */
    @PluginMethod
    public void requestStoragePermissions(PluginCall call) {
        boolean isTiramisuOrHigher = Build.VERSION.SDK_INT >= 33;

        if (isTiramisuOrHigher) {
            requestPermissionForAliases(new String[]{"media_images", "media_video", "media_audio"}, call, "mediaPermissionsCallback");
        } else {
            requestPermissionForAlias("publicStorage", call, "legacyStorageCallback");
        }
    }

    @PermissionCallback
    private void mediaPermissionsCallback(PluginCall call) {
        checkStoragePermissions(call);
    }

    @PermissionCallback
    private void legacyStorageCallback(PluginCall call) {
        checkStoragePermissions(call);
    }

    @PluginMethod
    public void requestManageExternalStorage(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            if (!Environment.isExternalStorageManager()) {
                try {
                    Intent intent = new Intent(android.provider.Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION);
                    intent.addCategory("android.intent.category.DEFAULT");
                    intent.setData(Uri.parse(String.format("package:%s", getContext().getPackageName())));
                    startActivityForResult(call, intent, "manageStorageCallback");
                    return;
                } catch (Exception e) {
                    Intent intent = new Intent(android.provider.Settings.ACTION_MANAGE_ALL_FILES_ACCESS_PERMISSION);
                    startActivityForResult(call, intent, "manageStorageCallback");
                    return;
                }
            } else {
                JSObject ret = new JSObject();
                ret.put("granted", true);
                call.resolve(ret);
            }
        } else {
            // Below Android 11, normal permissions apply
            JSObject ret = new JSObject();
            ret.put("granted", true);
            call.resolve(ret);
        }
    }

    @ActivityCallback
    private void manageStorageCallback(PluginCall call, ActivityResult result) {
        JSObject ret = new JSObject();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            ret.put("granted", Environment.isExternalStorageManager());
        } else {
            ret.put("granted", true);
        }
        call.resolve(ret);
    }

    /**
     * 5. Real native scan of Android MediaStore (Images, Videos, Audio)
     */
    @PluginMethod
    public void scanMediaStore(PluginCall call) {
        int imgLimit = call.getInt("imageLimit", 5000);
        int imgOffset = call.getInt("imageOffset", 0);
        int vidLimit = call.getInt("videoLimit", 2000);
        int vidOffset = call.getInt("videoOffset", 0);
        int audLimit = call.getInt("audioLimit", 2000);
        int audOffset = call.getInt("audioOffset", 0);
        int docLimit = call.getInt("documentLimit", 2000);
        int docOffset = call.getInt("documentOffset", 0);

        JSArray filesArray = new JSArray();
        int skippedCount = 0;
        long totalBytes = 0;
        long totalImageBytes = 0;
        long totalVideoBytes = 0;
        long totalAudioBytes = 0;
        long totalDocumentBytes = 0;
        int imgCount = 0;
        int vidCount = 0;
        int audCount = 0;
        int docCount = 0;

        ContentResolver resolver = getContext().getContentResolver();

        // 1. Scan Images
        try {
            Uri imageUri = MediaStore.Images.Media.EXTERNAL_CONTENT_URI;
            String[] projection = Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q ?
                new String[]{ MediaStore.Images.Media._ID, MediaStore.Images.Media.DISPLAY_NAME, MediaStore.Images.Media.SIZE, MediaStore.Images.Media.MIME_TYPE, MediaStore.Images.Media.DATE_MODIFIED, MediaStore.Images.Media.RELATIVE_PATH } :
                new String[]{ MediaStore.Images.Media._ID, MediaStore.Images.Media.DISPLAY_NAME, MediaStore.Images.Media.SIZE, MediaStore.Images.Media.MIME_TYPE, MediaStore.Images.Media.DATE_MODIFIED };

            try (Cursor cursor = resolver.query(imageUri, projection, null, null, MediaStore.Images.Media.DATE_MODIFIED + " DESC")) {
                if (cursor != null) {
                    int idCol = cursor.getColumnIndexOrThrow(MediaStore.Images.Media._ID);
                    int nameCol = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.DISPLAY_NAME);
                    int sizeCol = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.SIZE);
                    int mimeCol = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.MIME_TYPE);
                    int dateCol = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.DATE_MODIFIED);
                    int relPathCol = Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q ? cursor.getColumnIndex(MediaStore.Images.Media.RELATIVE_PATH) : -1;

                    while (cursor.moveToNext()) {
                        try {
                            long size = !cursor.isNull(sizeCol) ? Math.max(0, cursor.getLong(sizeCol)) : 0;
                            totalImageBytes += size;
                            totalBytes += size;
                            
                            if (cursor.getPosition() < imgOffset) continue;
                            if (imgCount >= imgLimit) break;
                            imgCount++;

                            long id = cursor.getLong(idCol);
                            String name = !cursor.isNull(nameCol) ? cursor.getString(nameCol) : ("image_" + id);
                            String mimeType = !cursor.isNull(mimeCol) ? cursor.getString(mimeCol) : "image/jpeg";
                            long dateModified = !cursor.isNull(dateCol) ? cursor.getLong(dateCol) : (System.currentTimeMillis() / 1000L);
                            String relPath = (relPathCol != -1 && !cursor.isNull(relPathCol)) ? cursor.getString(relPathCol) : "";

                            if (name == null || name.trim().isEmpty()) name = "image_" + id;
                            if (mimeType == null || mimeType.trim().isEmpty()) mimeType = "image/jpeg";

                            Uri contentUri = ContentUris.withAppendedId(imageUri, id);
                            boolean isScreenshot = (relPath != null && relPath.toLowerCase().contains("screenshot")) ||
                                                   name.toLowerCase().contains("screenshot");

                            JSObject fileObj = new JSObject();
                            fileObj.put("id", "mediastore_img_" + id);
                            fileObj.put("name", name);
                            fileObj.put("size", size);
                            fileObj.put("path", relPath != null && !relPath.isEmpty() ? relPath + name : name);
                            fileObj.put("source", "native");
                            fileObj.put("storageSource", "mediastore");
                            fileObj.put("nativeUri", contentUri.toString());
                            fileObj.put("mediaStoreId", String.valueOf(id));
                            fileObj.put("category", isScreenshot ? "screenshot" : "image");
                            fileObj.put("mimeType", mimeType);
                            fileObj.put("lastModified", dateModified * 1000L);
                            fileObj.put("securityStatus", "safe");
                            fileObj.put("isJunk", false);

                            filesArray.put(fileObj);
                        } catch (Throwable itemEx) {
                            skippedCount++;
                        }
                    }
                }
            }
        } catch (Throwable e) {
            e.printStackTrace();
            call.reject("Image scan failed: " + e.getMessage());
            return;
        }

        // 2. Scan Videos
        try {
            Uri videoUri = MediaStore.Video.Media.EXTERNAL_CONTENT_URI;
            String[] projection = Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q ?
                new String[]{ MediaStore.Video.Media._ID, MediaStore.Video.Media.DISPLAY_NAME, MediaStore.Video.Media.SIZE, MediaStore.Video.Media.MIME_TYPE, MediaStore.Video.Media.DATE_MODIFIED, MediaStore.Video.Media.RELATIVE_PATH } :
                new String[]{ MediaStore.Video.Media._ID, MediaStore.Video.Media.DISPLAY_NAME, MediaStore.Video.Media.SIZE, MediaStore.Video.Media.MIME_TYPE, MediaStore.Video.Media.DATE_MODIFIED };

            try (Cursor cursor = resolver.query(videoUri, projection, null, null, MediaStore.Video.Media.SIZE + " DESC")) { // Sort by size DESC
                if (cursor != null) {
                    int idCol = cursor.getColumnIndexOrThrow(MediaStore.Video.Media._ID);
                    int nameCol = cursor.getColumnIndexOrThrow(MediaStore.Video.Media.DISPLAY_NAME);
                    int sizeCol = cursor.getColumnIndexOrThrow(MediaStore.Video.Media.SIZE);
                    int mimeCol = cursor.getColumnIndexOrThrow(MediaStore.Video.Media.MIME_TYPE);
                    int dateCol = cursor.getColumnIndexOrThrow(MediaStore.Video.Media.DATE_MODIFIED);
                    int relPathCol = Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q ? cursor.getColumnIndex(MediaStore.Video.Media.RELATIVE_PATH) : -1;

                    while (cursor.moveToNext()) {
                        try {
                            long size = !cursor.isNull(sizeCol) ? Math.max(0, cursor.getLong(sizeCol)) : 0;
                            totalVideoBytes += size;
                            totalBytes += size;
                            
                            if (cursor.getPosition() < vidOffset) continue;
                            if (vidCount >= vidLimit) break;
                            vidCount++;

                            long id = cursor.getLong(idCol);
                            String name = !cursor.isNull(nameCol) ? cursor.getString(nameCol) : ("video_" + id);
                            String mimeType = !cursor.isNull(mimeCol) ? cursor.getString(mimeCol) : "video/mp4";
                            long dateModified = !cursor.isNull(dateCol) ? cursor.getLong(dateCol) : (System.currentTimeMillis() / 1000L);
                            String relPath = (relPathCol != -1 && !cursor.isNull(relPathCol)) ? cursor.getString(relPathCol) : "";

                            if (name == null || name.trim().isEmpty()) name = "video_" + id;
                            if (mimeType == null || mimeType.trim().isEmpty()) mimeType = "video/mp4";

                            Uri contentUri = ContentUris.withAppendedId(videoUri, id);
                            boolean isLarge = size > 50 * 1024 * 1024; // >50MB

                            JSObject fileObj = new JSObject();
                            fileObj.put("id", "mediastore_vid_" + id);
                            fileObj.put("name", name);
                            fileObj.put("size", size);
                            fileObj.put("path", relPath != null && !relPath.isEmpty() ? relPath + name : name);
                            fileObj.put("source", "native");
                            fileObj.put("storageSource", "mediastore");
                            fileObj.put("nativeUri", contentUri.toString());
                            fileObj.put("mediaStoreId", String.valueOf(id));
                            fileObj.put("category", isLarge ? "large" : "video");
                            fileObj.put("mimeType", mimeType);
                            fileObj.put("lastModified", dateModified * 1000L);
                            fileObj.put("securityStatus", "safe");
                            fileObj.put("isJunk", false);

                            filesArray.put(fileObj);
                        } catch (Throwable itemEx) {
                            skippedCount++;
                        }
                    }
                }
            }
        } catch (Throwable e) {
            e.printStackTrace();
            call.reject("Video scan failed: " + e.getMessage());
            return;
        }

        // 3. Scan Audio
        try {
            Uri audioUri = MediaStore.Audio.Media.EXTERNAL_CONTENT_URI;
            String[] projection = Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q ?
                new String[]{ MediaStore.Audio.Media._ID, MediaStore.Audio.Media.DISPLAY_NAME, MediaStore.Audio.Media.SIZE, MediaStore.Audio.Media.MIME_TYPE, MediaStore.Audio.Media.DATE_MODIFIED, MediaStore.Audio.Media.RELATIVE_PATH } :
                new String[]{ MediaStore.Audio.Media._ID, MediaStore.Audio.Media.DISPLAY_NAME, MediaStore.Audio.Media.SIZE, MediaStore.Audio.Media.MIME_TYPE, MediaStore.Audio.Media.DATE_MODIFIED };

            try (Cursor cursor = resolver.query(audioUri, projection, null, null, MediaStore.Audio.Media.DATE_MODIFIED + " DESC")) {
                if (cursor != null) {
                    int idCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media._ID);
                    int nameCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.DISPLAY_NAME);
                    int sizeCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.SIZE);
                    int mimeCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.MIME_TYPE);
                    int dateCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.DATE_MODIFIED);
                    int relPathCol = Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q ? cursor.getColumnIndex(MediaStore.Audio.Media.RELATIVE_PATH) : -1;

                    while (cursor.moveToNext()) {
                        try {
                            long size = !cursor.isNull(sizeCol) ? Math.max(0, cursor.getLong(sizeCol)) : 0;
                            totalAudioBytes += size;
                            totalBytes += size;
                            
                            if (cursor.getPosition() < audOffset) continue;
                            if (audCount >= audLimit) break;
                            audCount++;

                            long id = cursor.getLong(idCol);
                            String name = !cursor.isNull(nameCol) ? cursor.getString(nameCol) : ("audio_" + id);
                            String mimeType = !cursor.isNull(mimeCol) ? cursor.getString(mimeCol) : "audio/mpeg";
                            long dateModified = !cursor.isNull(dateCol) ? cursor.getLong(dateCol) : (System.currentTimeMillis() / 1000L);
                            String relPath = (relPathCol != -1 && !cursor.isNull(relPathCol)) ? cursor.getString(relPathCol) : "";

                            if (name == null || name.trim().isEmpty()) name = "audio_" + id;
                            if (mimeType == null || mimeType.trim().isEmpty()) mimeType = "audio/mpeg";

                            Uri contentUri = ContentUris.withAppendedId(audioUri, id);

                            JSObject fileObj = new JSObject();
                            fileObj.put("id", "mediastore_aud_" + id);
                            fileObj.put("name", name);
                            fileObj.put("size", size);
                            fileObj.put("path", relPath != null && !relPath.isEmpty() ? relPath + name : name);
                            fileObj.put("source", "native");
                            fileObj.put("storageSource", "mediastore");
                            fileObj.put("nativeUri", contentUri.toString());
                            fileObj.put("mediaStoreId", String.valueOf(id));
                            fileObj.put("category", "audio");
                            fileObj.put("mimeType", mimeType);
                            fileObj.put("lastModified", dateModified * 1000L);
                            fileObj.put("securityStatus", "safe");
                            fileObj.put("isJunk", false);

                            filesArray.put(fileObj);
                        } catch (Throwable itemEx) {
                            skippedCount++;
                        }
                    }
                }
            }
        } catch (Throwable e) {
            e.printStackTrace();
            call.reject("Audio scan failed: " + e.getMessage());
            return;
        }

        // 4. Scan Documents (PDFs, Word, Excel, Text)
        try {
            Uri filesUri = MediaStore.Files.getContentUri("external");
            String[] projection = Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q ?
                new String[]{ MediaStore.MediaColumns._ID, MediaStore.MediaColumns.DISPLAY_NAME, MediaStore.MediaColumns.SIZE, MediaStore.MediaColumns.MIME_TYPE, MediaStore.MediaColumns.DATE_MODIFIED, MediaStore.MediaColumns.RELATIVE_PATH } :
                new String[]{ MediaStore.MediaColumns._ID, MediaStore.MediaColumns.DISPLAY_NAME, MediaStore.MediaColumns.SIZE, MediaStore.MediaColumns.MIME_TYPE, MediaStore.MediaColumns.DATE_MODIFIED };

            String selection = MediaStore.MediaColumns.DISPLAY_NAME + " LIKE '%.pdf' OR " +
                               MediaStore.MediaColumns.DISPLAY_NAME + " LIKE '%.doc' OR " +
                               MediaStore.MediaColumns.DISPLAY_NAME + " LIKE '%.docx' OR " +
                               MediaStore.MediaColumns.DISPLAY_NAME + " LIKE '%.xls' OR " +
                               MediaStore.MediaColumns.DISPLAY_NAME + " LIKE '%.xlsx' OR " +
                               MediaStore.MediaColumns.DISPLAY_NAME + " LIKE '%.txt' OR " +
                               MediaStore.MediaColumns.DISPLAY_NAME + " LIKE '%.csv' OR " +
                               MediaStore.MediaColumns.DISPLAY_NAME + " LIKE '%.zip' OR " +
                               MediaStore.MediaColumns.DISPLAY_NAME + " LIKE '%.rar'";

            try (Cursor cursor = resolver.query(filesUri, projection, selection, null, MediaStore.MediaColumns.DATE_MODIFIED + " DESC")) {
                if (cursor != null) {
                    int idCol = cursor.getColumnIndexOrThrow(MediaStore.MediaColumns._ID);
                    int nameCol = cursor.getColumnIndexOrThrow(MediaStore.MediaColumns.DISPLAY_NAME);
                    int sizeCol = cursor.getColumnIndexOrThrow(MediaStore.MediaColumns.SIZE);
                    int mimeCol = cursor.getColumnIndexOrThrow(MediaStore.MediaColumns.MIME_TYPE);
                    int dateCol = cursor.getColumnIndexOrThrow(MediaStore.MediaColumns.DATE_MODIFIED);
                    int relPathCol = Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q ? cursor.getColumnIndex(MediaStore.MediaColumns.RELATIVE_PATH) : -1;

                    while (cursor.moveToNext()) {
                        try {
                            long size = !cursor.isNull(sizeCol) ? Math.max(0, cursor.getLong(sizeCol)) : 0;
                            totalDocumentBytes += size;
                            totalBytes += size;
                            
                            if (cursor.getPosition() < docOffset) continue;
                            if (docCount >= docLimit) break;
                            docCount++;

                            long id = cursor.getLong(idCol);
                            String name = !cursor.isNull(nameCol) ? cursor.getString(nameCol) : ("document_" + id);
                            String mimeType = !cursor.isNull(mimeCol) ? cursor.getString(mimeCol) : "application/pdf";
                            long dateModified = !cursor.isNull(dateCol) ? cursor.getLong(dateCol) : (System.currentTimeMillis() / 1000L);
                            String relPath = (relPathCol != -1 && !cursor.isNull(relPathCol)) ? cursor.getString(relPathCol) : "";

                            if (name == null || name.trim().isEmpty()) name = "document_" + id;
                            if (mimeType == null || mimeType.trim().isEmpty()) mimeType = "application/pdf";

                            Uri contentUri = ContentUris.withAppendedId(filesUri, id);

                            JSObject fileObj = new JSObject();
                            fileObj.put("id", "mediastore_doc_" + id);
                            fileObj.put("name", name);
                            fileObj.put("size", size);
                            fileObj.put("path", relPath != null && !relPath.isEmpty() ? relPath + name : name);
                            fileObj.put("source", "native");
                            fileObj.put("storageSource", "mediastore");
                            fileObj.put("nativeUri", contentUri.toString());
                            fileObj.put("mediaStoreId", String.valueOf(id));
                            fileObj.put("category", "document");
                            fileObj.put("mimeType", mimeType);
                            fileObj.put("lastModified", dateModified * 1000L);
                            fileObj.put("securityStatus", "safe");
                            fileObj.put("isJunk", false);

                            filesArray.put(fileObj);
                        } catch (Throwable itemEx) {
                            skippedCount++;
                        }
                    }
                }
            }
        } catch (Throwable e) {
            skippedCount++;
        }

        JSObject result = new JSObject();
        result.put("files", filesArray);
        result.put("count", filesArray.length());
        result.put("totalBytes", totalBytes);
        result.put("skippedCount", skippedCount);
        
        result.put("imageBytes", totalImageBytes);
        result.put("videoBytes", totalVideoBytes);
        result.put("audioBytes", totalAudioBytes);
        result.put("documentBytes", totalDocumentBytes);
        call.resolve(result);
    }

    /**
     * 6. Real MediaStore Physical File Deletion (Android 11+ Scoped Storage & Android 10-)
     */
    @PluginMethod
    public void deleteMediaItems(PluginCall call) {
        JSArray urisJson = call.getArray("uris");
        if (urisJson == null) {
            call.reject("uris array is required");
            return;
        }

        List<Uri> urisToDelete = new ArrayList<>();
        for (int i = 0; i < urisJson.length(); i++) {
            try {
                String uriStr = urisJson.getString(i);
                if (uriStr != null && !uriStr.isEmpty()) {
                    urisToDelete.add(Uri.parse(uriStr));
                }
            } catch (Exception e) {
                // Ignore single malformed uri
            }
        }

        if (urisToDelete.isEmpty()) {
            JSObject res = new JSObject();
            res.put("deletedCount", 0);
            res.put("success", true);
            call.resolve(res);
            return;
        }

        ContentResolver resolver = getContext().getContentResolver();
        int count = 0;

        for (Uri u : urisToDelete) {
            try {
                if ("file".equals(u.getScheme())) {
                    File f = new File(u.getPath());
                    if (f.exists()) {
                        if (f.delete()) count++;
                    } else {
                        count++;
                    }
                } else {
                    // Try to get the physical file path first
                    String filePath = null;
                    try (Cursor c = resolver.query(u, new String[]{MediaStore.MediaColumns.DATA}, null, null, null)) {
                        if (c != null && c.moveToFirst()) {
                            int dataIndex = c.getColumnIndex(MediaStore.MediaColumns.DATA);
                            if (dataIndex != -1) {
                                filePath = c.getString(dataIndex);
                            }
                        }
                    } catch (Exception e) {}

                    // Attempt MediaStore delete
                    int deleted = resolver.delete(u, null, null);
                    
                    if (deleted > 0) {
                        count++;
                    } else if (filePath != null) {
                        // Fallback: try deleting the physical file directly if MediaStore fails
                        File f = new File(filePath);
                        if (f.exists() && f.delete()) {
                            count++;
                        }
                    }
                }
            } catch (Exception e) {
                // Fallback attempt for SecurityException (Android 11+ without manage external storage)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R && e instanceof SecurityException) {
                    try {
                        // On Android 11+, if we lack MANAGE_EXTERNAL_STORAGE, we must use createDeleteRequest.
                        // However, the app requests MANAGE_EXTERNAL_STORAGE. If we reach here, it failed.
                        // We will add it to the pending list for an activity callback if we wanted to support it,
                        // but since we process synchronously, we just count this as a failure.
                    } catch (Exception ex) {}
                }
                // Inaccessible or deleted already
            }
        }

        JSObject ret = new JSObject();
        ret.put("deletedCount", count);
        ret.put("success", count > 0 || urisToDelete.isEmpty());
        call.resolve(ret);
    }

    /**
     * 7. Real SAF Physical File Deletion
     */
    @PluginMethod
    public void deleteSafDocument(PluginCall call) {
        String documentUriStr = call.getString("documentUri");
        if (documentUriStr == null || documentUriStr.isEmpty()) {
            call.reject("documentUri is required");
            return;
        }

        try {
            Uri docUri = Uri.parse(documentUriStr);
            DocumentFile doc = DocumentFile.fromSingleUri(getContext(), docUri);
            boolean deleted = false;
            if (doc != null && doc.exists()) {
                deleted = doc.delete();
            }

            JSObject ret = new JSObject();
            ret.put("success", deleted);
            ret.put("documentUri", documentUriStr);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to delete SAF document: " + e.getMessage());
        }
    }

    /**
     * 8. Real Local Backup File Operation with SHA-256 byte verification
     */
    @PluginMethod
    public void backupFile(PluginCall call) {
        String uriStr = call.getString("uri");
        String fileName = call.getString("fileName");

        if (uriStr == null || fileName == null) {
            call.reject("uri and fileName are required");
            return;
        }

        try {
            Context context = getContext();
            File backupDir = new File(context.getExternalFilesDir(null), "ion_backups");
            if (!backupDir.exists()) {
                backupDir.mkdirs();
            }

            File destFile = new File(backupDir, System.currentTimeMillis() + "_" + fileName);
            Uri srcUri = Uri.parse(uriStr);

            long bytesCopied = 0;
            MessageDigest digest = MessageDigest.getInstance("SHA-256");

            try (InputStream in = context.getContentResolver().openInputStream(srcUri);
                 OutputStream out = new FileOutputStream(destFile)) {

                if (in == null) {
                    call.reject("Unable to open source input stream for URI: " + uriStr);
                    return;
                }

                byte[] buffer = new byte[8192];
                int read;
                while ((read = in.read(buffer)) != -1) {
                    out.write(buffer, 0, read);
                    digest.update(buffer, 0, read);
                    bytesCopied += read;
                }
            }

            byte[] hashBytes = digest.digest();
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }

            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("backupPath", destFile.getAbsolutePath());
            ret.put("bytesCopied", bytesCopied);
            ret.put("checksumSha256", sb.toString());
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Backup operation failed: " + e.getMessage());
        }
    }

    /**
     * 9. Launch SAF Tree Picker
     */
    @PluginMethod
    public void openDocumentTree(PluginCall call) {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE);
        intent.addFlags(
            Intent.FLAG_GRANT_READ_URI_PERMISSION |
            Intent.FLAG_GRANT_WRITE_URI_PERMISSION |
            Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION |
            Intent.FLAG_GRANT_PREFIX_URI_PERMISSION
        );

        String initialUriStr = call.getString("initialUri");
        if (initialUriStr != null && !initialUriStr.isEmpty()) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                intent.putExtra("android.provider.extra.INITIAL_URI", Uri.parse(initialUriStr));
            }
        }

        startActivityForResult(call, intent, "openDocumentTreeCallback");
    }

    @ActivityCallback
    private void openDocumentTreeCallback(PluginCall call, ActivityResult result) {
        if (result.getResultCode() == Activity.RESULT_OK && result.getData() != null) {
            Uri treeUri = result.getData().getData();
            if (treeUri != null) {
                try {
                    int takeFlags = result.getData().getFlags() & (Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
                    if (takeFlags == 0) {
                        takeFlags = Intent.FLAG_GRANT_READ_URI_PERMISSION;
                    }
                    getContext().getContentResolver().takePersistableUriPermission(treeUri, takeFlags);
                } catch (Exception e) {
                    // Ignore persistable error if not supported
                }

                JSObject ret = new JSObject();
                ret.put("treeUri", treeUri.toString());
                ret.put("cancelled", false);
                call.resolve(ret);
                return;
            }
        }

        JSObject ret = new JSObject();
        ret.put("cancelled", true);
        call.resolve(ret);
    }

    /**
     * 10. Scan SAF Document Tree
     */
    @PluginMethod
    public void scanDocumentTree(PluginCall call) {
        String treeUriStr = call.getString("treeUri");
        if (treeUriStr == null || treeUriStr.isEmpty()) {
            call.reject("treeUri is required");
            return;
        }

        int limit = call.getInt("limit", 1000);
        int offset = call.getInt("offset", 0);

        try {
            Uri treeUri = Uri.parse(treeUriStr);
            DocumentFile root = DocumentFile.fromTreeUri(getContext(), treeUri);

            if (root == null || !root.exists() || !root.isDirectory()) {
                call.reject("Invalid or inaccessible SAF root directory");
                return;
            }

            JSArray filesArray = new JSArray();
            int[] counters = new int[]{0, 0, 0}; // [0] = file count, [1] = skipped count, [2] = global index
            long[] totalBytes = new long[]{0};

            traverseSafDirectory(root, "", filesArray, counters, totalBytes, 0, 5, limit, offset);

            JSObject ret = new JSObject();
            ret.put("files", filesArray);
            ret.put("count", counters[0]);
            ret.put("skippedCount", counters[1]);
            ret.put("totalBytes", totalBytes[0]);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to scan SAF tree: " + e.getMessage());
        }
    }

    private void traverseSafDirectory(DocumentFile dir, String relativePath, JSArray filesArray, int[] counters, long[] totalBytes, int currentDepth, int maxDepth, int limit, int offset) {
        if (currentDepth > maxDepth || dir == null) return;
        if (counters[0] >= limit) return; // limit reached

        DocumentFile[] files = null;
        try {
            files = dir.listFiles();
        } catch (Exception e) {
            counters[1]++;
            return;
        }

        if (files == null) return;

        for (DocumentFile file : files) {
            if (file == null) continue;
            if (counters[0] >= limit) break; // limit reached

            try {
                String name = file.getName();
                if (name == null || name.trim().isEmpty()) {
                    counters[1]++;
                    continue;
                }

                if (file.isDirectory()) {
                    traverseSafDirectory(file, relativePath + name + "/", filesArray, counters, totalBytes, currentDepth + 1, maxDepth, limit, offset);
                } else if (file.isFile()) {
                    // Pagination logic
                    if (counters[2] < offset) {
                        counters[2]++;
                        continue;
                    }
                    counters[2]++; // increment global index

                    long size = Math.max(0, file.length());
                    long lastModified = file.lastModified();
                    String mimeType = file.getType();
                    Uri uri = file.getUri();

                    if (mimeType == null || mimeType.trim().isEmpty()) mimeType = "application/octet-stream";

                    String ext = "";
                    int lastDot = name.lastIndexOf('.');
                    if (lastDot > 0 && lastDot < name.length() - 1) {
                        ext = name.substring(lastDot + 1).toLowerCase();
                    }

                    String category = "document";
                    boolean isJunk = false;
                    String junkType = null;

                    if (mimeType.startsWith("image/") || ext.matches("jpg|jpeg|png|webp|gif|heic|svg")) {
                        category = name.toLowerCase().contains("screenshot") ? "screenshot" : "image";
                    } else if (mimeType.startsWith("video/") || ext.matches("mp4|mkv|mov|avi|webm|3gp")) {
                     category = (size > 20 * 1024 * 1024) ? "large" : "video";
                    } else if (mimeType.startsWith("audio/") || ext.matches("mp3|wav|m4a|flac|aac|ogg")) {
                        category = "audio";
                    } else if (ext.matches("tmp|temp|cache|log|bak|part|thumb")) {
                        category = "cache";
                        isJunk = true;
                        junkType = "system_cache";
                    } else if (ext.matches("apk|xapk")) {
                        category = "junk";
                        isJunk = true;
                        junkType = "app_residual";
                    }

                    JSObject fileObj = new JSObject();
                    fileObj.put("id", "saf_" + Math.abs(uri.toString().hashCode()) + "_" + name);
                    fileObj.put("name", name);
                    fileObj.put("size", size);
                    fileObj.put("path", relativePath + name);
                    fileObj.put("source", "native");
                    fileObj.put("storageSource", "saf");
                    fileObj.put("nativeUri", uri.toString());
                    fileObj.put("documentUri", uri.toString());
                    fileObj.put("category", category);
                    fileObj.put("mimeType", mimeType);
                    fileObj.put("lastModified", lastModified > 0 ? lastModified : System.currentTimeMillis());
                    fileObj.put("securityStatus", "safe");
                    fileObj.put("isJunk", isJunk);
                    if (junkType != null) {
                        fileObj.put("junkType", junkType);
                    }

                    filesArray.put(fileObj);
                    counters[0]++;
                    totalBytes[0] += size;
                }
            } catch (Exception e) {
                counters[1]++;
            }
        }
    }

    /**
     * 11. Real physical restore of backed up file to public Download / Pictures storage
     */
    @PluginMethod
    public void restoreFile(PluginCall call) {
        String backupPath = call.getString("backupPath");
        String originalName = call.getString("originalName");

        if (backupPath == null || originalName == null) {
            call.reject("backupPath and originalName are required");
            return;
        }

        try {
            File srcBackup = new File(backupPath);
            if (!srcBackup.exists()) {
                call.reject("Backup source file not found at " + backupPath);
                return;
            }

            File publicDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
            if (!publicDir.exists()) {
                publicDir.mkdirs();
            }

            File restoredFile = new File(publicDir, originalName);
            if (restoredFile.exists()) {
                restoredFile = new File(publicDir, "restored_" + System.currentTimeMillis() + "_" + originalName);
            }

            try (InputStream in = new FileInputStream(srcBackup);
                 OutputStream out = new FileOutputStream(restoredFile)) {
                byte[] buffer = new byte[8192];
                int read;
                while ((read = in.read(buffer)) != -1) {
                    out.write(buffer, 0, read);
                }
            }

            srcBackup.delete();

            // Notify Media Scanner so the OS gallery indices the restored file
            android.media.MediaScannerConnection.scanFile(getContext(),
                    new String[]{restoredFile.getAbsolutePath()},
                    null, null);

            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("restoredPath", restoredFile.getAbsolutePath());
            ret.put("fileName", restoredFile.getName());
            ret.put("size", restoredFile.length());
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Physical file restoration failed: " + e.getMessage());
        }
    }

    @PluginMethod
    public void getFileHash(PluginCall call) {
        String uriStr = call.getString("uri");
        if (uriStr == null) {
            call.reject("uri is required");
            return;
        }
        try {
            Uri srcUri = Uri.parse(uriStr);
            MessageDigest digest = MessageDigest.getInstance("MD5");
            try (InputStream in = getContext().getContentResolver().openInputStream(srcUri)) {
                byte[] buffer = new byte[8192];
                int read;
                while ((read = in.read(buffer)) != -1) {
                    digest.update(buffer, 0, read);
                }
            }
            byte[] hashBytes = digest.digest();
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }
            JSObject ret = new JSObject();
            ret.put("hash", sb.toString());
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Hashing failed: " + e.getMessage());
        }
    }

    @PluginMethod
    public void getBlurScore(PluginCall call) {
        String uriStr = call.getString("uri");
        if (uriStr == null) {
            call.reject("uri is required");
            return;
        }
        try {
            Uri srcUri = Uri.parse(uriStr);
            BitmapFactory.Options options = new BitmapFactory.Options();
            options.inSampleSize = 4; 
            Bitmap bitmap;
            try (InputStream in = getContext().getContentResolver().openInputStream(srcUri)) {
                bitmap = BitmapFactory.decodeStream(in, null, options);
            }
            
            if (bitmap == null) {
                call.reject("Failed to decode image");
                return;
            }

            int width = bitmap.getWidth();
            int height = bitmap.getHeight();
            int[] pixels = new int[width * height];
            bitmap.getPixels(pixels, 0, width, 0, 0, width, height);
            
            int[][] gray = new int[height][width];
            for (int y = 0; y < height; y++) {
                for (int x = 0; x < width; x++) {
                    int pixel = pixels[y * width + x];
                    int r = (pixel >> 16) & 0xff;
                    int g = (pixel >> 8) & 0xff;
                    int b = pixel & 0xff;
                    gray[y][x] = (r * 299 + g * 587 + b * 114) / 1000;
                }
            }

            long sum = 0;
            long sumSq = 0;
            int count = 0;
            for (int y = 1; y < height - 1; y++) {
                for (int x = 1; x < width - 1; x++) {
                    int laplacian = gray[y-1][x] + gray[y+1][x] + gray[y][x-1] + gray[y][x+1] - 4 * gray[y][x];
                    sum += laplacian;
                    sumSq += laplacian * laplacian;
                    count++;
                }
            }
            double mean = (double) sum / count;
            double variance = ((double) sumSq / count) - (mean * mean);
            
            bitmap.recycle();
            
            JSObject ret = new JSObject();
            ret.put("variance", (long) variance); 
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Blur detection failed: " + e.getMessage());
        }
    }

    @PluginMethod
    public void getPerceptualHash(PluginCall call) {
        String uriStr = call.getString("uri");
        if (uriStr == null) {
            call.reject("uri is required");
            return;
        }
        try {
            Uri srcUri = Uri.parse(uriStr);
            BitmapFactory.Options options = new BitmapFactory.Options();
            options.inSampleSize = 8;
            Bitmap bitmap;
            try (InputStream in = getContext().getContentResolver().openInputStream(srcUri)) {
                bitmap = BitmapFactory.decodeStream(in, null, options);
            }
            if (bitmap == null) {
                call.reject("Failed to decode image");
                return;
            }
            
            Bitmap scaled = Bitmap.createScaledBitmap(bitmap, 9, 8, true);
            bitmap.recycle();
            
            int width = scaled.getWidth();
            int height = scaled.getHeight();
            int[] pixels = new int[width * height];
            scaled.getPixels(pixels, 0, width, 0, 0, width, height);
            
            int[] gray = new int[width * height];
            for (int i = 0; i < pixels.length; i++) {
                int r = (pixels[i] >> 16) & 0xff;
                int g = (pixels[i] >> 8) & 0xff;
                int b = pixels[i] & 0xff;
                gray[i] = (r * 299 + g * 587 + b * 114) / 1000;
            }
            
            StringBuilder hash = new StringBuilder();
            for (int y = 0; y < height; y++) {
                for (int x = 0; x < width - 1; x++) {
                    int left = gray[y * width + x];
                    int right = gray[y * width + (x + 1)];
                    hash.append(left > right ? "1" : "0");
                }
            }
            scaled.recycle();
            
            JSObject ret = new JSObject();
            ret.put("hash", hash.toString());
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Hash failed: " + e.getMessage());
        }
    }

    @PluginMethod
    public void generateThumbnail(PluginCall call) {
        String uriStr = call.getString("uri");
        if (uriStr == null) {
            call.reject("uri is required");
            return;
        }
        try {
            Uri srcUri = Uri.parse(uriStr);
            BitmapFactory.Options options = new BitmapFactory.Options();
            options.inSampleSize = 8; // Small thumbnail
            Bitmap bitmap;
            try (InputStream in = getContext().getContentResolver().openInputStream(srcUri)) {
                bitmap = BitmapFactory.decodeStream(in, null, options);
            }
            
            if (bitmap != null) {
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                bitmap.compress(Bitmap.CompressFormat.JPEG, 60, baos);
                byte[] b = baos.toByteArray();
                String base64Image = Base64.encodeToString(b, Base64.DEFAULT);
                bitmap.recycle();
                
                JSObject ret = new JSObject();
                ret.put("thumbnail", "data:image/jpeg;base64," + base64Image);
                call.resolve(ret);
                return;
            }
            call.reject("Could not generate thumbnail");
        } catch (Exception e) {
            call.reject("Thumbnail failed: " + e.getMessage());
        }
    }

    @PluginMethod
    public void deleteBackupFile(PluginCall call) {
        String backupPath = call.getString("backupPath");
        if (backupPath == null) {
            call.reject("backupPath is required");
            return;
        }
        try {
            File f = new File(backupPath);
            boolean deleted = false;
            if (f.exists()) {
                deleted = f.delete();
            }
            JSObject ret = new JSObject();
            ret.put("success", deleted);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Delete backup failed: " + e.getMessage());
        }
    }

    @PluginMethod
    public void scanInstalledApps(PluginCall call) {
        try {
            PackageManager pm = getContext().getPackageManager();
            List<ApplicationInfo> packages = pm.getInstalledApplications(PackageManager.GET_META_DATA);
            JSArray apps = new JSArray();
            
            for (ApplicationInfo packageInfo : packages) {
                if ((packageInfo.flags & ApplicationInfo.FLAG_SYSTEM) == 0) {
                    JSObject app = new JSObject();
                    app.put("packageName", packageInfo.packageName);
                    app.put("name", pm.getApplicationLabel(packageInfo).toString());
                    
                    String installer = null;
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                        try {
                            installer = pm.getInstallSourceInfo(packageInfo.packageName).getInstallingPackageName();
                        } catch (Exception e) {}
                    } else {
                        installer = pm.getInstallerPackageName(packageInfo.packageName);
                    }
                    
                    boolean isUnknownSource = installer == null || 
                        (!installer.equals("com.android.vending") && 
                         !installer.equals("com.sec.android.app.samsungapps") &&
                         !installer.equals("com.amazon.venezia"));
                         
                    app.put("isUnknownSource", isUnknownSource);
                    
                    int riskScore = isUnknownSource ? 30 : 0;
                    try {
                        PackageInfo pi = pm.getPackageInfo(packageInfo.packageName, PackageManager.GET_PERMISSIONS);
                        if (pi.requestedPermissions != null) {
                            for (String p : pi.requestedPermissions) {
                                if (p.equals("android.permission.SEND_SMS") || 
                                    p.equals("android.permission.RECEIVE_SMS") ||
                                    p.equals("android.permission.SYSTEM_ALERT_WINDOW") ||
                                    p.equals("android.permission.READ_CALL_LOG") ||
                                    p.equals("android.permission.READ_CONTACTS")) {
                                    riskScore += 20;
                                }
                            }
                        }
                    } catch (Exception e) {}
                    
                    String status = "safe";
                    if (riskScore >= 70) status = "high_risk";
                    else if (riskScore >= 40) status = "medium_risk";
                    else if (riskScore >= 20) status = "low_risk";
                    
                    app.put("riskScore", riskScore);
                    app.put("securityStatus", status);
                    apps.put(app);
                }
            }
            
            JSObject ret = new JSObject();
            ret.put("apps", apps);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("App scan failed: " + e.getMessage());
        }
    }

    @PluginMethod
    public void analyzeApkFile(PluginCall call) {
        String uriStr = call.getString("uri");
        if (uriStr == null) {
            call.reject("uri is required");
            return;
        }
        try {
            Uri srcUri = Uri.parse(uriStr);
            File tempApk = new File(getContext().getCacheDir(), "temp.apk");
            try (InputStream in = getContext().getContentResolver().openInputStream(srcUri);
                 OutputStream out = new FileOutputStream(tempApk)) {
                byte[] buffer = new byte[8192];
                int read;
                while ((read = in.read(buffer)) != -1) {
                    out.write(buffer, 0, read);
                }
            }

            PackageManager pm = getContext().getPackageManager();
            PackageInfo pi = pm.getPackageArchiveInfo(tempApk.getAbsolutePath(), PackageManager.GET_PERMISSIONS | PackageManager.GET_SIGNATURES);
            
            JSObject ret = new JSObject();
            if (pi != null) {
                ret.put("packageName", pi.packageName);
                ret.put("versionName", pi.versionName);
                
                JSArray perms = new JSArray();
                int riskScore = 30; // Base score for side-loaded APK
                
                if (pi.requestedPermissions != null) {
                    for (String p : pi.requestedPermissions) {
                        perms.put(p);
                        if (p.equals("android.permission.SEND_SMS") || 
                            p.equals("android.permission.RECEIVE_SMS") ||
                            p.equals("android.permission.SYSTEM_ALERT_WINDOW") ||
                            p.equals("android.permission.READ_CALL_LOG") ||
                            p.equals("android.permission.READ_CONTACTS")) {
                            riskScore += 20;
                        }
                    }
                }
                ret.put("permissions", perms);
                
                String status = "safe";
                if (riskScore >= 70) status = "high_risk";
                else if (riskScore >= 40) status = "medium_risk";
                else if (riskScore >= 20) status = "low_risk";
                
                ret.put("riskScore", riskScore);
                ret.put("securityStatus", status);
            } else {
                ret.put("securityStatus", "unknown");
            }
            
            tempApk.delete();
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("APK analysis failed: " + e.getMessage());
        }
    }

    @PluginMethod
    public void compressVideo(PluginCall call) {
        String uriStr = call.getString("uri");
        String qualityStr = call.getString("quality", "medium");
        
        if (uriStr == null) {
            call.reject("uri is required");
            return;
        }
        
        try {
            Uri srcUri;
            if (uriStr.startsWith("/")) {
                srcUri = Uri.fromFile(new java.io.File(uriStr));
            } else {
                srcUri = Uri.parse(uriStr);
            }
            
            // Set Quality
            com.abedelazizshe.lightcompressorlibrary.VideoQuality vq = com.abedelazizshe.lightcompressorlibrary.VideoQuality.MEDIUM;
            if (qualityStr.equals("low")) vq = com.abedelazizshe.lightcompressorlibrary.VideoQuality.LOW;
            else if (qualityStr.equals("high")) vq = com.abedelazizshe.lightcompressorlibrary.VideoQuality.HIGH;
            else if (qualityStr.equals("very_high")) vq = com.abedelazizshe.lightcompressorlibrary.VideoQuality.VERY_HIGH;
            else if (qualityStr.equals("very_low")) vq = com.abedelazizshe.lightcompressorlibrary.VideoQuality.VERY_LOW;
            
            // Use constructor with nulls and falses
            com.abedelazizshe.lightcompressorlibrary.config.Configuration config = 
                new com.abedelazizshe.lightcompressorlibrary.config.Configuration(
                    vq, false, null, false, false, null, null, java.util.Collections.singletonList("compressed_video_" + System.currentTimeMillis()));
            
            // Call async compressor
            // Retain the call so it can be resolved asynchronously
            call.setKeepAlive(true);
            
            com.abedelazizshe.lightcompressorlibrary.VideoCompressor.start(
                getContext(),
                java.util.Collections.singletonList(srcUri),
                false, // isStreamable
                null, // sharedStorageConfiguration
                new com.abedelazizshe.lightcompressorlibrary.config.AppSpecificStorageConfiguration("ION"), // appSpecificStorageConfiguration
                config,
                new com.abedelazizshe.lightcompressorlibrary.CompressionListener() {
                    @Override
                    public void onStart(int index) {
                        // notify progress if needed
                    }
                    @Override
                    public void onSuccess(int index, long size, String path) {
                        JSObject ret = new JSObject();
                        ret.put("success", true);
                        ret.put("compressedPath", path);
                        ret.put("actualSize", size);
                        call.resolve(ret);
                    }
                    @Override
                    public void onFailure(int index, String failureMessage) {
                        call.reject("Compression failed: " + failureMessage);
                    }
                    @Override
                    public void onProgress(int index, float percent) {
                        JSObject ret = new JSObject();
                        ret.put("progress", percent);
                        notifyListeners("compressionProgress", ret);
                    }
                    @Override
                    public void onCancelled(int index) {
                        call.reject("Compression cancelled");
                    }
                }
            );
        } catch (Exception e) {
            call.reject("Video compression failed to start: " + e.getMessage());
        }
    }

    @PluginMethod
    public void scheduleAutoClean(PluginCall call) {
        int intervalHours = call.getInt("intervalHours", 24);
        
        try {
            PeriodicWorkRequest cleanWorkRequest =
                new PeriodicWorkRequest.Builder(CleanupWorker.class, intervalHours, TimeUnit.HOURS)
                    .build();

            WorkManager.getInstance(getContext()).enqueueUniquePeriodicWork(
                "IonAutoCleanWork",
                ExistingPeriodicWorkPolicy.REPLACE,
                cleanWorkRequest
            );

            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to schedule auto-clean: " + e.getMessage());
        }
    }

    @Override
    protected void handleOnActivityResult(int requestCode, int resultCode, Intent data) {
        super.handleOnActivityResult(requestCode, resultCode, data);
        
        if (requestCode == 10001) {
            PluginCall call = activeDeleteCall;
            activeDeleteCall = null;

            if (call == null) return;

            int deletedCount = 0;
            ContentResolver resolver = getContext().getContentResolver();

            if (resultCode == Activity.RESULT_OK) {
                for (Uri u : pendingDeleteUris) {
                    try (Cursor cursor = resolver.query(u, new String[]{MediaStore.MediaColumns._ID}, null, null, null)) {
                        if (cursor == null || !cursor.moveToFirst()) {
                            deletedCount++;
                        }
                    } catch (Exception e) {
                        deletedCount++;
                    }
                }
            }

            pendingDeleteUris.clear();

            JSObject ret = new JSObject();
            ret.put("deletedCount", deletedCount);
            ret.put("success", deletedCount > 0);
            ret.put("cancelled", resultCode != Activity.RESULT_OK);
            
            // Release keepAlive and resolve call
            call.setKeepAlive(false);
            call.resolve(ret);
        }
    }

    @PluginMethod
    public void saveVideoToGallery(PluginCall call) {
        String path = call.getString("path");
        if (path == null || path.isEmpty()) {
            call.reject("Path is required");
            return;
        }

        try {
            java.io.File sourceFile = new java.io.File(path);
            if (!sourceFile.exists()) {
                call.reject("Source file does not exist");
                return;
            }

            java.io.File moviesDir = android.os.Environment.getExternalStoragePublicDirectory(android.os.Environment.DIRECTORY_MOVIES);
            if (!moviesDir.exists()) {
                moviesDir.mkdirs();
            }

            String newFileName = "IonCompressed_" + System.currentTimeMillis() + ".mp4";
            java.io.File destFile = new java.io.File(moviesDir, newFileName);

            try (java.io.FileInputStream in = new java.io.FileInputStream(sourceFile);
                 java.io.FileOutputStream out = new java.io.FileOutputStream(destFile)) {

                byte[] buffer = new byte[8192]; // Optimize buffer size
                int length;
                while ((length = in.read(buffer)) > 0) {
                    out.write(buffer, 0, length);
                }
            }

            // Notify Media Scanner so it shows up in Gallery
            android.media.MediaScannerConnection.scanFile(getContext(),
                    new String[]{destFile.getAbsolutePath()},
                    new String[]{"video/mp4"}, null);

            JSObject res = new JSObject();
            res.put("success", true);
            res.put("newPath", destFile.getAbsolutePath());
            call.resolve(res);

        } catch (Exception e) {
            call.reject("Failed to save video: " + e.getMessage());
        }
    }
}
