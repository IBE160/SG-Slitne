// SPIKE-5: Offline-First & Persistence Handler
// Purpose: Validate offline functionality, sync queue, data recovery

import { getAllTasks, getAllLabels, createTask, Task, Label } from './db';

export interface SyncQueueItem {
  id: string;
  operation: 'create' | 'update' | 'delete';
  entityType: 'task' | 'label' | 'project';
  entityId: string;
  data: Record<string, unknown>;
  timestamp: string;
  status: 'pending' | 'synced' | 'failed';
  lastWriteWins?: boolean; // for simple conflict handling
  retryCount?: number; // number of retry attempts
  lastAttemptTimestamp?: string; // ISO timestamp of last sync attempt
  error?: string; // last error message
}

const SYNC_QUEUE_KEY = 'sync-queue-v1';
const OFFLINE_MODE_KEY = 'offline-mode';

// Retry configuration
const MAX_RETRY_COUNT = 5;
const BASE_BACKOFF_MS = 1000; // Start with 1 second
const MAX_BACKOFF_MS = 60000; // Cap at 60 seconds

// Calculate exponential backoff with jitter
function calculateBackoff(retryCount: number): number {
  const exponentialBackoff = Math.min(
    BASE_BACKOFF_MS * Math.pow(2, retryCount),
    MAX_BACKOFF_MS
  );
  // Add jitter (±25% random variation)
  const jitter = exponentialBackoff * 0.25 * (Math.random() * 2 - 1);
  return Math.floor(exponentialBackoff + jitter);
}

// Check if item should be retried based on retry count and backoff delay
function shouldRetryItem(item: SyncQueueItem): boolean {
  if (item.status === 'synced') return false;
  
  const retryCount = item.retryCount || 0;
  if (retryCount >= MAX_RETRY_COUNT) return false;

  if (!item.lastAttemptTimestamp) return true; // First attempt

  const lastAttempt = new Date(item.lastAttemptTimestamp).getTime();
  const backoffDelay = calculateBackoff(retryCount);
  const now = Date.now();
  
  return now - lastAttempt >= backoffDelay;
}

// ===== OFFLINE STATE =====

export function isOffline(): boolean {
  return !navigator.onLine;
}

export function setOfflineMode(enabled: boolean): void {
  localStorage.setItem(OFFLINE_MODE_KEY, JSON.stringify(enabled));
}

export function getOfflineMode(): boolean {
  const stored = localStorage.getItem(OFFLINE_MODE_KEY);
  return stored ? JSON.parse(stored) : isOffline();
}

// ===== SYNC QUEUE MANAGEMENT =====

export function getSyncQueue(): SyncQueueItem[] {
  const stored = localStorage.getItem(SYNC_QUEUE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function setSyncQueue(queue: SyncQueueItem[]): void {
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
}

export function addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'status'>): SyncQueueItem {
  const queue = getSyncQueue();
  const newItem: SyncQueueItem = {
    ...item,
    id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    status: 'pending',
    lastWriteWins: true,
    retryCount: 0,
  };
  queue.push(newItem);
  setSyncQueue(queue);
  return newItem;
}

export function updateSyncQueueItem(id: string, updates: Partial<SyncQueueItem>): void {
  const queue = getSyncQueue();
  const item = queue.find((q) => q.id === id);
  if (item) {
    Object.assign(item, updates);
    setSyncQueue(queue);
  }
}

export function clearSyncQueue(): void {
  setSyncQueue([]);
}

export function getPendingSyncCount(): number {
  return getSyncQueue().filter((item) => item.status === 'pending').length;
}

export function getRetryingSyncCount(): number {
  return getSyncQueue().filter((item) => {
    return item.status === 'pending' && (item.retryCount || 0) > 0;
  }).length;
}

export function getFailedSyncCount(): number {
  return getSyncQueue().filter((item) => {
    return item.status === 'failed' || (item.retryCount || 0) >= MAX_RETRY_COUNT;
  }).length;
}

// ===== CLOUD SYNC STUB =====

export interface CloudSyncOptions {
  cloudEnabled: boolean;
  endpointBaseUrl?: string;
}

async function sendToCloud(item: SyncQueueItem, options: CloudSyncOptions): Promise<'synced' | 'failed'> {
  if (!options.cloudEnabled) return 'failed';
  
  // Placeholder: simulate network call with realistic timing
  await new Promise((res) => setTimeout(res, 100 + Math.random() * 200));
  
  // Simulate occasional failures for testing retry logic
  const failureRate = 0.1; // 10% failure rate
  if (Math.random() < failureRate) {
    throw new Error('Network error: Connection timeout');
  }
  
  return 'synced';
}

export async function flushPendingSync(options: CloudSyncOptions): Promise<{ 
  processed: number; 
  failed: number; 
  retrying: number;
  permanent_failures: number;
}> {
  const queue = getSyncQueue();
  let processed = 0;
  let failed = 0;
  let retrying = 0;
  let permanent_failures = 0;
  
  for (const item of queue) {
    // Skip if not ready for retry
    if (!shouldRetryItem(item)) {
      if ((item.retryCount || 0) >= MAX_RETRY_COUNT) {
        permanent_failures += 1;
      } else if ((item.retryCount || 0) > 0) {
        retrying += 1; // Still waiting for backoff
      }
      continue;
    }
    
    const retryCount = (item.retryCount || 0) + 1;
    
    try {
      const result = await sendToCloud(item, options);
      updateSyncQueueItem(item.id, { 
        status: result,
        retryCount,
        lastAttemptTimestamp: new Date().toISOString(),
      });
      processed += 1;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (retryCount >= MAX_RETRY_COUNT) {
        // Permanent failure after max retries
        updateSyncQueueItem(item.id, { 
          status: 'failed',
          retryCount,
          lastAttemptTimestamp: new Date().toISOString(),
          error: errorMessage,
        });
        permanent_failures += 1;
      } else {
        // Temporary failure, will retry
        updateSyncQueueItem(item.id, { 
          status: 'pending',
          retryCount,
          lastAttemptTimestamp: new Date().toISOString(),
          error: errorMessage,
        });
        retrying += 1;
      }
      failed += 1;
    }
  }
  
  return { processed, failed, retrying, permanent_failures };
}

// Convenience wrappers to enqueue operations when offline
export function enqueueCreate(entityType: SyncQueueItem['entityType'], entityId: string, data: Record<string, unknown>) {
  return addToSyncQueue({ operation: 'create', entityType, entityId, data });
}
export function enqueueUpdate(entityType: SyncQueueItem['entityType'], entityId: string, data: Record<string, unknown>) {
  return addToSyncQueue({ operation: 'update', entityType, entityId, data });
}
export function enqueueDelete(entityType: SyncQueueItem['entityType'], entityId: string) {
  return addToSyncQueue({ operation: 'delete', entityType, entityId, data: {} });
}

// ===== PERSISTENCE ACROSS SESSIONS =====

export async function exportDataSnapshot(): Promise<string> {
  const tasks = await getAllTasks();
  const labels = await getAllLabels();

  const backup = {
    version: 1,
    exportDate: new Date().toISOString(),
    tasks,
    labels,
    syncQueue: getSyncQueue(),
  };

  return JSON.stringify(backup, null, 2);
}

export async function importDataSnapshot(jsonString: string): Promise<void> {
  try {
    const backup = JSON.parse(jsonString);

    if (backup.version !== 1) {
      throw new Error(`Unsupported backup version: ${backup.version}`);
    }

    // Store in localStorage as recovery option
    localStorage.setItem('backup-recovery', jsonString);
    localStorage.setItem('backup-recovery-date', new Date().toISOString());
  } catch (error) {
    throw new Error(`Failed to import snapshot: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// ===== OFFLINE SIMULATION =====

export function simulateNetworkFailure(): void {
  setOfflineMode(true);
}

export function simulateNetworkRecovery(): void {
  setOfflineMode(false);
}

// ===== STORAGE MONITORING =====

export interface StorageStats {
  used: number;
  available: number;
  percentage: number;
  taskCount: number;
  labelCount: number;
}

export async function getStorageStats(): Promise<StorageStats> {
  const tasks = await getAllTasks();
  const labels = await getAllLabels();

  if (!navigator.storage || !navigator.storage.estimate) {
    return {
      used: 0,
      available: 0,
      percentage: 0,
      taskCount: tasks.length,
      labelCount: labels.length,
    };
  }

  const estimate = await navigator.storage.estimate();
  const used = estimate.usage || 0;
  const quota = estimate.quota || 50 * 1024 * 1024; // 50MB default

  return {
    used,
    available: quota - used,
    percentage: (used / quota) * 100,
    taskCount: tasks.length,
    labelCount: labels.length,
  };
}

// ===== DATA RECOVERY =====

export interface RecoveryOptions {
  hasBackup: boolean;
  backupDate: string | null;
  canRecover: boolean;
}

export function checkRecoveryOptions(): RecoveryOptions {
  const backup = localStorage.getItem('backup-recovery');
  const backupDate = localStorage.getItem('backup-recovery-date');

  return {
    hasBackup: backup !== null,
    backupDate: backupDate || null,
    canRecover: backup !== null && backup.length > 0,
  };
}

export async function recoverFromBackup(): Promise<void> {
  const backup = localStorage.getItem('backup-recovery');
  if (!backup) {
    throw new Error('No backup available for recovery');
  }

  await importDataSnapshot(backup);
}

// ===== BATTERY & PERFORMANCE MONITORING =====

export interface BatteryInfo {
  level: number;
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
}

export async function getBatteryStatus(): Promise<BatteryInfo | null> {
  if (!navigator.getBattery && !(navigator as unknown as { battery?: object }).battery) {
    return null;
  }

  try {
    const battery = await (navigator as unknown as { getBattery?: () => Promise<{ level: number; charging: boolean; chargingTime: number; dischargingTime: number }> }).getBattery?.();
    if (battery) {
      return {
        level: battery.level,
        charging: battery.charging,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime,
      };
    }
  } catch {
    // Battery API not available
  }

  return null;
}

// ===== OFFLINE APP VALIDATION =====

export async function validateOfflineCapability(): Promise<{
  isOfflineCapable: boolean;
  hasIndexedDB: boolean;
  hasLocalStorage: boolean;
  canSyncQueue: boolean;
  errors: string[];
}> {
  const errors: string[] = [];

  // Check IndexedDB support
  const hasIndexedDB = !!indexedDB;
  if (!hasIndexedDB) errors.push('IndexedDB not available');

  // Check localStorage
  const hasLocalStorage = (() => {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  })();

  if (!hasLocalStorage) errors.push('localStorage not available');

  // Check sync queue capability
  const canSyncQueue = hasLocalStorage && hasIndexedDB;

  return {
    isOfflineCapable: hasIndexedDB && hasLocalStorage,
    hasIndexedDB,
    hasLocalStorage,
    canSyncQueue,
    errors,
  };
}
