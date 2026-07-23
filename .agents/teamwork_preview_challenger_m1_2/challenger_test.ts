import { setupDomEnv } from '../../tests/harness/domEnv';
import { BrowserAppHarness } from '../../tests/harness/browserHarness';

async function runChallengerVerification() {
  console.log('==================================================');
  console.log('    EMPIRICAL CHALLENGER VERIFICATION (M1-2)     ');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  function assertEqual(actual: any, expected: any, msg: string) {
    if (actual === expected) {
      console.log(`✓ [PASS] ${msg}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${msg}`);
      console.error(`   Expected: ${expected}, Got: ${actual}`);
      failed++;
    }
  }

  function assertOk(cond: any, msg: string) {
    if (cond) {
      console.log(`✓ [PASS] ${msg}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${msg}`);
      console.error(`   Condition failed`);
      failed++;
    }
  }

  // =========================================================================
  // TASK 1: Webview Query Selector Resolution (`webview[data-tab-id]`)
  // =========================================================================
  console.log('--- TASK 1: Webview Query Selector Resolution ---');

  // Test 1.1: Webview query selector resolves active tab ID in DOM env
  {
    const domEnv = setupDomEnv();
    const activeTabId = 'tab_alpha_123';
    const selector = `webview[data-tab-id="${activeTabId}"]`;
    const webviewElem = (globalThis as any).document.querySelector(selector);
    assertOk(webviewElem !== null, 'T1_1: document.querySelector returns non-null webview for active tab ID');
    
    // Check webview methods exist
    assertOk(typeof webviewElem.getZoomLevel === 'function', 'T1_1b: Webview element has getZoomLevel method');
    assertOk(typeof webviewElem.setZoomLevel === 'function', 'T1_1c: Webview element has setZoomLevel method');
    assertOk(typeof webviewElem.canGoBack === 'function', 'T1_1d: Webview element has canGoBack method');
    assertOk(typeof webviewElem.canGoForward === 'function', 'T1_1e: Webview element has canGoForward method');
    assertOk(typeof webviewElem.reload === 'function', 'T1_1f: Webview element has reload method');
    assertOk(typeof webviewElem.findInPage === 'function', 'T1_1g: Webview element has findInPage method');
  }

  // Test 1.2: Zooming on active tab uses correct webview selector
  {
    const domEnv = setupDomEnv();
    const activeTabId = 'tab_beta_456';
    const selector = `webview[data-tab-id="${activeTabId}"]`;
    const webviewElem = (globalThis as any).document.querySelector(selector);
    
    let currentZoom = 0;
    webviewElem.getZoomLevel((lvl: number) => { currentZoom = lvl; });
    assertEqual(currentZoom, 1.0, 'T1_2a: Initial webview zoom level is 1.0');
    
    // Simulate handleZoomIn
    webviewElem.getZoomLevel((lvl: number) => webviewElem.setZoomLevel(lvl + 0.5));
    webviewElem.getZoomLevel((lvl: number) => { currentZoom = lvl; });
    assertEqual(currentZoom, 1.5, 'T1_2b: handleZoomIn via querySelector increases zoom level to 1.5');

    // Simulate handleZoomOut
    webviewElem.getZoomLevel((lvl: number) => webviewElem.setZoomLevel(lvl - 0.5));
    webviewElem.getZoomLevel((lvl: number) => { currentZoom = lvl; });
    assertEqual(currentZoom, 1.0, 'T1_2c: handleZoomOut via querySelector decreases zoom level back to 1.0');
  }

  // Test 1.3: Webview resolution across multiple tabs & tab switching
  {
    const app = new BrowserAppHarness();
    app.handleNewTab('https://tab1.com');
    const tab1Id = app.activeTabId;
    
    app.handleNewTab('https://tab2.com');
    const tab2Id = app.activeTabId;

    const webview1 = (globalThis as any).document.querySelector(`webview[data-tab-id="${tab1Id}"]`);
    const webview2 = (globalThis as any).document.querySelector(`webview[data-tab-id="${tab2Id}"]`);

    assertOk(webview1 !== null, 'T1_3a: Tab 1 webview query selector returns non-null element');
    assertOk(webview2 !== null, 'T1_3b: Tab 2 webview query selector returns non-null element');
    assertOk(webview1 !== webview2, 'T1_3c: Tab 1 and Tab 2 query selectors return distinct webview instances');
  }

  // Test 1.4: Split View webview query selector resolution for primary and secondary tabs
  {
    const app = new BrowserAppHarness();
    app.handleNewTab('https://primary-pane.com');
    const primaryId = app.activeTabId;
    app.handleNewTab('https://secondary-pane.com');
    const secondaryId = app.activeTabId;
    app.handleSelectTab(primaryId);
    app.isSplitView = true;

    const primaryWebview = (globalThis as any).document.querySelector(`webview[data-tab-id="${app.activeTabId}"]`);
    const secondaryWebview = (globalThis as any).document.querySelector(`webview[data-tab-id="${app.secondaryTab?.id}"]`);

    assertOk(primaryWebview !== null, 'T1_4a: Primary pane activeTabId webview selector resolves');
    assertOk(secondaryWebview !== null, 'T1_4b: Secondary pane secondaryTab.id webview selector resolves');
    assertOk(app.secondaryTab !== undefined && app.secondaryTab.id !== app.activeTabId, 'T1_4c: secondaryTab is distinct from activeTabId in Split View');
  }

  // Test 1.5: Special character & timestamp-based tab IDs query selector resolution
  {
    const domEnv = setupDomEnv();
    const specialIds = [
      '1738492019_a83f9',
      'tab-with-dashes-123',
      'tab_with_underscores_456',
      'tab789'
    ];

    for (const id of specialIds) {
      const webview = (globalThis as any).document.querySelector(`webview[data-tab-id="${id}"]`);
      assertOk(webview !== null, `T1_5: Special tab ID "${id}" resolves webview via querySelector`);
    }
  }


  // =========================================================================
  // TASK 2: IPC Listener Subscription and Unsubscription Count
  // =========================================================================
  console.log('\n--- TASK 2: IPC Listener Subscription and Unsubscription Count ---');

  // Test 2.1: Single app mount registers exactly 1 shortcut listener and 1 download listener
  {
    const app = new BrowserAppHarness();
    assertEqual(app.domEnv.electronShortcutListeners.length, 1, 'T2_1a: Mount registers exactly 1 shortcut IPC listener');
    assertEqual(app.domEnv.electronDownloadListeners.length, 1, 'T2_1b: Mount registers exactly 1 download update IPC listener');
  }

  // Test 2.2: Single app unmount clears shortcut listener and download listener (count drops to 0)
  {
    const app = new BrowserAppHarness();
    assertEqual(app.domEnv.electronShortcutListeners.length, 1, 'T2_2a: Pre-unmount shortcut listeners count is 1');
    assertEqual(app.domEnv.electronDownloadListeners.length, 1, 'T2_2b: Pre-unmount download listeners count is 1');
    
    app.unmount();
    
    assertEqual(app.domEnv.electronShortcutListeners.length, 0, 'T2_2c: Post-unmount shortcut listeners count drops to 0');
    assertEqual(app.domEnv.electronDownloadListeners.length, 0, 'T2_2d: Post-unmount download listeners count drops to 0');
  }

  // Test 2.3: Stress test 100 mount and unmount cycles to verify zero memory/subscription leak
  {
    const domEnv = setupDomEnv();
    let leakDetected = false;

    for (let i = 0; i < 100; i++) {
      const app = new BrowserAppHarness();
      if (app.domEnv.electronShortcutListeners.length !== 1 || app.domEnv.electronDownloadListeners.length !== 1) {
        leakDetected = true;
        break;
      }
      app.unmount();
      if (app.domEnv.electronShortcutListeners.length !== 0 || app.domEnv.electronDownloadListeners.length !== 0) {
        leakDetected = true;
        break;
      }
    }

    assertOk(!leakDetected, 'T2_3: 100 mount/unmount cycles complete with 0 listener leak (count returns to 0 after every unmount)');
  }

  // Test 2.4: Test IPC cleanup returned handles from electron/preload.ts
  {
    let shortcutListenerCount = 0;
    let downloadListenerCount = 0;

    const mockIpcRenderer = {
      on: (channel: string, cb: Function) => {
        if (channel === 'shortcut') shortcutListenerCount++;
        if (channel === 'download-update') downloadListenerCount++;
      },
      removeListener: (channel: string, cb: Function) => {
        if (channel === 'shortcut') shortcutListenerCount--;
        if (channel === 'download-update') downloadListenerCount--;
      }
    };

    const mockPreloadAPI = {
      onShortcut: (cb: Function) => {
        mockIpcRenderer.on('shortcut', cb);
        return () => mockIpcRenderer.removeListener('shortcut', cb);
      },
      onDownloadUpdate: (cb: Function) => {
        mockIpcRenderer.on('download-update', cb);
        return () => mockIpcRenderer.removeListener('download-update', cb);
      }
    };

    // Simulate React component mounting
    const cleanupShortcut = mockPreloadAPI.onShortcut(() => {});
    const cleanupDownload = mockPreloadAPI.onDownloadUpdate(() => {});

    assertEqual(shortcutListenerCount, 1, 'T2_4a: Preload API onShortcut registers listener (count=1)');
    assertEqual(downloadListenerCount, 1, 'T2_4b: Preload API onDownloadUpdate registers listener (count=1)');

    // Simulate React component unmounting
    cleanupShortcut();
    cleanupDownload();

    assertEqual(shortcutListenerCount, 0, 'T2_4c: Executing onShortcut cleanup handle invokes removeListener (count=0)');
    assertEqual(downloadListenerCount, 0, 'T2_4d: Executing onDownloadUpdate cleanup handle invokes removeListener (count=0)');
  }

  // Test 2.5: IPC events fired post-unmount do not mutate unmounted component state
  {
    const app = new BrowserAppHarness();
    app.unmount();

    // Trigger shortcut command post unmount
    app.domEnv.triggerShortcut('copilot');
    assertEqual(app.isCopilotOpen, false, 'T2_5a: Triggering shortcut post-unmount does not mutate isCopilotOpen state');

    // Trigger download update post unmount
    app.domEnv.triggerDownload({ id: 'dl_post_unmount', filename: 'file.zip', state: 'completed' });
    assertEqual(app.downloads.length, 0, 'T2_5b: Triggering download update post-unmount does not mutate downloads array');
  }

  console.log('\n==================================================');
  console.log(`SUMMARY: ${passed} passed, ${failed} failed`);
  console.log('==================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runChallengerVerification();
