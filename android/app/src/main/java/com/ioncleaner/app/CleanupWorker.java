package com.ioncleaner.app;

import android.content.Context;
import android.util.Log;
import androidx.annotation.NonNull;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

public class CleanupWorker extends Worker {

    private static final String TAG = "CleanupWorker";

    public CleanupWorker(@NonNull Context context, @NonNull WorkerParameters workerParams) {
        super(context, workerParams);
    }


    
    private void deleteRecursive(java.io.File fileOrDirectory) {
        if (fileOrDirectory.isDirectory()) {
            java.io.File[] children = fileOrDirectory.listFiles();
            if (children != null) {
                for (java.io.File child : children) {
                    deleteRecursive(child);
                }
            }
        }
        fileOrDirectory.delete();
    }

    private void cleanOldBackups() {
        Log.i(TAG, "Starting 30-day backup expiry cleanup...");
        try {
            java.io.File backupDir = new java.io.File(getApplicationContext().getExternalFilesDir(null), "ion_backups");
            if (backupDir != null && backupDir.isDirectory()) {
                java.io.File[] files = backupDir.listFiles();
                if (files != null) {
                    long thirtyDaysInMillis = 30L * 24 * 60 * 60 * 1000;
                    long cutoffTime = System.currentTimeMillis() - thirtyDaysInMillis;
                    int deletedCount = 0;
                    
                    for (java.io.File file : files) {
                        if (file.lastModified() < cutoffTime) {
                            if (file.delete()) {
                                deletedCount++;
                            }
                        }
                    }
                    Log.i(TAG, "Expiry cleanup completed. Deleted " + deletedCount + " old backups.");
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to clean old backups", e);
        }
    }

    @NonNull
    @Override
    public Result doWork() {
        Log.i(TAG, "Starting genuine background auto-cleanup task...");
        try {
            // Actually delete application cache files
            java.io.File cacheDir = getApplicationContext().getCacheDir();
            if (cacheDir != null && cacheDir.isDirectory()) {
                java.io.File[] files = cacheDir.listFiles();
                if (files != null) {
                    for (java.io.File file : files) {
                        deleteRecursive(file);
                    }
                }
            }
            
            // Delete temp files in external cache if available
            java.io.File extCacheDir = getApplicationContext().getExternalCacheDir();
            if (extCacheDir != null && extCacheDir.isDirectory()) {
                java.io.File[] files = extCacheDir.listFiles();
                if (files != null) {
                    for (java.io.File file : files) {
                        deleteRecursive(file);
                    }
                }
            }
            
            // 30-Day Backup Expiry logic
            cleanOldBackups();
            
            Log.i(TAG, "Background auto-cleanup task completed successfully.");
            return Result.success();
        } catch (Exception e) {
            Log.e(TAG, "Background task failed", e);
            return Result.failure();
        }
    }
}
