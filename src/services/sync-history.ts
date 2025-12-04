// EPIC-8: Sync History & Timeline
// Purpose: Track all sync attempts for debugging and transparency

export interface SyncHistoryEntry {
  id: string;
  timestamp: string;
  operation: 'manual_sync' | 'auto_sync' | 'retry' | 'clear_queue';
  status: 'success' | 'partial' | 'failed';
  itemsProcessed: number;
  itemsFailed: number;
  itemsRetrying?: number;
  permanentFailures?: number;
  errorMessage?: string;
  duration?: number; // milliseconds
}

const HISTORY_KEY = 'sync-history-v1';
const MAX_HISTORY_ENTRIES = 100;

// ===== HISTORY MANAGEMENT =====

export function getSyncHistory(): SyncHistoryEntry[] {
  const stored = localStorage.getItem(HISTORY_KEY);
  return stored ? JSON.parse(stored) : [];
}

function setSyncHistory(history: SyncHistoryEntry[]): void {
  // Keep only the most recent MAX_HISTORY_ENTRIES
  const trimmed = history.slice(-MAX_HISTORY_ENTRIES);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
}

export function addSyncHistoryEntry(entry: Omit<SyncHistoryEntry, 'id' | 'timestamp'>): SyncHistoryEntry {
  const history = getSyncHistory();
  const newEntry: SyncHistoryEntry = {
    ...entry,
    id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
  };
  history.push(newEntry);
  setSyncHistory(history);
  return newEntry;
}

export function clearSyncHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

// ===== HISTORY QUERIES =====

export function getLastSuccessfulSync(): SyncHistoryEntry | null {
  const history = getSyncHistory();
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].status === 'success') {
      return history[i];
    }
  }
  return null;
}

export function getRecentHistory(limit: number = 10): SyncHistoryEntry[] {
  const history = getSyncHistory();
  return history.slice(-limit).reverse(); // Most recent first
}

export function getSyncStats(): {
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  successRate: number;
  lastSyncTime: string | null;
  averageDuration: number;
} {
  const history = getSyncHistory();
  
  const totalSyncs = history.length;
  const successfulSyncs = history.filter(h => h.status === 'success').length;
  const failedSyncs = history.filter(h => h.status === 'failed').length;
  const successRate = totalSyncs > 0 ? (successfulSyncs / totalSyncs) * 100 : 0;
  
  const lastSync = history.length > 0 ? history[history.length - 1] : null;
  const lastSyncTime = lastSync ? lastSync.timestamp : null;
  
  const durationsWithValue = history.filter(h => h.duration !== undefined).map(h => h.duration!);
  const averageDuration = durationsWithValue.length > 0
    ? durationsWithValue.reduce((sum, d) => sum + d, 0) / durationsWithValue.length
    : 0;
  
  return {
    totalSyncs,
    successfulSyncs,
    failedSyncs,
    successRate,
    lastSyncTime,
    averageDuration,
  };
}

// ===== HISTORY EXPORT =====

export function exportSyncHistory(): string {
  const history = getSyncHistory();
  return JSON.stringify({
    version: 1,
    exportDate: new Date().toISOString(),
    entries: history,
  }, null, 2);
}
