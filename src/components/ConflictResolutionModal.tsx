// EPIC-8: Conflict Resolution UI
// Purpose: Show side-by-side comparison when sync conflicts detected

import { Task } from "../services/db";

export interface ConflictData {
  localTask: Task;
  remoteTask: Task;
  field: string; // which field changed
}

interface ConflictResolutionModalProps {
  conflict: ConflictData;
  onResolve: (resolution: 'local' | 'remote' | 'merge', mergedData?: Partial<Task>) => void;
  onCancel: () => void;
}

export default function ConflictResolutionModal({ 
  conflict, 
  onResolve, 
  onCancel 
}: ConflictResolutionModalProps) {
  const { localTask, remoteTask } = conflict;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const compareField = (field: keyof Task) => {
    const local = localTask[field];
    const remote = remoteTask[field];
    const isDifferent = JSON.stringify(local) !== JSON.stringify(remote);
    return { local, remote, isDifferent };
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-labelledby="conflict-title"
      aria-modal="true"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b sticky top-0 bg-white">
          <h2 id="conflict-title" className="text-xl font-bold text-gray-900">
            ⚠️ Sync Conflict Detected
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            This task was modified both locally and remotely. Choose which version to keep.
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Task Title Comparison */}
          {(() => {
            const { local, remote, isDifferent } = compareField('title');
            return (
              <div className={`rounded-lg border ${isDifferent ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'}`}>
                <div className="px-4 py-2 bg-gray-100 font-medium text-sm border-b">
                  Task Title {isDifferent && <span className="text-yellow-600">(Changed)</span>}
                </div>
                <div className="grid grid-cols-2 divide-x">
                  <div className="p-3">
                    <div className="text-xs text-gray-500 mb-1">Local Version</div>
                    <div className="font-medium">{local as string}</div>
                  </div>
                  <div className="p-3">
                    <div className="text-xs text-gray-500 mb-1">Remote Version</div>
                    <div className="font-medium">{remote as string}</div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Description Comparison */}
          {(() => {
            const { local, remote, isDifferent } = compareField('description');
            if (!local && !remote) return null;
            return (
              <div className={`rounded-lg border ${isDifferent ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'}`}>
                <div className="px-4 py-2 bg-gray-100 font-medium text-sm border-b">
                  Description {isDifferent && <span className="text-yellow-600">(Changed)</span>}
                </div>
                <div className="grid grid-cols-2 divide-x">
                  <div className="p-3">
                    <div className="text-xs text-gray-500 mb-1">Local Version</div>
                    <div className="text-sm">{local as string || <em className="text-gray-400">Empty</em>}</div>
                  </div>
                  <div className="p-3">
                    <div className="text-xs text-gray-500 mb-1">Remote Version</div>
                    <div className="text-sm">{remote as string || <em className="text-gray-400">Empty</em>}</div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Priority Comparison */}
          {(() => {
            const { local, remote, isDifferent } = compareField('priority');
            return (
              <div className={`rounded-lg border ${isDifferent ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'}`}>
                <div className="px-4 py-2 bg-gray-100 font-medium text-sm border-b">
                  Priority {isDifferent && <span className="text-yellow-600">(Changed)</span>}
                </div>
                <div className="grid grid-cols-2 divide-x">
                  <div className="p-3">
                    <div className="text-xs text-gray-500 mb-1">Local Version</div>
                    <div className={`inline-block px-2 py-1 rounded text-sm ${
                      local === 'high' ? 'bg-red-100 text-red-800' :
                      local === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {local as string}
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="text-xs text-gray-500 mb-1">Remote Version</div>
                    <div className={`inline-block px-2 py-1 rounded text-sm ${
                      remote === 'high' ? 'bg-red-100 text-red-800' :
                      remote === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {remote as string}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Status Comparison */}
          {(() => {
            const { local, remote, isDifferent } = compareField('status');
            return (
              <div className={`rounded-lg border ${isDifferent ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'}`}>
                <div className="px-4 py-2 bg-gray-100 font-medium text-sm border-b">
                  Status {isDifferent && <span className="text-yellow-600">(Changed)</span>}
                </div>
                <div className="grid grid-cols-2 divide-x">
                  <div className="p-3">
                    <div className="text-xs text-gray-500 mb-1">Local Version</div>
                    <div className="text-sm">{local === 'completed' ? '✅ Completed' : '⬜ Active'}</div>
                  </div>
                  <div className="p-3">
                    <div className="text-xs text-gray-500 mb-1">Remote Version</div>
                    <div className="text-sm">{remote === 'completed' ? '✅ Completed' : '⬜ Active'}</div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Labels Comparison */}
          {(() => {
            const { local, remote, isDifferent } = compareField('labels');
            const localLabels = (local as string[] || []);
            const remoteLabels = (remote as string[] || []);
            if (localLabels.length === 0 && remoteLabels.length === 0) return null;
            
            return (
              <div className={`rounded-lg border ${isDifferent ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'}`}>
                <div className="px-4 py-2 bg-gray-100 font-medium text-sm border-b">
                  Labels {isDifferent && <span className="text-yellow-600">(Changed)</span>}
                </div>
                <div className="grid grid-cols-2 divide-x">
                  <div className="p-3">
                    <div className="text-xs text-gray-500 mb-1">Local Version</div>
                    <div className="flex flex-wrap gap-1">
                      {localLabels.length > 0 ? localLabels.map((label) => (
                        <span key={label} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {label}
                        </span>
                      )) : <em className="text-gray-400 text-sm">No labels</em>}
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="text-xs text-gray-500 mb-1">Remote Version</div>
                    <div className="flex flex-wrap gap-1">
                      {remoteLabels.length > 0 ? remoteLabels.map((label) => (
                        <span key={label} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {label}
                        </span>
                      )) : <em className="text-gray-400 text-sm">No labels</em>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Timestamps */}
          <div className="rounded-lg border border-gray-200 bg-gray-50">
            <div className="px-4 py-2 bg-gray-100 font-medium text-sm border-b">
              Modification Times
            </div>
            <div className="grid grid-cols-2 divide-x">
              <div className="p-3">
                <div className="text-xs text-gray-500 mb-1">Local Last Updated</div>
                <div className="text-sm">{formatDate(localTask.updatedAt)}</div>
              </div>
              <div className="p-3">
                <div className="text-xs text-gray-500 mb-1">Remote Last Updated</div>
                <div className="text-sm">{formatDate(remoteTask.updatedAt)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t bg-gray-50 flex items-center justify-between gap-3">
          <button
            type="button"
            className="px-4 py-2 text-sm rounded-md border bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            onClick={onCancel}
            aria-label="Cancel conflict resolution"
          >
            Cancel
          </button>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-4 py-2 text-sm rounded-md border bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              onClick={() => onResolve('local')}
              aria-label="Keep local version"
            >
              Keep Local
            </button>
            
            <button
              type="button"
              className="px-4 py-2 text-sm rounded-md border bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
              onClick={() => onResolve('remote')}
              aria-label="Keep remote version"
            >
              Keep Remote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
