export type SearchEngine = 'google' | 'duckduckgo' | 'bing' | 'brave' | 'ecosia';

export const SEARCH_ENGINES: Record<SearchEngine, { name: string; searchUrl: string }> = {
  google: {
    name: 'Google',
    searchUrl: 'https://www.google.com/search?q='
  },
  duckduckgo: {
    name: 'DuckDuckGo',
    searchUrl: 'https://duckduckgo.com/?q='
  },
  bing: {
    name: 'Bing',
    searchUrl: 'https://www.bing.com/search?q='
  },
  brave: {
    name: 'Brave Search',
    searchUrl: 'https://search.brave.com/search?q='
  },
  ecosia: {
    name: 'Ecosia',
    searchUrl: 'https://www.ecosia.org/search?q='
  }
};

export function formatSearchUrl(query: string, engine: SearchEngine = 'google'): string {
  const trimmed = query.trim();
  if (!trimmed) return 'zen://newtab';

  // Check if query is a valid URL or domain
  const isUrl = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/.test(trimmed);
  if (isUrl) {
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return `https://${trimmed}`;
    }
    return trimmed;
  }

  // Handle custom protocols
  if (trimmed.startsWith('zen://') || trimmed.startsWith('about:')) {
    return trimmed;
  }

  // Otherwise, search with selected engine
  const engineConfig = SEARCH_ENGINES[engine] || SEARCH_ENGINES.google;
  return `${engineConfig.searchUrl}${encodeURIComponent(trimmed)}`;
}

export function getSearchEngineName(engine: SearchEngine = 'google'): string {
  return SEARCH_ENGINES[engine]?.name || 'Google';
}
