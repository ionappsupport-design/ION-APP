export type FileCategory = 
  | 'image' 
  | 'video' 
  | 'document' 
  | 'audio' 
  | 'large' 
  | 'duplicate' 
  | 'screenshot' 
  | 'junk' 
  | 'temp' 
  | 'cache';

export type SecurityStatus = 'safe' | 'suspicious' | 'unverified';

export interface ScannedFile {
  id: string;
  name: string;
  size: number; // in bytes
  path: string;
  source: 'browser' | 'native';
  storageSource?: 'mediastore' | 'saf' | 'app_cache' | 'browser';
  nativeUri?: string;
  mediaStoreId?: string;
  treeUri?: string;
  documentUri?: string;
  relativePath?: string;
  category: FileCategory;
  mimeType: string;
  lastModified: number;
  hash?: string;
  isDuplicate?: boolean;
  duplicateGroupId?: string;
  isOriginal?: boolean;
  isSimilar?: boolean;
  similarGroupId?: string;
  isBlurry?: boolean;
  blurScore?: number; // 0 to 100
  thumbnailUrl?: string;
  securityStatus: SecurityStatus;
  securityReason?: string;
  isJunk?: boolean;
  junkType?: 'system_cache' | 'temp_file' | 'obsolete_log' | 'thumbnail_cache' | 'app_residual';
  
  // Social Media Metadata
  socialApp?: 'WhatsApp' | 'Telegram' | 'Instagram';
  socialCategory?: 'sent' | 'received' | 'status' | 'voice' | 'sticker' | 'database';

  selected?: boolean;
  blob?: Blob;
}

export interface StorageBreakdown {
  images: number;
  videos: number;
  documents: number;
  audio: number;
  junk: number;
  other: number;
}

export interface StorageOverview {
  totalBytes: number;
  usedBytes: number;
  availableBytes: number;
  usedPercentage: number;
  isRealData: boolean;
  storageApiSource: 'navigator.storage' | 'android_native' | 'file_system' | 'fallback_estimate';
  imageBytes?: number;
  videoBytes?: number;
  audioBytes?: number;
  documentBytes?: number;
}

export interface JunkCategory {
  id: string;
  name: string;
  description: string;
  count: number;
  totalSize: number;
  files: ScannedFile[];
  isSafe: boolean;
}

export interface RecycleBinItem {
  id: string;
  fileId: string;
  name: string;
  originalPath: string;
  backupPath?: string;
  size: number;
  category: FileCategory;
  mimeType: string;
  deletedAt: number; // timestamp
  expiresAt: number; // timestamp + 30 days
  remainingDays: number;
  fileData: ScannedFile;
}

export interface CleaningRecommendation {
  id: string;
  title: string;
  description: string;
  recoverableBytes: number;
  fileCount: number;
  type: 'duplicates' | 'screenshots' | 'large_files' | 'junk' | 'temp' | 'social';
  files: ScannedFile[];
  badgeColor: 'blue' | 'green' | 'amber' | 'cyan' | 'purple';
}

export interface DeviceSystemMetrics {
  ramTotalGb: number | null;
  ramAvailableGb: number | null;
  ramUsagePercent: number | null;
  cpuCores: number | null;
  cpuLoadPercent: number | null;
  batteryLevel: number | null;
  isCharging: boolean | null;
  chargingTime: number | null;
  storageTotalBytes: number;
  storageUsedBytes: number;
  performanceState: 'Optimal' | 'Good' | 'Attention' | 'Critical';
  advice: string[];
  batteryHealth: 'Good' | 'Normal' | 'Degraded';
  osVersion?: string;
  isNativeData?: boolean;
}

export type SupportedRegion = 'IN' | 'US' | 'GB' | 'GLOBAL';

export interface PaymentPlan {
  id: 'monthly' | 'annual' | 'lifetime';
  title: string;
  tagline: string;
  price: number;
  originalPrice?: number;
  currency: 'INR' | 'USD' | 'GBP' | string;
  currencySymbol: string;
  billingPeriod: string;
  badge?: string;
  isPopular?: boolean;
  features: string[];
}

export interface ProMembership {
  isPro: boolean;
  planId: 'monthly' | 'annual' | 'lifetime' | 'trial' | null;
  planName: string | null;
  paymentId?: string;
  orderId?: string;
  signature?: string;
  purchasedAt?: number;
  expiresAt?: number | null;
  amountPaid?: number;
  currency?: string;
  status: 'active' | 'expired' | 'cancelled' | 'free' | 'trial';
  isTrial: boolean;
  trialDaysLeft: number;
}

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

export interface TrialState {
  isTrialActive: boolean;
  trialStartDate: number;
  trialEndDate: number;
  remainingDays: number;
  isLifetimePurchased: boolean;
  purchaseDate?: number;
  orderId?: string;
  billingStatus: 'trial' | 'purchased' | 'expired';
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  isLifetimePro: boolean;
  createdAt: number;
  trialStart?: number;
  trialExpiry?: number;
  trialStatus?: 'active' | 'expired';
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  lowStorageAlert: boolean;
  junkReminder: boolean;
  weeklyReport: boolean;
  hapticsEnabled: boolean;
}

export interface VideoCompressionJob {
  id: string;
  file: ScannedFile;
  originalSize: number;
  targetQuality: 'low' | 'medium' | 'high';
  estimatedSize: number;
  actualSize?: number;
  status: 'idle' | 'compressing' | 'completed' | 'failed';
  progress: number;
  downloadUrl?: string;
  error?: string;
}

export interface SocialAppMediaCategory {
  appName: 'WhatsApp' | 'Telegram';
  categoryTitle: string;
  path: string;
  count: number;
  sizeBytes: number;
  files: ScannedFile[];
  description: string;
}

export interface UsageAnalyticsEvent {
  id: string;
  name: 'app_opened' | 'scan_started' | 'scan_completed' | 'cleaning_completed' | 'compression_completed' | 'security_scan_completed' | 'backup_completed' | 'restore_completed';
  timestamp: number;
  details?: Record<string, string | number | boolean>;
}

export type NavigationTab = 
  | 'splash'
  | 'auth'
  | 'home' 
  | 'scan' 
  | 'scan_results'
  | 'review_select'
  | 'duplicate_group'
  | 'cleaning'
  | 'clean_complete'
  | 'recycle_bin'
  | 'video_compressor'
  | 'social_cleaner'
  | 'storage_overview'
  | 'monthly_report'
  | 'security'
  | 'settings'
  | 'no_items_found'
  | 'help_support'
  | 'category_detail'
  | 'upgrade_pro'
  | 'device_performance'
  | 'admin_banner';
