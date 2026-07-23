import React from 'react';

export const DownloadsModal: React.FC<{ isOpen: boolean; onClose: () => void; downloads: any[]; onClearDownloads: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full">
        <h2 className="text-lg font-bold mb-4">Downloads</h2>
        <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Close</button>
      </div>
    </div>
  );
};
