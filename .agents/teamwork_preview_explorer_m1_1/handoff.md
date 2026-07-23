# Audit Report & Handoff: R1 IPC & Main Process Code Health

**Target Files**:
- `electron/main.ts`
- `electron/preload.ts`
- `src/vite-env.d.ts`
- `src/App.tsx`
- `src/components/*` (`BrowserView.tsx`, `DownloadsModal.tsx`, `ZenCopilot.tsx`, etc.)

---

## 1. Observation

### 1.1 `electron/preload.ts` — IPC Bridge missing listener removal / unmount cleanup
- **File**: `electron/preload.ts`, Lines 3–7
```ts
3: contextBridge.exposeInMainWorld('electronAPI', {
4:   checkOllama: () => ipcRenderer.invoke('check-ollama'),
5:   onShortcut: (callback: (event: any, command: string) => void) => ipcRenderer.on('shortcut', callback),
6:   onDownloadUpdate: (callback: (event: any, data: any) => void) => ipcRenderer.on('download-update', callback)
7: });
```
- **File**: `src/App.tsx`, Lines 111–124
```ts
111:   // Listen to IPC events from main process (Shortcuts & Downloads)
112:   useEffect(() => {
113:     if (window.electronAPI?.onShortcut) {
114:       window.electronAPI.onShortcut((event: any, command: string) => {
115:         console.log('Shortcut received in React:', command);
116:         if (command === 'search') {
117:           // You could focus the omnibox here by tracking its ref...
118:         } else if (command === 'copilot') {
119:           setIsCopilotOpen(prev => !prev);
120:         }
121:       });
122:     }
123:   }, []);
```

### 1.2 `electron/main.ts` — Missing `closed` event listener on `mainWindow` singleton
- **File**: `electron/main.ts`, Lines 8–26, 128–140
```ts
8: let mainWindow: BrowserWindow | null = null;
9: 
10: function createWindow() {
11:   mainWindow = new BrowserWindow({ ... });
```
- `mainWindow.on('closed', () => { mainWindow = null; })` is **completely missing**.
- Global shortcut dispatch (`electron/main.ts:128–135`):
```ts
128:   app.on('browser-window-focus', () => {
129:     globalShortcut.register('CommandOrControl+K', () => {
130:       mainWindow?.webContents.send('shortcut', 'toggle-omnibox');
131:     });
132:     globalShortcut.register('CommandOrControl+J', () => {
133:       mainWindow?.webContents.send('shortcut', 'toggle-copilot');
134:     });
135:   });
```

### 1.3 `electron/main.ts` — Session listeners registered repeatedly in `createWindow()`
- **File**: `electron/main.ts`, Lines 45–52, 55–98, 101–109
```ts
45:   session.defaultSession.webRequest.onBeforeRequest((details, callback) => { ... });
55:   session.defaultSession.on('will-download', (event, item, webContents) => { ... });
101:  session.defaultSession.webRequest.onHeadersReceived((details, callback) => { ... });
```
- Attached directly inside `createWindow()`. `session.defaultSession` is a global singleton across the lifetime of the application.

### 1.4 `electron/main.ts` — Dangling `updated` event listener on `DownloadItem`
- **File**: `electron/main.ts`, Lines 69–87, 89–97
```ts
69:     item.on('updated', (event, state) => {
70:       if (state === 'interrupted') { ... }
71:       else if (state === 'progressing') { ... }
72:     });
89:     item.once('done', (event, state) => {
90:       mainWindow?.webContents.send('download-update', { ... });
91:     });
```
- The `'updated'` listener attached via `item.on('updated', ...)` is **never removed** when the download reaches `done` (completed/cancelled).

### 1.5 `electron/main.ts` — Unhandled Promise Rejection in `loadURL` retry
- **File**: `electron/main.ts`, Lines 112–115
```ts
112:   if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
113:     mainWindow.loadURL(devUrl).catch(() => {
114:       setTimeout(() => mainWindow?.loadURL(devUrl), 1000);
115:     });
116:   }
```
- The `mainWindow?.loadURL(devUrl)` promise inside `setTimeout` lacks `.catch()`.

### 1.6 `electron/main.ts` — Unbounded HTTP `fetch` in IPC Handler `check-ollama`
- **File**: `electron/main.ts`, Lines 151–163
```ts
151: ipcMain.handle('check-ollama', async () => {
152:   try {
153:     const res = await fetch('http://localhost:11434/api/tags');
...
```
- No `AbortSignal.timeout(...)` or network timeout configured.

### 1.7 Unconsumed `download-update` IPC Channel in Renderer
- **File**: `src/App.tsx`, Lines 65, 111–124; `src/components/DownloadsModal.tsx`
- Main process sends `download-update` messages (`electron/main.ts:60`), preload defines `onDownloadUpdate`, but zero React components subscribe to `onDownloadUpdate`. `downloads` state in `App.tsx` remains empty forever.

### 1.8 Type Safety Deficiencies in `src/vite-env.d.ts` & `electron/preload.ts`
- **File**: `src/vite-env.d.ts`, Lines 3–9
```ts
interface Window {
  electronAPI?: {
    checkOllama: () => Promise<{ available: boolean; models: string[] }>;
    onShortcut: (callback: (event: any, command: string) => void) => void;
    onDownloadUpdate: (callback: (event: any, data: any) => void) => void;
  };
}
```
- Callback accepts `event: any` (exposing internal `IpcRendererEvent`), payload uses `data: any`, and return type is `void` instead of cleanup unsubscribe function `() => void`.

---

## 2. Logic Chain

### 2.1 IPC Listener Leaks (Question 1 & 2)
1. `ipcRenderer.on(channel, listener)` adds `listener` to the internal listener array of `ipcRenderer`.
2. `onShortcut` in `preload.ts` returns `ipcRenderer.on(...)` (which returns `ipcRenderer`), but `vite-env.d.ts` and `preload.ts` declare return type as `void`.
3. In `App.tsx`, `useEffect` calls `onShortcut(cb)` without a return cleanup function.
4. When React re-renders or hot-reloads, `useEffect` runs again and registers another callback instance.
5. Every trigger of global shortcut `Cmd+J` causes `mainWindow.webContents.send('shortcut', 'toggle-copilot')`.
6. Multiple callback copies run simultaneously in the renderer, causing state oscillation (`setIsCopilotOpen(prev => !prev)` executing multiple times per keypress).

### 2.2 Main Process Window Lifecycle Leaks & Destroyed Object Errors (Question 2 & 3)
1. Closing the main browser window destroys the `BrowserWindow` instance and its `webContents`.
2. Because `mainWindow` is never set to `null` on window close (`mainWindow.on('closed')` missing), `mainWindow` holds a stale reference to a destroyed object.
3. If the user hits `Cmd+K` or `Cmd+J` after closing the window (or during window teardown), `mainWindow?.webContents.send(...)` is called.
4. Calling methods on a destroyed `webContents` throws `Error: Object has been destroyed`, crashing the main process or dumping unhandled errors to stderr.

### 2.3 Duplicate Session Event Listeners (Question 2)
1. `session.defaultSession` is created once per app execution.
2. `createWindow()` registers listeners (`will-download`, `onBeforeRequest`, `onHeadersReceived`) on `session.defaultSession`.
3. Re-creating a window (e.g. via `app.on('activate')`) calls `createWindow()` again.
4. `session.defaultSession.on('will-download')` attaches an additional callback.
5. Future file downloads execute all attached callbacks, multiplying download IPC messages sent to the renderer.

### 2.4 Unhandled Promise Rejections (Question 3)
1. When starting the app in dev mode, `mainWindow.loadURL(devUrl)` attempts to connect to `http://localhost:5173`.
2. If Vite dev server is still booting, `loadURL` rejects. The first `.catch` catches it and schedules `setTimeout(() => mainWindow?.loadURL(devUrl), 1000)`.
3. If the retry attempt also fails (e.g. port mismatch or slow boot), `mainWindow?.loadURL(devUrl)` inside `setTimeout` rejects with no `.catch()` handler, emitting an `UnhandledPromiseRejection`.

### 2.5 Bridge Type Insecurity (Question 4)
1. `ipcRenderer.on` passes `(event, ...args)` to its callback.
2. `preload.ts` exposes `(event: any, command: string) => void`. Exposing the raw `IpcRendererEvent` object across `contextBridge` breaks isolation best practices and pollutes renderer callback signatures.
3. `data: any` provides no type safety for download payload structure (`id`, `filename`, `url`, `receivedBytes`, `totalBytes`, `state`).

---

## 3. Caveats
- **E2E / Environment Assumptions**: Investigation conducted via static analysis, code trace, and TypeScript compiler checks (`npx tsc --noEmit`). No live GUI window was launched during this read-only phase.
- **Webview Internal Events**: `BrowserView.tsx` attaches DOM event listeners (`did-start-loading`, `did-stop-loading`, `page-title-updated`, `page-favicon-updated`) to the `<webview>` element. These are cleaned up on component unmount via `removeEventListener`. However, async execution in `extractPageText()` (`webview.executeJavaScript`) can complete after tab switch; an `isMounted` ref check should be added during implementation.

---

## 4. Conclusion & Recommendations

### Summary of Audit Findings
| # | Issue Description | Location | Severity | Impact |
|---|-------------------|----------|----------|--------|
| 1 | IPC listeners lack unmount cleanup return | `electron/preload.ts:5-6`, `src/App.tsx:112` | High | Memory leak & duplicate handler execution in renderer |
| 2 | `mainWindow` missing `closed` event cleanup | `electron/main.ts:8-26` | High | `Error: Object has been destroyed` on IPC send |
| 3 | Session listeners duplicated in `createWindow()` | `electron/main.ts:45-109` | Medium | Duplicate IPC events on app re-activation |
| 4 | Dangling `updated` listener on `DownloadItem` | `electron/main.ts:69-87` | Medium | EventEmitter leak per download item |
| 5 | Unhandled promise rejection in `loadURL` retry | `electron/main.ts:114` | Medium | Unhandled promise rejection crash in dev mode |
| 6 | Unbounded `fetch` in `check-ollama` handler | `electron/main.ts:151-163` | Low | Hung IPC call if Ollama service hangs |
| 7 | Renderer never subscribes to `download-update` | `src/App.tsx:65, 111` | Medium | Downloads modal never receives progress |
| 8 | Unsafe `any` types & exposed Electron `event` | `electron/preload.ts`, `src/vite-env.d.ts` | Low | Loose TS types & potential context bridge pollution |

---

### Concrete Proposed Fixes

#### Recommendation 1: Refactor `electron/preload.ts` & `src/vite-env.d.ts`
Return unsubscription functions from preload listeners and strip Electron `event` parameter:

**Proposed `electron/preload.ts`**:
```ts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  checkOllama: () => ipcRenderer.invoke('check-ollama'),
  onShortcut: (callback: (command: string) => void) => {
    const subscription = (_event: any, command: string) => callback(command);
    ipcRenderer.on('shortcut', subscription);
    return () => {
      ipcRenderer.removeListener('shortcut', subscription);
    };
  },
  onDownloadUpdate: (callback: (data: any) => void) => {
    const subscription = (_event: any, data: any) => callback(data);
    ipcRenderer.on('download-update', subscription);
    return () => {
      ipcRenderer.removeListener('download-update', subscription);
    };
  }
});
```

**Proposed `src/vite-env.d.ts`**:
```ts
/// <reference types="vite/client" />

export interface DownloadItemPayload {
  id: string;
  filename: string;
  url?: string;
  receivedBytes: number;
  totalBytes: number;
  state: 'progressing' | 'completed' | 'cancelled';
}

interface Window {
  electronAPI?: {
    checkOllama: () => Promise<{ available: boolean; models: string[] }>;
    onShortcut: (callback: (command: string) => void) => () => void;
    onDownloadUpdate: (callback: (data: DownloadItemPayload) => void) => () => void;
  };
}
```

#### Recommendation 2: Clean up IPC Listeners in `src/App.tsx`
Update `useEffect` in `App.tsx` to handle unmount cleanup and register `onDownloadUpdate`:

```tsx
  // Listen to IPC events from main process (Shortcuts & Downloads)
  useEffect(() => {
    if (!window.electronAPI) return;

    const cleanupShortcut = window.electronAPI.onShortcut((command: string) => {
      console.log('Shortcut received in React:', command);
      if (command === 'toggle-omnibox' || command === 'search') {
        setIsFindInPageOpen(false);
      } else if (command === 'toggle-copilot' || command === 'copilot') {
        setIsCopilotOpen(prev => !prev);
      }
    });

    const cleanupDownloads = window.electronAPI.onDownloadUpdate((data) => {
      setDownloads(prev => {
        const existingIdx = prev.findIndex(item => item.id === data.id);
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = { ...updated[existingIdx], ...data };
          return updated;
        }
        return [data, ...prev];
      });
    });

    return () => {
      cleanupShortcut();
      cleanupDownloads();
    };
  }, []);
```

#### Recommendation 3: Fix `mainWindow` Lifecycle, Session Listeners & Error Handling in `electron/main.ts`
1. Add `mainWindow.on('closed', () => { mainWindow = null; });`.
2. Move `session.defaultSession` setup out of `createWindow()` into `app.whenReady()`.
3. Clean up `item.removeAllListeners('updated')` in `item.once('done')`.
4. Add `.catch()` to `loadURL` retry.
5. Add `AbortSignal.timeout(3000)` to `check-ollama` fetch.

```ts
// Move session setup to single app initialization
app.whenReady().then(() => {
  // Session setup once
  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    const url = details.url.toLowerCase();
    const shouldBlock = AD_TRACKER_DOMAINS.some(domain => url.includes(domain));
    if (shouldBlock) return callback({ cancel: true });
    callback({});
  });

  session.defaultSession.on('will-download', (event, item) => {
    const downloadId = Date.now().toString();
    const filename = item.getFilename();
    const totalBytes = item.getTotalBytes();

    const sendProgress = (state: string) => {
      if (mainWindow && !mainWindow.isDestroyed() && !mainWindow.webContents.isDestroyed()) {
        mainWindow.webContents.send('download-update', {
          id: downloadId,
          filename,
          url: item.getURL(),
          receivedBytes: item.getReceivedBytes(),
          totalBytes,
          state
        });
      }
    };

    sendProgress('progressing');

    const onUpdated = (event: any, state: string) => {
      sendProgress(state === 'interrupted' ? 'cancelled' : 'progressing');
    };

    item.on('updated', onUpdated);

    item.once('done', (event, state) => {
      item.removeListener('updated', onUpdated);
      sendProgress(state === 'completed' ? 'completed' : 'cancelled');
    });
  });

  createWindow();
});
```

---

## 5. Verification Method

To independently verify the audit findings and subsequent implementation fixes:

1. **Type Safety & Build Verification**:
   ```bash
   npx tsc --noEmit
   npm run build
   ```
   *Expected outcome*: Zero TypeScript compilation errors when updating `vite-env.d.ts` and `preload.ts`.

2. **IPC Memory Leak & Cleanup Verification**:
   - Inspect `electron/preload.ts` to ensure `onShortcut` and `onDownloadUpdate` return a function calling `ipcRenderer.removeListener`.
   - Inspect `src/App.tsx` `useEffect` cleanup return to ensure returned unregister functions are invoked.

3. **Window Lifecycle Verification**:
   - Inspect `electron/main.ts` to verify `mainWindow.on('closed', () => { mainWindow = null; })` is present and all `mainWindow.webContents.send` calls are guarded by `mainWindow && !mainWindow.isDestroyed()`.

4. **Download Flow Verification**:
   - Verify `onDownloadUpdate` listener in `App.tsx` updates `downloads` state upon receiving IPC data.
