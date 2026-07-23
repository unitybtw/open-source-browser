import React from 'react';

export const WorkspaceManager: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  workspaces: any[];
  onUpdateWorkspaces: (workspaces: any[]) => void;
  activeWorkspaceId: string;
  onSelectWorkspace: (id: string) => void;
  isIncognito?: boolean;
}> = ({ isOpen, onClose, workspaces, onUpdateWorkspaces, activeWorkspaceId, onSelectWorkspace }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-lg w-full">
        <h2 className="text-xl font-bold mb-4">Manage Workspaces</h2>
        <div className="space-y-2 mb-6">
          {workspaces.map(w => (
            <div key={w.id} className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700 rounded-xl">
              <span className="font-medium">{w.name}</span>
              <button 
                onClick={() => onSelectWorkspace(w.id)}
                className={`px-3 py-1 text-xs rounded-lg ${w.id === activeWorkspaceId ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-600'}`}
              >
                {w.id === activeWorkspaceId ? 'Active' : 'Switch'}
              </button>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="w-full py-2 bg-slate-200 dark:bg-slate-700 rounded-xl text-sm font-medium">Done</button>
      </div>
    </div>
  );
};
