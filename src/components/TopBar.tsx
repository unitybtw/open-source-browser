import React, { useState } from 'react';
import { 
  ArrowLeft, ArrowRight, RotateCw, Home, Globe, Lock, Shield, 
  Share2, Camera, Search, Columns, ZoomIn, ZoomOut, Copy, Pin, 
  VolumeX, Plus, ShieldOff, Bookmark as BookmarkIcon, History, 
  Download, Settings, Bot, Eye, Wifi, Sparkles, X, ChevronDown, 
  Puzzle
} from 'lucide-react';
import { Tab, Bookmark } from '../types/browser';
import { formatSearchUrl, getSearchEngineName } from '../utils/searchEngine';
import { UserSettings } from './SettingsModal';

interface TopBarProps {
  tabs: Tab[];
  workspaces?: import('../types/browser').Workspace[];
  activeWorkspaceId?: string;
  onSelectWorkspace?: (id: string) => void;
  activeTabId: string;
  bookmarks: Bookmark[];
  isSplitView: boolean;
  isIncognito?: boolean;
  useVerticalTabs?: boolean;
  searchEngine?: 'google' | 'duckduckgo' | 'bing' | 'brave' | 'ecosia';
  onToggleBookmark: () => void;
  onOpenHistory: () => void;
  onOpenDownloads: () => void;
  onOpenSettings: () => void;
  onOpenShare: () => void;
  onTakeScreenshot: () => void;
  onOpenFindInPage: () => void;
  onToggleSplitView: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onDuplicateTab: (id: string, e: React.MouseEvent) => void;
  onTogglePinTab: (id: string, e: React.MouseEvent) => void;
  onToggleMuteTab: (id: string, e: React.MouseEvent) => void;
  onSelectTab: (id: string) => void;
  onNewTab: (url?: string) => void;
  onNewIncognitoTab: () => void;
  onCloseTab: (id: string, e: React.MouseEvent) => void;
  onNavigate: (url: string) => void;
  onGoBack: () => void;
  onGoForward: () => void;
  onReload: () => void;
  isVpnEnabled?: boolean;
  onToggleVpn?: () => void;
  onToggleAIAssistant: () => void;
  activeDownloadsCount?: number;
  showBookmarksBar?: boolean;
  onToggleReaderMode?: () => void;
  onOpenExtensions: () => void;
}

export const TopBar: React.FC<TopBarProps> = React.memo(({
  tabs,
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  activeTabId,
  bookmarks,
  activeDownloadsCount,
  isSplitView,
  isIncognito = false,
  useVerticalTabs = false,
  searchEngine = 'google',
  onToggleBookmark,
  onOpenHistory,
  onOpenDownloads,
  onOpenSettings,
  onOpenShare,
  onTakeScreenshot,
  onOpenFindInPage,
  onToggleSplitView,
  onSelectTab,
  onNewTab,
  onNewIncognitoTab,
  onCloseTab,
  onNavigate,
  onGoBack,
  onGoForward,
  onReload,
  isVpnEnabled,
  onToggleVpn,
  onToggleAIAssistant,
  onToggleReaderMode,
  onOpenExtensions
}) => {
  const [searchValue, setSearchValue] = useState('');
  const activeTab = tabs.find(t => t.id === activeTabId);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) return;
    const url = formatSearchUrl(searchValue, searchEngine);
    onNavigate(url);
    setSearchValue('');
  };

  return (
    <header className={`w-full flex flex-col select-none drag-region border-b ${isIncognito ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200 dark:bg-slate-900 dark:border-slate-800'}`}>
      {!useVerticalTabs && (
        <div className="flex items-end px-2 pt-2.5 h-11 gap-1">
          <div className="w-[70px] shrink-0" />
          <div className="flex-1 flex items-end gap-1 overflow-x-auto no-scrollbar drag-region">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTabId;
              return (
                <div
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`group flex items-center justify-between px-3 py-1.5 min-w-[120px] max-w-[240px] rounded-t-xl text-[13px] cursor-pointer transition-colors border-t border-x no-drag ${
                    isActive ? 'bg-white text-slate-900 border-slate-300 font-semibold dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700' : 'bg-slate-200/40 text-slate-600 dark:bg-slate-800/40 dark:text-slate-400'
                  }`}
                >
                  <span className="truncate">{tab.title || 'New Tab'}</span>
                  <button onClick={(e) => { e.stopPropagation(); onCloseTab(tab.id, e); }} className="opacity-50 hover:opacity-100 p-0.5">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
            <button onClick={() => onNewTab()} className="p-1.5 mb-1 text-slate-500 hover:bg-slate-200 rounded-lg no-drag">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className={`flex items-center px-3 py-1.5 gap-3 no-drag ${isIncognito ? 'bg-slate-800 border-b border-slate-700' : 'bg-white dark:bg-slate-800 dark:border-b dark:border-slate-700'}`}>
        <div className="flex items-center gap-1">
          <button onClick={onGoBack} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><ArrowLeft className="w-4 h-4" /></button>
          <button onClick={onGoForward} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><ArrowRight className="w-4 h-4" /></button>
          <button onClick={onReload} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><RotateCw className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 flex justify-center">
          <form onSubmit={handleSearchSubmit} className="w-full max-w-3xl relative">
            <input
              type="text"
              value={searchValue || activeTab?.url || ''}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={`Search ${getSearchEngineName(searchEngine)} or type a URL`}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-full py-1.5 px-4 text-[13px] outline-none bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500"
            />
          </form>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={onToggleAIAssistant} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-purple-600"><Sparkles className="w-4 h-4" /></button>
          <button onClick={onOpenSettings} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><Settings className="w-4 h-4" /></button>
        </div>
      </div>
    </header>
  );
});
