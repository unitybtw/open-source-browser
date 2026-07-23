## 2026-07-22T07:56:35Z
You are an Implementation Worker executing Milestone M1: R1 Bug Fixes & Code Health Audit for the Open Source Browser project.
Working directory: /Users/siracsimsek/Desktop/open source browser/.agents/worker_m1_bugfixes
Workspace root: /Users/siracsimsek/Desktop/open source browser
Project Index: /Users/siracsimsek/Desktop/open source browser/PROJECT.md
User Request Record: /Users/siracsimsek/Desktop/open source browser/.agents/ORIGINAL_REQUEST.md
Explorer Reports:
- /Users/siracsimsek/Desktop/open source browser/.agents/teamwork_preview_explorer_m1_2/handoff.md
- /Users/siracsimsek/Desktop/open source browser/.agents/teamwork_preview_explorer_m1_3/handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your Tasks for Milestone M1:
1. `<webview data-tab-id>` Wiring (`src/components/BrowserView.tsx`):
   Add `data-tab-id={tab.id}` to the `<webview>` element so `document.querySelector('webview[data-tab-id="${activeTabId}"]')` in `App.tsx` correctly resolves the active tab's webview instance for zoom, reload, navigation, and find-in-page.
2. Complete Webview Event Listener Suite & Cleanups (`src/components/BrowserView.tsx`):
   Attach listeners for `did-start-loading`, `did-stop-loading`, `did-fail-load`, `did-navigate`, `did-navigate-in-page`, `page-title-updated`, `page-favicon-updated`, `new-window`, `crashed`, and `found-in-page`.
   Ensure ALL listeners are cleanly detached in the `useEffect` cleanup return function.
   Handle SPA client-side routing, loading failures (`isLoading: false`), popups (`onNewTab`), crashes, and find-in-page matches.
3. IPC Listener Teardown & Subscriptions (`electron/preload.ts`, `src/App.tsx`, `src/components/DownloadsModal.tsx`):
   Update `electron/preload.ts` so `onShortcut` and `onDownloadUpdate` return cleanup functions (`ipcRenderer.removeListener`).
   In `App.tsx`, detach IPC listeners on unmount in `useEffect`. Subscribe to `onDownloadUpdate` to populate `downloads` state.
4. Incognito History Data Leak Prevention (`src/App.tsx`):
   Ensure `handleUpdateTab` and history persistence logic strictly check `!tab.isIncognito` before adding URL/title entries to `history` or `localStorage`.
5. Split View Dual Webview DOM Mounting Fix (`src/App.tsx`):
   Prevent duplicate `<BrowserView>` DOM mounting for `secondaryTabId`. Ensure only one active `<BrowserView>` instance exists per tab ID in Split Screen mode.
6. Stale Closure Prevention:
   Refactor tab state operations in `App.tsx` (`handleCloseTab`, `handleNavigate`, `handleUpdateTab`) to use functional state updates (`setTabs(prev => ...)`).
7. Verification:
   Run `npm run build` and `npm test` (or `npm run test:e2e`). Ensure clean build with 0 TypeScript/Vite errors and 116/116 test pass.

Write a detailed handoff report to `/Users/siracsimsek/Desktop/open source browser/.agents/worker_m1_bugfixes/handoff.md` and update `progress.md`.
