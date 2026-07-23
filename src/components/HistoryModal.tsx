import React from 'react';
import { HistoryItem } from '../types/browser';

export const HistoryModal: React.FC<{ isOpen: boolean; onClose: () => void; history: HistoryItem[]; onNavigate: (url: string) => void; onClearHistory: () => void; onRemoveHistoryItem: (id: string) => void }> = ({ isOpen, onClose, history }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full">
        <h2 className="text-lg font-bold mb-4">Browsing History</h2>
        <div className="max-h-60 overflow-y-auto">
          {history.length === 0 ? <p className="text-sm text-slate-500">No history yet.</p> : history.map(h => <div key={h.id} className="text-xs py-1">{h.title}</div>)}
        </div>
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg text-sm">Close</button>
      </div>
    </div>
  );
};
