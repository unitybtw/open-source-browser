import React from 'react';

export const ScreenshotModal: React.FC<{ isOpen: boolean; onClose: () => void; imageDataUrl: string | null; pageTitle: string }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-lg w-full">
        <h2 className="text-lg font-bold mb-4">Screenshot Captured</h2>
        <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Close</button>
      </div>
    </div>
  );
};
