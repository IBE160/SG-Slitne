import { useEffect, useState } from "react";
import { useTaskStore } from "../stores";
import { getPendingSyncCount, flushPendingSync, clearSyncQueue } from "../services/offline";

export default function Settings() {
  const aiAnalysisEnabled = useTaskStore((s) => s.aiAnalysisEnabled);
  const cloudModeEnabled = useTaskStore((s) => s.cloudModeEnabled);
  const setAIAnalysisEnabled = useTaskStore((s) => s.setAIAnalysisEnabled);
  const setCloudModeEnabled = useTaskStore((s) => s.setCloudModeEnabled);

  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<number>(0);

  useEffect(() => {
    // Optional: open based on hash (#settings)
    if (window.location.hash === "#settings") setOpen(true);
    const onHash = () => setOpen(window.location.hash === "#settings");
    window.addEventListener("hashchange", onHash);
    const interval = setInterval(() => setPending(getPendingSyncCount()), 3000);
    setPending(getPendingSyncCount());
    return () => window.removeEventListener("hashchange", onHash);
    // eslint-disable-next-line no-unreachable
    clearInterval(interval);
  }, []);

  return (
    <div className="p-3">
      <button
        className="px-3 py-2 text-sm rounded-md bg-gray-100 hover:bg-gray-200 border"
        onClick={() => {
          setOpen((v) => !v);
          // Keep hash in sync so header button reflects state
          if (!open) {
            window.location.hash = "#settings";
          } else {
            window.location.hash = "";
          }
        }}
        aria-expanded={open}
        aria-controls="settings-panel"
      >
        {open ? "Close Settings" : "Open Settings"}
      </button>

      {open && (
        <div id="settings-panel" className="mt-3 space-y-4">
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
                />
                <span className="w-12 h-6 bg-gray-300 rounded-full relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:bg-white after:rounded-full after:transition peer-checked:bg-green-500 peer-checked:after:left-6"></span>
              </label>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2 border-t mt-2">
              <div className="text-sm text-gray-700">
                Sync Queue
                <div className="text-xs text-gray-600">Pending: {pending}</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-3 py-1.5 text-sm rounded-md border bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                  onClick={async () => {
                    if (!cloudModeEnabled) return;
                    await flushPendingSync({ cloudEnabled: true });
                    setPending(getPendingSyncCount());
                  }}
                  disabled={!cloudModeEnabled || pending === 0}
                >
                  Sync now
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 text-sm rounded-md border bg-gray-100 hover:bg-gray-200"
                  onClick={() => {
                    if (!confirm('Clear all queued sync items?')) return;
                    clearSyncQueue();
                    setPending(getPendingSyncCount());
                  }}
                  disabled={pending === 0}
                >
                  Clear queue
                </button>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-600">
            This app is local-first. AI Analysis runs locally and does not send your content to any server.
            Read our brief in <a href="/docs/prd-smart-todo.md" className="underline hover:text-blue-700">Privacy & Data</a>.
          </p>
        </div>
      )}
    </div>
  );
}
