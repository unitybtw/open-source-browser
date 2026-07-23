import React, { useState, useEffect } from 'react';
import { Search, Command, Globe, Clock, ArrowRight } from 'lucide-react';
import { Tab } from '../types/browser';
import { formatSearchUrl } from '../utils/searchEngine';

interface SpotlightOmniboxProps {
  isOpen: boolean;
  onClose: () => void;
  tabs: Tab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onNewTab: (url?: string) => void;
  onCloseTab: (id: string) => void;
  onNavigate: (url: string) => void;
  searchEngine?: 'google' | 'duckduckgo' | 'bing' | 'brave' | 'ecosia';
}

export const SpotlightOmnibox: React.FC<SpotlightOmniboxProps> = ({
  isOpen,
  onClose,
  tabs,
  onSelectTab,
  onNewTab,
  onNavigate,
  searchEngine = 'google'
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const url = formatSearchUrl(query, searchEngine);
    onNavigate(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center pt-28">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-150">
        <form onSubmit={handleSubmit} className="flex items-center px-4 border-b border-slate-200 dark:border-slate-700 py-3">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a URL or search query..."
            className="w-full bg-transparent text-sm outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400"
          />
          <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 px-2 py-0.5 rounded font-mono">ESC to close</span>
        </form>
        <div className="p-2 max-h-64 overflow-y-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => { onSelectTab(t.id); onClose(); }}
              className="w-full text-left p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg flex items-center justify-between text-xs"
            >
              <span className="truncate font-medium">{t.title || t.url}</span>
              <span className="text-[10px] opacity-50">Switch Tab</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
