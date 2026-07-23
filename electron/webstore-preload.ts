import { ipcRenderer } from 'electron';

// Inject Chrome Web Store API wrapper into webviews
window.addEventListener('DOMContentLoaded', () => {
  if (window.location.hostname.includes('chromewebstore.google.com') || window.location.hostname.includes('chrome.google.com')) {
    // Intercept clicks on extension install buttons
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const installBtn = target.closest('[aria-label*="Add to Chrome"]') || target.closest('button');
      
      if (installBtn && installBtn.textContent?.includes('Add to Chrome')) {
        console.log('Intercepted Chrome Web Store Add button click');
      }
    }, true);
  }
});
