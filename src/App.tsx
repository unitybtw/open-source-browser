import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { TopBar } from './components/TopBar';
import { BrowserView } from './components/BrowserView';
import { HistoryModal } from './components/HistoryModal';
import { DownloadsModal } from './components/DownloadsModal';
import { SettingsModal, UserSettings } from './components/SettingsModal';
import { ShareModal } from './components/ShareModal';
import { ScreenshotModal } from './components/ScreenshotModal';
import { ExtensionsModal } from './components/ExtensionsModal';
import { SpotlightOmnibox } from './components/SpotlightOmnibox';
import { VpnPopover, VpnLocation } from './components/VpnPopover';
import { SidePanel } from './components/SidePanel';
import { WorkspaceManager } from './components/WorkspaceManager';
import { SidebarTabs } from './components/SidebarTabs';
import { ReaderMode } from './components/ReaderMode';
import { aiAgent } from './services/aiAgent';
import { Tab, Bookmark, HistoryItem, DownloadItem, Workspace } from './types/browser';

const DEFAULT_WORKSPACES: Workspace[] = [
  { id: 'default', name: 'Main', color: 'slate', icon: 'LayoutGrid', isDefault: true },
  { id: 'work', name: 'Work', color: 'blue', icon: 'Briefcase' },
  { id: 'personal', name: 'Personal', color: 'emerald', icon: 'User' },
];

export function App() {
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: '1',
      url: 'zen://newtab',
      title: 'New Tab',
      isLoading: false,
      canGoBack: false,
      canGoForward: false,
      workspaceId: 'default'
    }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('1');
  const [workspaces, setWorkspaces] = useState<Workspace[]>(DEFAULT_WORKSPACES);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>('default');
  const [isWorkspaceManagerOpen, setIsWorkspaceManagerOpen] = useState(false);

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDownloadsOpen, setIsDownloadsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isScreenshotOpen, setIsScreenshotOpen] = useState(false);
  const [isExtensionsOpen, setIsExtensionsOpen] = useState(false);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isVpnPopoverOpen, setIsVpnPopoverOpen] = useState(false);
  const [isReaderModeOpen, setIsReaderModeOpen] = useState(false);
  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string | null>(null);

  const [isSplitView, setIsSplitView] = useState(false);
  const [vpnEnabled, setVpnEnabled] = useState(false);
  const [vpnLocation, setVpnLocation] = useState('US East');

  const [settings, setSettings] = useState<UserSettings>({
    searchEngine: 'google',
    theme: 'system',
    privacyShield: true,
    blockAds: true,
    blockTrackers: true,
    httpsOnly: true,
    useVerticalTabs: false,
    showBookmarksBar: true
  });

  const vpnLocations: VpnLocation[] = [
    { id: 'us-east', name: 'US East', country: 'United States', flag: '🇺🇸', latency: 25 },
    { id: 'us-west', name: 'US West', country: 'United States', flag: '🇺🇸', latency: 45 },
    { id: 'eu-west', name: 'Frankfurt', country: 'Germany', flag: '🇩🇪', latency: 15 },
    { id: 'ap-east', name: 'Tokyo', country: 'Japan', flag: '🇯🇵', latency: 120 },
  ];

  const handleNewTab = useCallback((url?: string | any) => {
    const finalUrl = typeof url === 'string' ? url : 'zen://newtab';
    const newTab: Tab = {
      id: Date.now().toString() + '_' + Math.random().toString(36).substring(2, 7),
      url: finalUrl,
      title: 'New Tab',
      isLoading: false,
      canGoBack: false,
      canGoForward: false,
      workspaceId: activeWorkspaceId
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  }, [activeWorkspaceId]);

  const handleSelectWorkspace = useCallback((workspaceId: string) => {
    setActiveWorkspaceId(workspaceId);
    setTabs(prev => {
      const workspaceTabs = prev.filter(t => t.workspaceId === workspaceId || (!t.workspaceId && workspaceId === 'default'));
      if (workspaceTabs.length > 0) {
        setActiveTabId(workspaceTabs[0].id);
        return prev;
      } else {
        const newTab: Tab = {
          id: Date.now().toString() + '_' + Math.random().toString(36).substring(2, 7),
          url: 'zen://newtab',
          title: 'New Tab',
          isLoading: false,
          canGoBack: false,
          canGoForward: false,
          workspaceId
        };
        setActiveTabId(newTab.id);
        return [...prev, newTab];
      }
    });
  }, []);

  const handleCloseTab = useCallback((tabId: string) => {
    setTabs(prev => {
      const filtered = prev.filter(t => t.id !== tabId);
      if (filtered.length === 0) {
        const newTab: Tab = {
          id: Date.now().toString(),
          url: 'zen://newtab',
          title: 'New Tab',
          isLoading: false,
          canGoBack: false,
          canGoForward: false,
          workspaceId: activeWorkspaceId
        };
        setActiveTabId(newTab.id);
        return [newTab];
      }
      if (tabId === activeTabId) {
        const workspaceTabs = filtered.filter(t => t.workspaceId === activeWorkspaceId || (!t.workspaceId && activeWorkspaceId === 'default'));
        if (workspaceTabs.length > 0) {
          setActiveTabId(workspaceTabs[workspaceTabs.length - 1].id);
        } else {
          setActiveTabId(filtered[filtered.length - 1].id);
        }
      }
      return filtered;
    });
  }, [activeTabId, activeWorkspaceId]);

  const activeTab = tabs.find(t => t.id === activeTabId);

  const workspaceTabs = tabs.filter(t => t.workspaceId === activeWorkspaceId || (!t.workspaceId && activeWorkspaceId === 'default'));
  const activeDownloadsCount = downloads.filter(d => d.state === 'progressing').length;

  return (
    <div className={`flex ${settings.useVerticalTabs ? 'flex-row' : 'flex-col'} h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100`}>
      {settings.useVerticalTabs && (
        <div className="pt-8 bg-slate-50 dark:bg-slate-900 h-full flex flex-col shrink-0 drag-region">
          <SidebarTabs
            tabs={workspaceTabs}
            activeTabId={activeTabId}
            onSelectTab={setActiveTabId}
            onCloseTab={handleCloseTab}
            onNewTab={handleNewTab}
            onToggleMuteTab={() => {}}
            workspaces={workspaces}
            activeWorkspaceId={activeWorkspaceId}
            onSelectWorkspace={handleSelectWorkspace}
            isIncognito={activeTab?.isIncognito}
          />
        </div>
      )}

      <div className={`flex flex-col flex-1 min-w-0 ${settings.useVerticalTabs ? 'pt-8' : ''}`}>
        <TopBar 
          tabs={workspaceTabs}
          workspaces={workspaces}
          activeWorkspaceId={activeWorkspaceId}
          onSelectWorkspace={handleSelectWorkspace}
          activeTabId={activeTabId}
          bookmarks={bookmarks}
          activeDownloadsCount={activeDownloadsCount}
          showBookmarksBar={settings.showBookmarksBar}
          useVerticalTabs={settings.useVerticalTabs}
          onToggleReaderMode={() => setIsReaderModeOpen(prev => !prev)}
          isSplitView={isSplitView}
          isIncognito={activeTab?.isIncognito}
          searchEngine={settings.searchEngine}
          onToggleBookmark={() => {}}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onOpenDownloads={() => setIsDownloadsOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenExtensions={() => setIsExtensionsOpen(true)}
          onOpenShare={() => setIsShareOpen(true)}
          onTakeScreenshot={() => setIsScreenshotOpen(true)}
          onOpenFindInPage={() => {}}
          onToggleSplitView={() => setIsSplitView(prev => !prev)}
          onZoomIn={() => {}}
          onZoomOut={() => {}}
          onDuplicateTab={() => {}}
          onTogglePinTab={() => {}}
          onToggleMuteTab={() => {}}
          onSelectTab={setActiveTabId}
          onNewTab={handleNewTab}
          onNewIncognitoTab={() => {}}
          onCloseTab={handleCloseTab}
          onNavigate={(url) => {
            if (activeTab) {
              setTabs(prev => prev.map(t => t.id === activeTab.id ? { ...t, url } : t));
            }
          }}
          onGoBack={() => {}}
          onGoForward={() => {}}
          onReload={() => {}}
          isVpnEnabled={vpnEnabled}
          onToggleVpn={() => setIsVpnPopoverOpen(prev => !prev)}
          onToggleAIAssistant={() => setIsSidePanelOpen(prev => !prev)}
        />

        <main className="flex-1 relative overflow-hidden flex">
          <div className="flex-1 h-full relative">
            {tabs.map((tab) => (
              <div 
                key={tab.id}
                className={`absolute inset-0 w-full h-full transition-opacity duration-150 ${
                  tab.id === activeTabId ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                <BrowserView 
                  tab={tab} 
                  onUpdateTab={(id, updates) => setTabs(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))}
                  onNewTab={handleNewTab}
                  onFoundInPage={() => {}}
                  searchEngine={settings.searchEngine}
                  privacyShield={settings.privacyShield}
                />
              </div>
            ))}
          </div>

          <SidePanel 
            isOpen={isSidePanelOpen} 
            onClose={() => setIsSidePanelOpen(false)} 
          />
        </main>
      </div>

      <WorkspaceManager 
        isOpen={isWorkspaceManagerOpen} 
        onClose={() => setIsWorkspaceManagerOpen(false)} 
        workspaces={workspaces} 
        onUpdateWorkspaces={setWorkspaces} 
        activeWorkspaceId={activeWorkspaceId} 
        onSelectWorkspace={handleSelectWorkspace} 
        isIncognito={activeTab?.isIncognito} 
      />
    </div>
  );
}

export default App;
