import React, { useState, useEffect, useCallback } from 'react';
import { 
  checkNativePlatform, 
  requestNativeStoragePermissions, 
  scanNativeStorage, 
  scanUserSelectedNativeFolder,
  executePhysicalDeletion, 
  executeRealBackup,
  scanDocumentsNative,
  runBlurDetectionBatch
} from './services/nativeStorageBridge';
import { Capacitor } from '@capacitor/core';
import { 
  NavigationTab, 
  ScannedFile, 
  StorageOverview, 
  DeviceSystemMetrics, 
  UserSettings,
  RecycleBinItem,
  CleaningRecommendation
} from './types';
import { App as CapacitorApp } from '@capacitor/app';
import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';
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
import { UpgradeProScreen } from './components/UpgradeProScreen';
import { NavigationDrawer } from './components/NavigationDrawer';
import { DevicePerformanceScreen } from './components/DevicePerformanceScreen';
import { Toaster } from 'react-hot-toast';

import { 
  INITIAL_DEVICE_FILES, 
  getRealStorageOverview, 
  generateSmartRecommendations 
} from './services/storageScanner';
import { getRealDeviceSystemMetrics } from './services/systemMonitor';
import { getNativeStorageOverview as getRealStorageOverviewBridge } from './services/nativeStorageBridge';
import { getStoredProMembership } from './services/razorpayService';
import { ProMembership } from './types';
import { 
  getStoredNotifications, 
  sendSmartNotification,
  setupFCMAndScheduleNudge
} from './services/notificationService';
import { 
  loadRecycleBin, 
  addToRecycleBin, 
  restoreItemFromRecycleBin, 
  permanentlyDeleteFromBin, 
  clearEntireRecycleBin 
} from './services/recycleBinManager';
import { recordCleanEvent, getMonthlyStats } from './services/cleaningHistoryManager';

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

  // Hardware Back Button Handler
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
        setSelectedSocialCategoryFiles(undefined);
        setCurrentTab(categoryDetailBackTab);
      } else if (currentTab === 'storage_overview' || currentTab === 'settings' || currentTab === 'security' || currentTab === 'monthly_report' || currentTab === 'recycle_bin' || currentTab === 'video_compressor' || currentTab === 'upgrade_pro' || currentTab === 'device_performance') {
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
  }, [currentTab, categoryDetailBackTab]);

  // Pro Membership State (Razorpay Entitlements)
  const [membership, setMembership] = useState<ProMembership>(() => getStoredProMembership());


  // Recycle Bin State
  const [recycleBinItems, setRecycleBinItems] = useState<RecycleBinItem[]>(() => loadRecycleBin());

  // Core Data State
  const [isAppReady, setIsAppReady] = useState(false);
  const [isNativeScanning, setIsNativeScanning] = useState(false);
  const [files, setFiles] = useState<ScannedFile[]>(() => {
    try {
      const raw = localStorage.getItem(FILES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed.map((f: any) => ({
          ...f,
          size: Number(f.size) || 0
        }));
      }
      return INITIAL_DEVICE_FILES;
    } catch {
      return INITIAL_DEVICE_FILES;
    }
  });

  const [recommendations, setRecommendations] = useState<CleaningRecommendation[]>([]);

  useEffect(() => {
    let isMounted = true;
    generateSmartRecommendations(files).then(recs => {
      if (isMounted) setRecommendations(recs);
    });
    return () => { isMounted = false; };
  }, [files]);

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
      theme: 'system',
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

  // Sync theme changes to HTML document element + Android status bar color
  useEffect(() => {
    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        document.documentElement.classList.add('dark');
        // Update Android status bar to dark
        const meta = document.getElementById('theme-color-meta');
        if (meta) meta.setAttribute('content', '#0f172a');
      } else {
        document.documentElement.classList.remove('dark');
        // Update Android status bar to light
        const meta = document.getElementById('theme-color-meta');
        if (meta) meta.setAttribute('content', '#f1f5f9');
      }
    };

    if (settings.theme === 'dark') {
      applyTheme(true);
    } else if (settings.theme === 'light') {
      applyTheme(false);
    } else {
      // system: follow OS
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(prefersDark);
      if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const listener = (e: MediaQueryListEvent) => applyTheme(e.matches);
        mediaQuery.addEventListener('change', listener);
        return () => mediaQuery.removeEventListener('change', listener);
      }
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
      (async () => {
        try {
          await AdMob.initialize({
            initializeForTesting: false,
          });
        } catch (e) {
          console.error("AdMob initialization failed", e);
        }
      })()
    ]).then(() => {
      setIsAppReady(true);
    }).catch((err) => {
      console.error("Startup error", err);
      setIsAppReady(true); // Ensure app still loads
    });
  }, []);

  // AdMob Banner Logic
  useEffect(() => {
    const manageAdMob = async () => {
      try {
        if (membership.isPro || currentTab === 'splash' || currentTab === 'cleaning' || currentTab === 'upgrade_pro') {
          await AdMob.hideBanner().catch(() => {});
        } else {
          await AdMob.showBanner({
            adId: 'ca-app-pub-4120562777721944/7070570681', 
            adSize: BannerAdSize.BANNER,
            position: BannerAdPosition.BOTTOM_CENTER,
            margin: 0,
            isTesting: false 
          }).catch(() => {});
        }
      } catch (e) {
        console.error('AdMob Error', e);
      }
    };
    if (isAppReady) {
      manageAdMob();
    }
  }, [currentTab, membership.isPro, isAppReady]);

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
        try {
          const backupRes = await executeRealBackup(selectedFiles);
          for (const backup of backupRes.successfulBackups) {
            addToRecycleBin(backup.file, backup.backupPath);
          }
        } catch (e) {
          console.error('Bulk backup failed', e);
        }
        setRecycleBinItems(loadRecycleBin());

        // 2. Perform physical deletion via Android MediaStore / SAF / Web store
        const deletionRes = await executePhysicalDeletion(selectedFiles);

        const deletedIds = new Set(deletionRes.deletedFileIds);
        const finalRemainingFiles = files.filter(f => !deletedIds.has(f.id));
        updateFiles(finalRemainingFiles);

        const freedBytes = deletionRes.freedBytes;
        const freedCount = deletionRes.deletedCount;
        setLastFreedBytes(freedBytes);
        setLastFreedCount(freedCount);

        // Record real cleaning event for Monthly Report
        if (freedBytes > 0 || freedCount > 0) {
          recordCleanEvent(freedBytes, freedCount);
          
          // Contextual notification permission for the 15-day lifetime premium nudge
          setupFCMAndScheduleNudge(freedBytes);
        }
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
      // Request permissions but don't hard-block scan even if MANAGE_EXTERNAL_STORAGE is denied
      const hasPerms = await requestNativeStoragePermissions();
      if (!hasPerms) {
        alert("Storage Permissions Required!\n\nPlease enable them in your phone's Settings -> Apps -> ION Cleaner -> Permissions, otherwise the scan will show 0 Bytes.");
        setIsNativeScanning(false);
        return;
      }
      try {
        const [{ files: mediaFiles, metrics }, { files: socialFiles }, { files: junkFiles }, { files: docFiles }] = await Promise.all([
          scanNativeStorage(),
          import('./services/nativeStorageBridge').then(m => m.scanSocialMediaNative()),
          import('./services/nativeStorageBridge').then(m => m.scanJunkFilesNative()),
          scanDocumentsNative(),
        ]);

        // Combine files while avoiding duplicate paths
        const existingPaths = new Set(mediaFiles.map(f => f.path));
        const uniqueSocialFiles = socialFiles.filter(f => !existingPaths.has(f.path));
        const uniqueJunkFiles = junkFiles.filter(f => !existingPaths.has(f.path) && !uniqueSocialFiles.some(sf => sf.path === f.path));
        const uniqueDocFiles = docFiles.filter(f =>
          !existingPaths.has(f.path) &&
          !uniqueSocialFiles.some(sf => sf.path === f.path) &&
          !uniqueJunkFiles.some(jf => jf.path === f.path)
        );
        
        let allScannedFiles = [...mediaFiles, ...uniqueSocialFiles, ...uniqueJunkFiles, ...uniqueDocFiles];
        
        // Run blur detection on image files in background (non-blocking update)
        runBlurDetectionBatch(allScannedFiles).then(filesWithBlur => {
          updateFiles(filesWithBlur);
        }).catch(() => {});

        updateFiles(allScannedFiles);
        
        const newOverview = await getRealStorageOverview(allScannedFiles);
        
        if (metrics) {
          newOverview.imageBytes = metrics.imageBytes;
          newOverview.videoBytes = metrics.videoBytes;
          newOverview.audioBytes = metrics.audioBytes;
          newOverview.documentBytes = metrics.documentBytes;
        }
        
        setStorageOverview(newOverview);
      } catch (e) {
        console.error("Native storage scan failed:", e);
      }
      setIsNativeScanning(false);
    } else {
      setCurrentTab('scan');
    }
  };
  const unreadNotificationsCount = getStoredNotifications().filter(n => !n.read).length;

  return (
    <>
      <Toaster 
        position="bottom-center"
        toastOptions={{
          style: {
            background: '#1E293B',
            color: '#fff',
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
        }}
      />
      <AndroidFrame
        currentTab={currentTab}
        onNavigate={(tab) => setCurrentTab(tab)}
        unreadNotificationsCount={unreadNotificationsCount}
        batteryLevel={systemMetrics.batteryLevel}
        isCharging={systemMetrics.isCharging}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        isPro={membership.isPro}
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
            onNavigate={(tab, payload) => {
              if (tab === 'category_detail' && payload) {
                setSelectedCategory(payload);
                setCategoryDetailBackTab('home');
              }
              setCurrentTab(tab);
            }}
            onOpenDrawer={() => setIsDrawerOpen(true)}
            isPro={membership.isPro}
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
              if (junkFiles.length > 0) {
                executeClean(junkFiles);
              }
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
              if (duplicateCopies.length > 0) {
                executeClean(duplicateCopies);
              }
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
            monthlyStats={getMonthlyStats(6)}
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
            membership={membership}
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

        {/* Screen 19: Upgrade to Pro VIP (Razorpay Checkout) */}
        {currentTab === 'upgrade_pro' && (
          <UpgradeProScreen
            currentMembership={membership}
            onBack={() => setCurrentTab('home')}
            onUpgradeSuccess={(newMembership) => setMembership(newMembership)}
            onNavigate={(tab) => setCurrentTab(tab)}
          />
        )}

        {/* Screen 20: Device Performance */}
        {currentTab === 'device_performance' && (
          <DevicePerformanceScreen
            systemMetrics={systemMetrics}
            onBack={() => setCurrentTab('home')}
          />
        )}
      </AndroidFrame>
      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentTab={currentTab}
        isPro={membership.isPro}
        onNavigate={(tab) => {
          setCurrentTab(tab);
          setIsDrawerOpen(false);
        }}
      />
    </>
  );
}
