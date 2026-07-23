import React from 'react';
import { X, Bot, Sparkles, Send } from 'lucide-react';

export const SidePanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <aside className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-full z-20">
      <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span className="font-semibold text-sm">AI Assistant</span>
        </div>
        <button onClick={onClose} className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        <p className="text-xs text-slate-500">Ask me anything about the page or web!</p>
      </div>
      <div className="p-3 border-t border-slate-200 dark:border-slate-800">
        <input type="text" placeholder="Type a message..." className="w-full text-xs p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" />
      </div>
    </aside>
  );
};
