/**
 * Telemetry & Analytics Service
 * 
 * Tracks local user interactions (suggestion acceptance/rejection) and stores
 * events in localStorage. User can opt-in to upload analytics.
 * No data is sent without explicit user consent.
 */

export interface TelemetryEvent {
  id: string;
  timestamp: string;
  type: 'suggestion_shown' | 'suggestion_accepted' | 'suggestion_rejected';
  label: string;
  confidence?: number;
  reason?: string;
  taskContext?: {
    title: string;
    priority: number;
    hasDescription: boolean;
  };
}

const STORAGE_KEY = 'telemetry_events';
const MAX_EVENTS = 1000; // Prevent unbounded growth

/**
 * Record a telemetry event locally
 */
export function trackEvent(event: Omit<TelemetryEvent, 'id' | 'timestamp'>): void {
  try {
    const events = getStoredEvents();
    
    const newEvent: TelemetryEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };

    events.push(newEvent);

    // Trim if too large
    if (events.length > MAX_EVENTS) {
      events.shift();
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (error) {
    console.warn('Failed to record telemetry event:', error);
  }
}

/**
 * Get all stored events
 */
export function getStoredEvents(): TelemetryEvent[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.warn('Failed to read telemetry events:', error);
    return [];
  }
}

/**
 * Get pending events count
 */
export function getPendingEventCount(): number {
  return getStoredEvents().length;
}

/**
 * Get summary of events for user review
 */
export function getEventsSummary(): {
  totalEvents: number;
  suggestionsShown: number;
  suggestionsAccepted: number;
  suggestionsRejected: number;
  acceptanceRate: number;
} {
  const events = getStoredEvents();
  
  const shown = events.filter(e => e.type === 'suggestion_shown').length;
  const accepted = events.filter(e => e.type === 'suggestion_accepted').length;
  const rejected = events.filter(e => e.type === 'suggestion_rejected').length;
  
  const acceptanceRate = shown > 0 ? (accepted / shown) * 100 : 0;

  return {
    totalEvents: events.length,
    suggestionsShown: shown,
    suggestionsAccepted: accepted,
    suggestionsRejected: rejected,
    acceptanceRate: Math.round(acceptanceRate * 10) / 10,
  };
}

/**
 * Clear all telemetry events (when user opts out or manually clears)
 */
export function clearEvents(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear telemetry events:', error);
  }
}

/**
 * Export events as JSON for upload (for future backend integration)
 */
export function exportEvents(): { events: TelemetryEvent[]; exportedAt: string } {
  return {
    events: getStoredEvents(),
    exportedAt: new Date().toISOString(),
  };
}

/**
 * Mock upload function (placeholder for future backend integration)
 * In production, this would send to a backend endpoint
 */
export async function uploadEvents(telemetryEnabled: boolean): Promise<boolean> {
  if (!telemetryEnabled) {
    console.log('Telemetry upload disabled by user');
    return false;
  }

  try {
    const payload = exportEvents();
    
    // Mock: log the payload that would be sent
    console.log('Mock telemetry upload payload:', payload);
    
    // In a real scenario, you'd send this to your backend:
    // const response = await fetch('/api/telemetry', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(payload),
    // });
    // if (response.ok) {
    //   clearEvents();
    //   return true;
    // }
    
    // For now, just simulate success and clear events
    clearEvents();
    return true;
  } catch (error) {
    console.error('Failed to upload telemetry:', error);
    return false;
  }
}
