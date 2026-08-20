import React, { useState, useEffect, useCallback } from 'react';
import { 
  checkNativePlatform, 
  requestNativeStoragePermissions, 
  scanNativeStorage, 
  scanUserSelectedNativeFolder,
  executePhysicalDeletion, 
  executeRealBackup 
} from './services/nativeStorageBridge';
import { Capacitor } from '@capacitor/core';
import { 
  NavigationTab, 
  ScannedFile, 
  StorageOverview, 
  DeviceSystemMetrics, 
  UserSettings,
  RecycleBinItem
} from './types';
import { App as CapacitorApp } from '@capacitor/app';
import { AndroidFrame } from './components/AndroidFrame';
import { SplashScreen } from './components/SplashScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { ScanScreen } from './components/ScanScreen';
import { ScanResultsScreen } from './components/ScanResultsScreen';
import { ReviewSelectScreen } from './components/ReviewSelectScreen';
import { DuplicateGroupScreen } from './components/DuplicateGroupScreen';
import { CleaningScreen } from './components/CleaningScreen';
import { CleanCompleteScreen } from './components/CleanCompleteScreen';
import { RecycleBinScreen } from './components/RecycleBinScreen';
import { VideoCompressorScreen } from './components/VideoCompressorScreen';
import { SocialCleanerScreen } from './components/SocialCleanerScreen';
import { StorageOverviewScreen } from './components/StorageOverviewScreen';
import { CategoryDetailScreen } from './components/CategoryDetailScreen';
import { MonthlyReportScreen } from './components/MonthlyReportScreen';
import { SecurityPrivacyScreen } from './components/SecurityPrivacyScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { NoItemsFoundScreen } from './components/NoItemsFoundScreen';
import { HelpSupportScreen } from './components/HelpSupportScreen';
import { NavigationDrawer } from './components/NavigationDrawer';

import { 
  INITIAL_DEVICE_FILES, 
  getRealStorageOverview, 
  generateSmartRecommendations 
} from './services/storageScanner';
import { getRealDeviceSystemMetrics } from './services/systemMonitor';
import { getNativeStorageOverview as getRealStorageOverviewBridge } from './services/nativeStorageBridge';
import { 
  getStoredNotifications, 
  sendSmartNotification 
} from './services/notificationService';
import { 
  loadRecycleBin, 
  addToRecycleBin, 
  restoreItemFromRecycleBin, 
  permanentlyDeleteFromBin, 
  clearEntireRecycleBin 
} from './services/recycleBinManager';

const FILES_STORAGE_KEY = 'ion_device_scanned_files_v4';
const SETTINGS_STORAGE_KEY = 'ion_user_settings_v3';
const LAST_SCAN_KEY = 'ion_last_scan_timestamp_v3';

export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<NavigationTab>('splash');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('images');
  const [selectedSocialCategoryFiles, setSelectedSocialCategoryFiles] = useState<ScannedFile[] | undefined>(undefined);
  const [categoryDetailBackTab, setCategoryDetailBackTab] = useState<NavigationTab>('storage_overview');

  // Staging for clean flow (Review -> Duplicate Group -> Backup -> Cleaning -> Complete)
  const [pendingCleanFiles, setPendingCleanFiles] = useState<ScannedFile[]>([]);
  const [lastFreedBytes, setLastFreedBytes] = useState<number>(0);
  const [lastFreedCount, setLastFreedCount] = useState<number>(0);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Handle Hardware Back Button
  useEffect(() => {
    const backButtonListener = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (currentTab === 'home' || currentTab === 'splash') {
        CapacitorApp.exitApp();
      } else if (currentTab === 'scan_results') {
        setCurrentTab('home');
      } else if (currentTab === 'review_select' || currentTab === 'social_cleaner') {
        setCurrentTab('scan_results');
      } else if (currentTab === 'duplicate_group') {
        setCurrentTab('review_select');
      } else if (currentTab === 'category_detail') {
        setCurrentTab(categoryDetailBackTab);
      } else if (currentTab === 'storage_overview' || currentTab === 'settings' || currentTab === 'security' || currentTab === 'monthly_report' || currentTab === 'recycle_bin' || currentTab === 'video_compressor') {
        setCurrentTab('home');
      } else if (currentTab === 'clean_complete') {
        setCurrentTab('home');
      } else if (currentTab === 'cleaning') {
        // Do nothing, block back button during cleaning
      } else if (currentTab === 'no_items_found') {
        setCurrentTab('home');
      } else if (currentTab === 'help_support') {
        setCurrentTab('settings');
      } else {
        if (!canGoBack) CapacitorApp.exitApp();
      }
    });

    return () => {
      backButtonListener.then(listener => listener.remove());
    };
  }, [currentTab]);


  // Recycle Bin State
  const [recycleBinItems, setRecycleBinItems] = useState<RecycleBinItem[]>(() => loadRecycleBin());

  // Core Data State
  const [isAppReady, setIsAppReady] = useState(false);
  const [isNativeScanning, setIsNativeScanning] = useState(false);
  const [files, setFiles] = useState<ScannedFile[]>(() => {
    try {
      const raw = localStorage.getItem(FILES_STORAGE_KEY);
      return raw ? JSON.parse(raw) : INITIAL_DEVICE_FILES;
    } catch {
      return INITIAL_DEVICE_FILES;
    }
  });

  const [lastScanTime, setLastScanTime] = useState<number | null>(() => {
    const raw = localStorage.getItem(LAST_SCAN_KEY);
    return raw ? parseInt(raw, 10) : null;
  });

  // Settings State
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // Fallback
    }
    return {
      theme: 'light',
      notificationsEnabled: true,
      lowStorageAlert: true,
      junkReminder: true,
      weeklyReport: true,
      hapticsEnabled: true,
    };
  });

  // System & Storage Metrics
  const [storageOverview, setStorageOverview] = useState<StorageOverview>({
    totalBytes: 0,
    usedBytes: 0,
    availableBytes: 0,
    usedPercentage: 0,
    isRealData: true,
    storageApiSource: 'android_native',
  });

  const [systemMetrics, setSystemMetrics] = useState<DeviceSystemMetrics>({
    ramTotalGb: null,
    ramAvailableGb: null,
    ramUsagePercent: null,
    cpuCores: null,
    cpuLoadPercent: null,
    batteryLevel: null,
    isCharging: false,
    chargingTime: null,
    storageTotalBytes: 0,
    storageUsedBytes: 0,
    performanceState: 'Optimal',
    advice: ['Storage headroom is healthy.'],
    batteryHealth: 'Good',
  });

  // Sync theme changes to HTML document element
  useEffect(() => {
    const applyTheme = () => {
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (settings.theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    applyTheme();

    if (settings.theme === 'system' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [settings.theme]);

  // Log App Opened Event & init metrics & auth session
  useEffect(() => {
                    Promise.all([
      getRealStorageOverview(files).then(overview => {
        setStorageOverview(overview);
        return getRealDeviceSystemMetrics(overview.totalBytes, overview.usedBytes).then(metrics => {
          setSystemMetrics(metrics);
        });
      }),
      Promise.resolve()
    ]).then(() => {
      setIsAppReady(true);
    }).catch((err) => {
      console.error("Startup error", err);
      setIsAppReady(true); // Ensure app still loads
    });
  }, []);

  // Sync files to storage
  const updateFiles = useCallback((newFiles: ScannedFile[]) => {
    setFiles(newFiles);
    try {
      localStorage.setItem(FILES_STORAGE_KEY, JSON.stringify(newFiles));
    } catch (err) {
      console.error('Failed to persist files:', err);
    }
    getRealStorageOverview(newFiles).then(setStorageOverview);
  }, []);

  // Update Settings
  const handleUpdateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
  };

  // Perform Scan Completion
  const handleScanCompleted = () => {
    const now = Date.now();
    setLastScanTime(now);
    localStorage.setItem(LAST_SCAN_KEY, String(now));

    const junkBytes = files
      .filter(f => f.isJunk || f.category === 'junk' || f.category === 'temp' || f.category === 'cache')
      .reduce((sum, f) => sum + f.size, 0);


    if (junkBytes > 50 * 1024 * 1024 && settings.junkReminder) {
      sendSmartNotification(
        'Junk Detected',
        `${Math.round(junkBytes / (1024 * 1024))} MB of cache and temporary files ready to clean.`,
        'junk_warning'
      );
    }

    setCurrentTab('scan_results');
  };

  // Execute Clean operation with genuine physical deletion and 30-day Recycle Bin archiving
  const executeClean = async (selectedFiles: ScannedFile[]) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    // Set isDeleting=true FIRST so CleaningScreen sees isBackendFinished=false from the start
    setIsDeleting(true);

    // Show feedback immediately so UI doesn't freeze
    setPendingCleanFiles(selectedFiles);
    setLastFreedBytes(selectedFiles.reduce((sum, f) => sum + f.size, 0));
    setLastFreedCount(selectedFiles.length);
    setCurrentTab('cleaning');

    // Allow React to paint the 'cleaning' screen before freezing thread (async IIFE)
    (async () => {
      try {
        // 1. Backup files into Recycle Bin first
        for (const f of selectedFiles) {
          try {
            const backupRes = await executeRealBackup(f);
            if (backupRes.success) {
              addToRecycleBin(f, backupRes.backupPath);
            }
          } catch (e) {
            console.error('Backup failed for', f.name, e);
          }
        }
        setRecycleBinItems(loadRecycleBin());

        // 2. Perform physical deletion via Android MediaStore / SAF / Web store
        const deletionRes = await executePhysicalDeletion(selectedFiles);

        const deletedIds = new Set(deletionRes.deletedFileIds);
        const finalRemainingFiles = files.filter(f => !deletedIds.has(f.id));
        updateFiles(finalRemainingFiles);

        setLastFreedBytes(deletionRes.freedBytes);
        setLastFreedCount(deletionRes.deletedCount);
      } catch (e) {
        console.error('Deletion operation failed', e);
      } finally {
        setIsDeleting(false);
      }
    })();
  };

  // Recycle Bin handlers
  const handleRestoreFromBin = async (item: RecycleBinItem) => {
    const res = await restoreItemFromRecycleBin(item.id);
    if (res.success && res.restoredFile) {
      updateFiles([res.restoredFile, ...files]);
      setRecycleBinItems(loadRecycleBin());
    }
  };

  const handlePermanentDeleteFromBin = async (item: RecycleBinItem) => {
    await permanentlyDeleteFromBin(item.id);
    setRecycleBinItems(loadRecycleBin());
  };

  const handleClearAllBin = async () => {
    await clearEntireRecycleBin();
    setRecycleBinItems([]);
  };

  // Start Clean trigger from review or duplicate group
  const handleProceedToCleanFromReview = (selectedFiles: ScannedFile[]) => {
    executeClean(selectedFiles);
  };

  // Handle Real Folder Selection (SAF on Android, File System Access API on Web)
  const handleSelectRealFolder = async (initialUri?: string) => {
    if (Capacitor.getPlatform() !== 'web') {
      try {
        setIsNativeScanning(true);
        setCurrentTab('scan');
        const safResult = await scanUserSelectedNativeFolder(initialUri);
        if (!safResult.cancelled && safResult.files.length > 0) {
          updateFiles([...safResult.files, ...files]);
          const newOverview = await getRealStorageOverview([...safResult.files, ...files]);
          setStorageOverview(newOverview);
        }
      } catch (e) {
        console.error("SAF folder selection failed:", e);
      } finally {
        setIsNativeScanning(false);
      }
      return;
    }

    if (typeof window !== 'undefined' && 'showDirectoryPicker' in window) {
      try {
        const dirHandle = await (window as any).showDirectoryPicker();
        const scannedRealFiles: ScannedFile[] = [];

        for await (const entry of dirHandle.values()) {
          if (entry.kind === 'file') {
            const file = await entry.getFile();
            const lowerName = file.name.toLowerCase();
            let cat: ScannedFile['category'] = 'document';
            if (lowerName.match(/\.(jpg|jpeg|png|webp|gif|svg)$/)) cat = 'image';
            else if (lowerName.match(/\.(mp4|mov|mkv|avi|webm)$/)) cat = 'video';
            else if (lowerName.match(/\.(mp3|wav|m4a|flac|aac)$/)) cat = 'audio';
            else if (lowerName.match(/\.(tmp|log|cache|part|thumb)$/)) cat = 'junk';

            scannedRealFiles.push({
              id: `real_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              name: file.name,
              size: file.size,
              path: `/${dirHandle.name}/${file.name}`,
              source: 'browser',
              storageSource: 'browser',
              category: cat,
              mimeType: file.type || 'application/octet-stream',
              lastModified: file.lastModified,
              securityStatus: 'safe',
              isJunk: cat === 'junk',
            });
          }
        }

        if (scannedRealFiles.length > 0) {
          updateFiles([...scannedRealFiles, ...files]);
          const newOverview = await getRealStorageOverview([...scannedRealFiles, ...files]);
          setStorageOverview(newOverview);
          setCurrentTab('scan');
        }
      } catch {
        // User cancelled picker
      }
    } else {
      setCurrentTab('scan');
    }
  };

  // Start Full Scan
  const handleStartFullScan = async () => {
    const { isNativeAvailable } = await checkNativePlatform();
    if (isNativeAvailable) {
      setIsNativeScanning(true);
      setCurrentTab('scan');
      const granted = await requestNativeStoragePermissions();
      if (granted) {
        try {
          const { files: scannedFiles, metrics } = await scanNativeStorage();
          updateFiles(scannedFiles);
          const newOverview = await getRealStorageOverview(scannedFiles);
          
          if (metrics) {
            newOverview.imageBytes = metrics.imageBytes;
            newOverview.videoBytes = metrics.videoBytes;
            newOverview.audioBytes = metrics.audioBytes;
          }
          
          setStorageOverview(newOverview);
        } catch (e) {
          console.error("Native storage scan failed:", e);
        }
      }
      setIsNativeScanning(false);
    } else {
      setCurrentTab('scan');
    }
  };

  const recommendations = generateSmartRecommendations(files);
  const unreadNotificationsCount = getStoredNotifications().filter(n => !n.read).length;

  return (
    <>
      <AndroidFrame
        currentTab={currentTab}
        onNavigate={(tab) => setCurrentTab(tab)}
        
        unreadNotificationsCount={unreadNotificationsCount}
        batteryLevel={systemMetrics.batteryLevel}
        isCharging={systemMetrics.isCharging}
      >
        {/* Screen 1: Splash */}
        {currentTab === 'splash' && (
          <SplashScreen 
            onFinish={() => setCurrentTab('home')} 
            isReady={isAppReady}
          />
        )}

        {/* Screen 2: Dashboard */}
        {currentTab === 'home' && (
          <DashboardScreen
            storageOverview={storageOverview}
            files={files}
            recommendations={recommendations}
            systemMetrics={systemMetrics}
            onStartScan={handleStartFullScan}
            onNavigate={(tab) => setCurrentTab(tab)}
            onOpenDrawer={() => setIsDrawerOpen(true)}
            isPro={true}
          />
        )}

        {/* Screen 3: Scan Progress Ring Screen */}
        {currentTab === 'scan' && (
          <ScanScreen
            isNativeScanning={isNativeScanning}
            files={files}
            storageOverview={storageOverview}
            onScanCompleted={handleScanCompleted}
            onNavigateToReview={() => setCurrentTab('review_select')}
            onNavigateToJunk={() => setCurrentTab('scan_results')}
            onNavigateToDuplicates={() => setCurrentTab('duplicate_group')}
            onNavigateToLarge={() => setCurrentTab('review_select')}
            onQuickClean={(filesToClean) => executeClean(filesToClean)}
          />
        )}

        {/* Screen 4: Scan Results Screen */}
        {currentTab === 'scan_results' && (
          <ScanResultsScreen
            files={files}
            recommendations={recommendations}
            onCleanNow={() => {
              const junkFiles = files.filter(f => f.isJunk || f.category === 'junk' || f.category === 'temp' || f.category === 'cache');
              const toClean = junkFiles.length > 0 ? junkFiles : files.slice(0, 10);
              executeClean(toClean);
            }}
            onReviewSelect={() => setCurrentTab('review_select')}
            onNavigate={(tab) => setCurrentTab(tab)}
            onBack={() => setCurrentTab('home')}
          />
        )}

        {/* Screen 5: Review & Select Screen */}
        {currentTab === 'review_select' && (
          <ReviewSelectScreen
            files={files}
            recommendations={recommendations}
            onProceedToClean={handleProceedToCleanFromReview}
            onContinueToBackup={handleProceedToCleanFromReview}
            onOpenDuplicateGroup={() => setCurrentTab('duplicate_group')}
            onNavigateToCategory={(cat) => {
              setSelectedCategory(cat);
              setCategoryDetailBackTab('review_select');
              setCurrentTab('category_detail');
            }}
            onNavigate={(tab) => setCurrentTab(tab)}
            onBack={() => setCurrentTab('scan_results')}
          />
        )}

        {/* Screen 6: Duplicate Group Photo Comparison Screen */}
        {currentTab === 'duplicate_group' && (
          <DuplicateGroupScreen
            files={files}
            onBack={() => setCurrentTab('review_select')}
            onKeepBest={() => {
              const duplicateCopies = files.filter(f => f.isDuplicate && !f.isOriginal);
              const toClean = duplicateCopies.length > 0 ? duplicateCopies : files.slice(0, 1);
              executeClean(toClean);
            }}
          />
        )}

        {/* Screen 7: Live Storage Cleaning Animation Screen */}
        {currentTab === 'cleaning' && (
          <CleaningScreen
            totalBytesToClean={pendingCleanFiles.reduce((sum, f) => sum + f.size, 0)}
            totalFilesToClean={pendingCleanFiles.length}
            isBackendFinished={!isDeleting}
            onCleanCompleted={() => setCurrentTab('clean_complete')}
            onCancel={() => setCurrentTab('home')}
          />
        )}

        {/* Screen 9: Clean Complete Screen */}
        {currentTab === 'clean_complete' && (
          <CleanCompleteScreen
            freedBytes={lastFreedBytes}
            freedCount={lastFreedCount}
            onDone={() => setCurrentTab('home')}
            onViewDetails={() => setCurrentTab('storage_overview')}
          />
        )}

        {/* Screen 10: Recycle Bin Screen (30-day recovery) */}
        {currentTab === 'recycle_bin' && (
          <RecycleBinScreen
            items={recycleBinItems}
            onRestoreItem={handleRestoreFromBin}
            onPermanentlyDeleteItem={handlePermanentDeleteFromBin}
            onClearAll={handleClearAllBin}
            onBack={() => setCurrentTab('home')}
          />
        )}

        {/* Screen 11: Video Compressor Screen */}
        {currentTab === 'video_compressor' && (
          <VideoCompressorScreen
            files={files}
            onBack={() => setCurrentTab('home')}
            onCompressedSaved={(originalFile, savedBytes) => {
              setLastFreedBytes(savedBytes);
              setLastFreedCount(1);
            }}
          />
        )}

        {/* Screen 11: Social Media Cleaner Screen */}
        {currentTab === 'social_cleaner' && (
          <SocialCleanerScreen
            files={files}
            onBack={() => setCurrentTab('home')}
            onReviewCategory={(categoryTitle, filesToReview) => {
              setSelectedCategory(categoryTitle);
              setSelectedSocialCategoryFiles(filesToReview);
              setCategoryDetailBackTab('social_cleaner');
              setCurrentTab('category_detail');
            }}
            onScanFolder={handleSelectRealFolder}
          />
        )}

        {/* Screen 13: Storage Overview Screen */}
        {currentTab === 'storage_overview' && (
          <StorageOverviewScreen
            storageOverview={storageOverview}
            files={files}
            onBack={() => setCurrentTab('home')}
            onNavigate={(tab, payload) => {
              if (tab === 'category_detail' && payload) {
                setSelectedCategory(payload);
                setCategoryDetailBackTab('storage_overview');
              }
              setCurrentTab(tab);
            }}
          />
        )}

        {/* Screen 13.5: Category Detail Screen */}
        {currentTab === 'category_detail' && (
          <CategoryDetailScreen
            category={selectedCategory}
            title={selectedSocialCategoryFiles ? selectedCategory : undefined}
            files={files}
            prefilteredFiles={selectedSocialCategoryFiles}
            onBack={() => {
              setSelectedSocialCategoryFiles(undefined);
              setCurrentTab(categoryDetailBackTab);
            }}
            onClean={(filesToClean) => executeClean(filesToClean)}
          />
        )}

        {/* Screen 14: Monthly Report Screen */}
        {currentTab === 'monthly_report' && (
          <MonthlyReportScreen
            onBack={() => setCurrentTab('home')}
            onNavigate={(tab) => setCurrentTab(tab)}
          />
        )}

        {/* Screen 15: Security & Privacy Screen */}
        {currentTab === 'security' && (
          <SecurityPrivacyScreen
            onBack={() => setCurrentTab('home')}
            onNavigate={(tab) => setCurrentTab(tab)}
          />
        )}

        {/* Screen 16: Settings Screen */}
        {currentTab === 'settings' && (
          <SettingsScreen
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onBack={() => setCurrentTab('home')}
            onNavigate={(tab) => setCurrentTab(tab)}
          />
        )}

        {/* Screen 17: No Items Found (Empty State) */}
        {currentTab === 'no_items_found' && (
          <NoItemsFoundScreen
            onBack={() => setCurrentTab('home')}
            onScanAgain={handleStartFullScan}
          />
        )}

        {/* Screen 18: Help & Support Screen */}
        {currentTab === 'help_support' && (
          <HelpSupportScreen
            onBack={() => setCurrentTab('home')}
            onNavigate={(tab) => setCurrentTab(tab)}
          />
        )}
        {/* Navigation Drawer Menu */}
        <NavigationDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          currentTab={currentTab}
          onNavigate={(tab) => setCurrentTab(tab)}
            
            />
      </AndroidFrame>


    </>
  );
}
