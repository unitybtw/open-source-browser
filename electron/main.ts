import { app, BrowserWindow, ipcMain, session, globalShortcut, dialog } from 'electron';
import path from 'path';
import fetch from 'cross-fetch';
import fs from 'fs';
// @ts-ignore
import unzip from 'unzip-crx-3';
import { ElectronBlocker } from '@cliqz/adblocker-electron';

app.commandLine.appendSwitch('enable-unsafe-webgpu');
app.commandLine.appendSwitch('enable-features', 'Vulkan,UseSkiaRenderer,WebAssemblySimd');

app.userAgentFallback = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

let mainWindow: BrowserWindow | null = null;
let isPrivacyShieldEnabled = true;
let blocker: ElectronBlocker | null = null;
let loadedExtensions: any[] = [];

ElectronBlocker.fromPrebuiltAdsAndTracking(fetch).then((engine) => {
  blocker = engine;
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 650,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
    backgroundColor: '#f8fafc',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,
      sandbox: false
    }
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  globalShortcut.register('CommandOrControl+Shift+K', () => {
    mainWindow?.webContents.send('shortcut', 'toggle-omnibox');
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
