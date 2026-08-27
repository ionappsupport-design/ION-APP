/**
 * cleaningHistoryManager.ts
 * Persists real scan/clean events per month to localStorage.
 * MonthlyReportScreen reads from this service to show real data.
 */

const HISTORY_KEY = 'ion_cleaning_history_v1';

export interface CleaningEvent {
  timestamp: number;   // Unix ms
  bytesFreed: number;
  filesCount: number;
}

export interface MonthlyStats {
  yearMonth: string;   // "2025-08"
  label: string;       // "Aug 2025"
  totalBytesFreed: number;
  totalFilesFreed: number;
  scanCount: number;
}

function loadEvents(): CleaningEvent[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEvents(events: CleaningEvent[]): void {
  try {
    // Keep only last 12 months of events
    const cutoff = Date.now() - 365 * 24 * 60 * 60 * 1000;
    const trimmed = events.filter(e => e.timestamp >= cutoff);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch { /* ignore quota errors */ }
}

/** Call this after each successful clean operation */
export function recordCleanEvent(bytesFreed: number, filesCount: number): void {
  if (bytesFreed <= 0 && filesCount <= 0) return;
  const events = loadEvents();
  events.push({ timestamp: Date.now(), bytesFreed, filesCount });
  saveEvents(events);
}

/** Returns the last N months of stats, most recent first */
export function getMonthlyStats(monthsBack = 6): MonthlyStats[] {
  const events = loadEvents();
  const now = new Date();

  const results: MonthlyStats[] = [];

  for (let i = 0; i < monthsBack; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('default', { month: 'short', year: 'numeric' });

    const monthEvents = events.filter(e => {
      const ed = new Date(e.timestamp);
      return ed.getFullYear() === d.getFullYear() && ed.getMonth() === d.getMonth();
    });

    results.push({
      yearMonth,
      label,
      totalBytesFreed: monthEvents.reduce((s, e) => s + e.bytesFreed, 0),
      totalFilesFreed: monthEvents.reduce((s, e) => s + e.filesCount, 0),
      scanCount: monthEvents.length,
    });
  }

  return results; // index 0 = current month
}
