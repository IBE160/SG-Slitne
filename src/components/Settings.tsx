import { useEffect, useState } from "react";
import { useTaskStore } from "../stores";
import { getPendingSyncCount, getRetryingSyncCount, getFailedSyncCount, flushPendingSync, clearSyncQueue } from "../services/offline";
import { getPendingEventCount, getEventsSummary, uploadEvents, clearEvents } from "../services/telemetry";
import { addSyncHistoryEntry, getLastSuccessfulSync, getRecentHistory, getSyncStats } from "../services/sync-history";

export default function Settings() {
  const aiAnalysisEnabled = useTaskStore((s) => s.aiAnalysisEnabled);
  const cloudModeEnabled = useTaskStore((s) => s.cloudModeEnabled);
  const telemetryEnabled = useTaskStore((s) => s.telemetryEnabled);
  const setAIAnalysisEnabled = useTaskStore((s) => s.setAIAnalysisEnabled);
  const setCloudModeEnabled = useTaskStore((s) => s.setCloudModeEnabled);
  const setTelemetryEnabled = useTaskStore((s) => s.setTelemetryEnabled);

  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<number>(0);
  const [retrying, setRetrying] = useState<number>(0);
  const [failed, setFailed] = useState<number>(0);
  const [showHistory, setShowHistory] = useState(false);
  const [pendingEvents, setPendingEvents] = useState<number>(0);
  const [eventsSummary, setEventsSummary] = useState({
    suggestionsShown: 0,
    suggestionsAccepted: 0,
    acceptanceRate: 0,
  });

  useEffect(() => {
    // Optional: open based on hash (#settings)
    if (window.location.hash === "#settings") setOpen(true);
    const onHash = () => setOpen(window.location.hash === "#settings");
    window.addEventListener("hashchange", onHash);
    const interval = setInterval(() => {
      setPending(getPendingSyncCount());
      setRetrying(getRetryingSyncCount());
      setFailed(getFailedSyncCount());
      setPendingEvents(getPendingEventCount());
      const summary = getEventsSummary();
      setEventsSummary({
        suggestionsShown: summary.suggestionsShown,
        suggestionsAccepted: summary.suggestionsAccepted,
        acceptanceRate: summary.acceptanceRate,
      });
    }, 3000);
    setPending(getPendingSyncCount());
    setRetrying(getRetryingSyncCount());
    setFailed(getFailedSyncCount());
    setPendingEvents(getPendingEventCount());
    const summary = getEventsSummary();
    setEventsSummary({
      suggestionsShown: summary.suggestionsShown,
      suggestionsAccepted: summary.suggestionsAccepted,
      acceptanceRate: summary.acceptanceRate,
    });
    return () => window.removeEventListener("hashchange", onHash);
    // eslint-disable-next-line no-unreachable
    clearInterval(interval);
  }, []);

  return (
    <div className="p-3">
      <button
        className="px-3 py-2 text-sm rounded-md bg-gray-100 hover:bg-gray-200 border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        onClick={() => {
          setOpen((v) => !v);
          // Keep hash in sync so header button reflects state
          if (!open) {
            window.location.hash = "#settings";
          } else {
            window.location.hash = "";
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && open) {
            setOpen(false);
            window.location.hash = "";
          }
        }}
        aria-expanded={open}
        aria-controls="settings-panel"
        aria-label="Toggle settings panel"
      >
        {open ? "Close Settings" : "Open Settings"}
      </button>

      {open && (
        <div id="settings-panel" className="mt-3 space-y-4" role="region" aria-label="Settings and privacy controls">
          <h2 className="text-lg font-semibold">Settings & Privacy</h2>
          <div className="rounded-lg border p-3 space-y-3 bg-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-medium">AI Analysis</div>
                <div className="text-sm text-gray-600">
                  Suggest labels and insights locally. No cloud calls.
                </div>
              </div>
              <label className="inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={aiAnalysisEnabled}
                  onChange={(e) => setAIAnalysisEnabled(e.target.checked)}
                  aria-label="Enable AI Analysis for local label suggestions and insights"
                />
                <span className="w-12 h-6 bg-gray-300 rounded-full relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:bg-white after:rounded-full after:transition peer-checked:bg-green-500 peer-checked:after:left-6"></span>
              </label>
            </div>

            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-medium">Cloud Mode</div>
                <div className="text-sm text-gray-600">
                  Enable cloud syncing features (future). May send metadata.
                </div>
              </div>
              <label className="inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={cloudModeEnabled}
                  onChange={(e) => setCloudModeEnabled(e.target.checked)}
                  aria-label="Enable Cloud Mode for future cloud sync features"
                />
                <span className="w-12 h-6 bg-gray-300 rounded-full relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:bg-white after:rounded-full after:transition peer-checked:bg-green-500 peer-checked:after:left-6"></span>
              </label>
            </div>

            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-medium">Telemetry & Analytics</div>
                <div className="text-sm text-gray-600">
                  Opt-in to share anonymous suggestion feedback. Stored locally until you upload.
                </div>
              </div>
              <label className="inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={telemetryEnabled}
                  onChange={(e) => setTelemetryEnabled(e.target.checked)}
                  aria-label="Enable telemetry and analytics collection"
                />
                <span className="w-12 h-6 bg-gray-300 rounded-full relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:bg-white after:rounded-full after:transition peer-checked:bg-green-500 peer-checked:after:left-6"></span>
              </label>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2 border-t mt-2">
              <div className="text-sm text-gray-700">
                Sync Queue
                <div className="text-xs text-gray-600">
                  Pending: {pending}
                  {retrying > 0 && <> • Retrying: {retrying}</>}
                  {failed > 0 && <> • Failed: <span className="text-red-600">{failed}</span></>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-3 py-1.5 text-sm rounded-md border bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 transition-colors"
                  onClick={async () => {
                    if (!cloudModeEnabled) return;
                    const startTime = Date.now();
                    const result = await flushPendingSync({ cloudEnabled: true });
                    const duration = Date.now() - startTime;
                    
                    // Log to history
                    const status = result.failed === 0 ? 'success' : 
                                   result.processed > 0 ? 'partial' : 'failed';
                    addSyncHistoryEntry({
                      operation: 'manual_sync',
                      status,
                      itemsProcessed: result.processed,
                      itemsFailed: result.failed,
                      itemsRetrying: result.retrying,
                      permanentFailures: result.permanent_failures,
                      duration,
                    });
                    
                    setPending(getPendingSyncCount());
                    setRetrying(getRetryingSyncCount());
                    setFailed(getFailedSyncCount());
                  }}
                  disabled={!cloudModeEnabled || pending === 0}
                  aria-label="Sync pending changes to cloud"
                >
                  Sync now
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 text-sm rounded-md border bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 disabled:opacity-50 transition-colors"
                  onClick={() => {
                    if (!confirm('Clear all queued sync items?')) return;
                    addSyncHistoryEntry({
                      operation: 'clear_queue',
                      status: 'success',
                      itemsProcessed: pending,
                      itemsFailed: 0,
                    });
                    clearSyncQueue();
                    setPending(getPendingSyncCount());
                    setRetrying(getRetryingSyncCount());
                    setFailed(getFailedSyncCount());
                  }}
                  disabled={pending === 0}
                  aria-label="Clear all queued sync items"
                >
                  Clear queue
                </button>
              </div>
            </div>

            {/* Sync Status Dashboard */}
            <div className="pt-2 border-t mt-2">
              <button
                type="button"
                className="w-full flex items-center justify-between text-sm text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                onClick={() => setShowHistory(!showHistory)}
                aria-expanded={showHistory}
                aria-label="Toggle sync history panel"
              >
                <span className="font-medium">Sync History & Status</span>
                <svg className={`w-4 h-4 transition-transform ${showHistory ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showHistory && (
                <div className="mt-2 space-y-2 text-xs">
                  {(() => {
                    const lastSync = getLastSuccessfulSync();
                    const stats = getSyncStats();
                    const recent = getRecentHistory(5);
                    
                    return (
                      <>
                        <div className="bg-gray-50 rounded p-2 space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Last successful sync:</span>
                            <span className="font-medium">
                              {lastSync ? new Date(lastSync.timestamp).toLocaleString() : 'Never'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total syncs:</span>
                            <span className="font-medium">{stats.totalSyncs}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Success rate:</span>
                            <span className="font-medium">{stats.successRate.toFixed(1)}%</span>
                          </div>
                          {stats.averageDuration > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Avg duration:</span>
                              <span className="font-medium">{stats.averageDuration.toFixed(0)}ms</span>
                            </div>
                          )}
                        </div>
                        
                        {recent.length > 0 && (
                          <div className="space-y-1">
                            <div className="font-medium text-gray-700">Recent Activity:</div>
                            {recent.map((entry) => (
                              <div key={entry.id} className="bg-gray-50 rounded p-2 space-y-0.5">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">
                                    {entry.operation === 'manual_sync' ? '📤 Manual Sync' :
                                     entry.operation === 'auto_sync' ? '🔄 Auto Sync' :
                                     entry.operation === 'retry' ? '🔁 Retry' :
                                     '🗑️ Clear Queue'}
                                  </span>
                                  <span className={`px-1.5 py-0.5 rounded text-xs ${
                                    entry.status === 'success' ? 'bg-green-100 text-green-800' :
                                    entry.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {entry.status}
                                  </span>
                                </div>
                                <div className="text-gray-600">
                                  {new Date(entry.timestamp).toLocaleString()}
                                </div>
                                <div className="text-gray-600">
                                  Processed: {entry.itemsProcessed} • Failed: {entry.itemsFailed}
                                  {entry.itemsRetrying !== undefined && entry.itemsRetrying > 0 && (
                                    <> • Retrying: {entry.itemsRetrying}</>
                                  )}
                                  {entry.permanentFailures !== undefined && entry.permanentFailures > 0 && (
                                    <> • Permanent: <span className="text-red-600">{entry.permanentFailures}</span></>
                                  )}
                                </div>
                                {entry.errorMessage && (
                                  <div className="text-red-600 text-xs mt-1">
                                    Error: {entry.errorMessage}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            {telemetryEnabled && (
              <div className="flex items-center justify-between gap-3 pt-2 border-t mt-2">
                <div className="text-sm text-gray-700">
                  Telemetry Events
                  <div className="text-xs text-gray-600">
                    Pending: {pendingEvents}
                    {eventsSummary.suggestionsShown > 0 && (
                      <>
                        <br />
                        Shown: {eventsSummary.suggestionsShown} • Accepted: {eventsSummary.suggestionsAccepted}
                        <br />
                        Acceptance rate: {eventsSummary.acceptanceRate}%
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="px-3 py-1.5 text-sm rounded-md border bg-purple-600 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 disabled:opacity-50 transition-colors"
                    onClick={async () => {
                      const success = await uploadEvents(telemetryEnabled);
                      if (success) {
                        setPendingEvents(0);
                        setEventsSummary({ suggestionsShown: 0, suggestionsAccepted: 0, acceptanceRate: 0 });
                      }
                    }}
                    disabled={pendingEvents === 0}
                    aria-label="Upload telemetry events"
                  >
                    Upload
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1.5 text-sm rounded-md border bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 disabled:opacity-50 transition-colors"
                    onClick={() => {
                      if (!confirm('Clear all telemetry events?')) return;
                      clearEvents();
                      setPendingEvents(0);
                      setEventsSummary({ suggestionsShown: 0, suggestionsAccepted: 0, acceptanceRate: 0 });
                    }}
                    disabled={pendingEvents === 0}
                    aria-label="Clear all telemetry events"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-600">
            This app is local-first. AI Analysis and Telemetry are entirely local and do not send your content or data to any server without your explicit consent and action.
            Read our brief in <a href="/docs/prd-smart-todo.md" className="underline hover:text-blue-700">Privacy & Data</a>.
          </p>
        </div>
      )}
    </div>
  );
}
