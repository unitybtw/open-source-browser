import { ipcRenderer } from 'electron';

// Expose safe IPC APIs to the renderer process
(window as any).electronAPI = {
  onShortcut: (callback: (shortcut: string) => void) => {
    const handler = (_: any, shortcut: string) => callback(shortcut);
    ipcRenderer.on('shortcut', handler);
    return () => ipcRenderer.removeListener('shortcut', handler);
  },
  onDownloadUpdate: (callback: (data: any) => void) => {
    const handler = (_: any, data: any) => callback(data);
    ipcRenderer.on('download-update', handler);
    return () => ipcRenderer.removeListener('download-update', handler);
  },
  togglePrivacyShield: (enabled: boolean) => ipcRenderer.invoke('toggle-privacy-shield', enabled),
  getLoadedExtensions: () => ipcRenderer.invoke('get-loaded-extensions'),
  installCrxExtension: (filePath: string) => ipcRenderer.invoke('install-crx-extension', filePath),
  removeExtension: (extensionId: string) => ipcRenderer.invoke('remove-extension', extensionId)
};
