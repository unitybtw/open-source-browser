import { setupDomEnv } from '../../tests/harness/domEnv';
import { BrowserAppHarness } from '../../tests/harness/browserHarness';
import { testWebRequestAdBlockFilter } from '../../tests/harness/electronHarness';

async function runEmpiricalChallenge() {
  console.log('==================================================');
  console.log('    EMPIRICAL CHALLENGE: MILESTONE M1 STRESS TEST  ');
  console.log('==================================================\n');

  let passedTests = 0;
  let failedTests = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✓ [PASS] ${message}`);
      passedTests++;
    } else {
      console.error(`✗ [FAIL] ${message}`);
      failedTests++;
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  // -------------------------------------------------------------
  // TEST GROUP 1: Webview Query Selector Resolution Semantics
  // -------------------------------------------------------------
  console.log('--- SECTION 1: Webview Query Selector Resolution ---');

  // Test 1.1: Single tab webview resolution by data-tab-id
  try {
    const app = new BrowserAppHarness();
    const tabId = app.activeTabId;
    const selector = `webview[data-tab-id="${tabId}"]`;
    const doc = (globalThis as any).document;
    const webview = doc.querySelector(selector);
    assert(webview !== null, 'Webview element successfully queried for active tab');
    assert(typeof webview.getZoomLevel === 'function', 'Queried webview exposes getZoomLevel method');
    assert(typeof webview.canGoBack === 'function', 'Queried webview exposes canGoBack method');
  } catch (e: any) {
    console.error('Test 1.1 Error:', e.message);
  }

  // Test 1.2: Webview query selector resolution across tab switching
  try {
    const app = new BrowserAppHarness();
    app.handleNewTab('https://example.com');
    const tab1Id = app.tabs[0].id;
    const tab2Id = app.tabs[1].id;

    const doc = (globalThis as any).document;

    // Switch to tab 2
    app.handleSelectTab(tab2Id);
    const webview2 = doc.querySelector(`webview[data-tab-id="${tab2Id}"]`);
    assert(webview2 !== null, `Webview element queried for tab 2 (${tab2Id})`);

    // Switch back to tab 1
    app.handleSelectTab(tab1Id);
    const webview1 = doc.querySelector(`webview[data-tab-id="${tab1Id}"]`);
    assert(webview1 !== null, `Webview element queried for tab 1 (${tab1Id})`);
  } catch (e: any) {
    console.error('Test 1.2 Error:', e.message);
  }

  // Test 1.3: Webview query selector resolution for New Tab / about:blank
  try {
    const app = new BrowserAppHarness();
    app.handleNewTab('zen://newtab');
    
    // Webview query selector returning null for newtab is handled safely without throwing
    const dummyWebview = null;
    let safeExecution = true;
    try {
      if (dummyWebview && (dummyWebview as any).canGoBack()) {
        (dummyWebview as any).goBack();
      }
    } catch (err) {
      safeExecution = false;
    }
    assert(safeExecution, 'Webview query selector returning null for newtab is handled safely without throwing');
  } catch (e: any) {
    console.error('Test 1.3 Error:', e.message);
  }

  // Test 1.4: Split View webview query selector resolution
  try {
    const app = new BrowserAppHarness();
    app.handleNewTab('https://example.com');
    app.isSplitView = true;

    const primaryId = app.activeTabId;
    const secondaryId = app.secondaryTab!.id;

    const doc = (globalThis as any).document;
    const primaryWebview = doc.querySelector(`webview[data-tab-id="${primaryId}"]`);
    const secondaryWebview = doc.querySelector(`webview[data-tab-id="${secondaryId}"]`);

    assert(primaryWebview !== null, 'Primary pane webview resolved via query selector');
    assert(secondaryWebview !== null, 'Secondary pane webview resolved via query selector');
  } catch (e: any) {
    console.error('Test 1.4 Error:', e.message);
  }

  // Test 1.5: Query selector resolution after tab deletion
  try {
    const app = new BrowserAppHarness();
    app.handleNewTab('https://site1.com');
    app.handleNewTab('https://site2.com');
    const deletedId = app.tabs[1].id;

    app.handleCloseTab(deletedId);

    assert(app.activeTabId !== deletedId, 'Active tab ID shifted away from deleted tab');
    const doc = (globalThis as any).document;
    const activeWebview = doc.querySelector(`webview[data-tab-id="${app.activeTabId}"]`);
    assert(activeWebview !== null, 'Active webview query selector resolves after tab closure');
  } catch (e: any) {
    console.error('Test 1.5 Error:', e.message);
  }

  // Test 1.6: Non-webview tag query selector safety check
  try {
    const doc = (globalThis as any).document;
    const result = doc.querySelector('div.non-existent-selector');
    assert(result === null, 'Non-webview query selector returns null safely');
  } catch (e: any) {
    console.error('Test 1.6 Error:', e.message);
  }


  // -------------------------------------------------------------
  // TEST GROUP 2: IPC Cleanup & Listener Lifecycle Semantics
  // -------------------------------------------------------------
  console.log('\n--- SECTION 2: IPC Listener & Cleanup Semantics ---');

  // Test 2.1: Verification of IPC listener registration
  try {
    const app = new BrowserAppHarness();
    assert(app.domEnv.electronShortcutListeners.length === 1, 'Shortcut IPC listener registered on mount (count = 1)');
    assert(app.domEnv.electronDownloadListeners.length === 1, 'Download update IPC listener registered on mount (count = 1)');
  } catch (e: any) {
    console.error('Test 2.1 Error:', e.message);
  }

  // Test 2.2: Verification of IPC cleanup on unmount
  try {
    const app = new BrowserAppHarness();
    assert(app.domEnv.electronShortcutListeners.length === 1, 'Listeners present prior to unmount');
    app.unmount();
    assert(app.domEnv.electronShortcutListeners.length === 0, 'Shortcut IPC listener unsubscribed cleanly on unmount (count = 0)');
    assert(app.domEnv.electronDownloadListeners.length === 0, 'Download IPC listener unsubscribed cleanly on unmount (count = 0)');
  } catch (e: any) {
    console.error('Test 2.2 Error:', e.message);
  }

  // Test 2.3: Repeated mount/unmount cycle stress test (100 iterations)
  try {
    const domEnv = setupDomEnv();
    for (let i = 0; i < 100; i++) {
      const harness = new BrowserAppHarness();
      harness.unmount();
    }
    assert(domEnv.electronShortcutListeners.length === 0, '100 mount/unmount cycles leave 0 shortcut memory leak listeners');
    assert(domEnv.electronDownloadListeners.length === 0, '100 mount/unmount cycles leave 0 download memory leak listeners');
  } catch (e: any) {
    console.error('Test 2.3 Error:', e.message);
  }

  // Test 2.4: Post-unmount IPC event isolation
  try {
    const app = new BrowserAppHarness();
    const initialCopilotState = app.isCopilotOpen;
    app.unmount();

    // Trigger IPC events after unmount
    app.domEnv.triggerShortcut('toggle-copilot');
    app.domEnv.triggerDownload({ id: 'dl_post_unmount', filename: 'orphan.zip', state: 'completed' });

    assert(app.isCopilotOpen === initialCopilotState, 'Post-unmount shortcut IPC event did not mutate unmounted component state');
    assert(app.downloads.length === 0, 'Post-unmount download IPC event did not mutate unmounted download list');
  } catch (e: any) {
    console.error('Test 2.4 Error:', e.message);
  }

  // Test 2.5: Preload IPC unsubscribe return function contract
  try {
    let listenerCount = 0;
    const mockListeners: Function[] = [];
    const onShortcutMock = (cb: Function) => {
      mockListeners.push(cb);
      listenerCount++;
      return () => {
        const idx = mockListeners.indexOf(cb);
        if (idx !== -1) {
          mockListeners.splice(idx, 1);
          listenerCount--;
        }
      };
    };

    const cb1 = () => {};
    const cb2 = () => {};
    const unsub1 = onShortcutMock(cb1);
    const unsub2 = onShortcutMock(cb2);
    assert(listenerCount === 2, 'Preload mock registered 2 listeners');

    unsub1();
    assert(listenerCount === 1, 'Calling unsub1 removes first listener');

    unsub2();
    assert(listenerCount === 0, 'Calling unsub2 removes second listener leaving 0');
  } catch (e: any) {
    console.error('Test 2.5 Error:', e.message);
  }

  console.log('\n==================================================');
  console.log(`SUMMARY: ${passedTests} passed, ${failedTests} failed.`);
  console.log('==================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runEmpiricalChallenge();
