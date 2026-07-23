import React, { useEffect, useRef } from 'react';
import { Tab } from '../types/browser';
import { NewTabPage } from './NewTabPage';

interface BrowserViewProps {
  tab: Tab;
  onUpdateTab: (id: string, updates: Partial<Tab>) => void;
  onNewTab: (url?: string) => void;
  onFoundInPage: (result: any) => void;
  searchEngine?: 'google' | 'duckduckgo' | 'bing' | 'brave' | 'ecosia';
  privacyShield?: boolean;
}

export const BrowserView: React.FC<BrowserViewProps> = ({
  tab,
  onUpdateTab,
  onNewTab,
  searchEngine = 'google',
  privacyShield = true,
}) => {
  const webviewRef = useRef<HTMLWebViewElement | null>(null);

  const isInternalUrl = tab.url.startsWith('zen://') || tab.url.startsWith('about:');

  useEffect(() => {
    const webview = webviewRef.current;
    if (!webview || isInternalUrl) return;

    const handleDidStartLoading = () => onUpdateTab(tab.id, { isLoading: true });
    const handleDidStopLoading = () => onUpdateTab(tab.id, { isLoading: false });
    const handlePageTitleUpdated = (e: any) => onUpdateTab(tab.id, { title: e.title });
    const handlePageFaviconUpdated = (e: any) => {
      if (e.favicons && e.favicons.length > 0) {
        onUpdateTab(tab.id, { favicon: e.favicons[0] });
      }
    };

    webview.addEventListener('did-start-loading', handleDidStartLoading);
    webview.addEventListener('did-stop-loading', handleDidStopLoading);
    webview.addEventListener('page-title-updated', handlePageTitleUpdated);
    webview.addEventListener('page-favicon-updated', handlePageFaviconUpdated);

    return () => {
      webview.removeEventListener('did-start-loading', handleDidStartLoading);
      webview.removeEventListener('did-stop-loading', handleDidStopLoading);
      webview.removeEventListener('page-title-updated', handlePageTitleUpdated);
      webview.removeEventListener('page-favicon-updated', handlePageFaviconUpdated);
    };
  }, [tab.id, tab.url, isInternalUrl, onUpdateTab]);

  if (isInternalUrl) {
    if (tab.url === 'zen://newtab' || tab.url === 'about:blank') {
      return (
        <NewTabPage 
          onNavigate={(url) => onUpdateTab(tab.id, { url })} 
          searchEngine={searchEngine}
        />
      );
    }
  }

  return (
    <div className="w-full h-full relative bg-white dark:bg-slate-900">
      <iframe
        src={tab.url}
        className="w-full h-full border-none"
        title={tab.title || 'Web View'}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    </div>
  );
};
